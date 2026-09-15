#include "CommandClient.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <cstring>

#include "AppConfig.h"
#include "DeviceResponseValidator.h"
#include "NvsConfig.h"
#include "PowerPolicy.h"

CommandClient::CommandClient(Logger& logger, const NodeHealth& health, PumpActuator& pump, ApiClient& api)
    : logger_(logger), health_(health), pump_(pump), api_(api) {}

void CommandClient::begin() {
  if (shouldPoll()) {
    pollCommands();
  }
}

void CommandClient::loop() {
  pump_.loop();

  if (activePumpCommandId_.length() > 0 && pump_.consumeCompletion()) {
    activePumpAckPending_ = true;
  }

  if (activePumpAckPending_ && activePumpCommandId_.length() > 0 && !pump_.isRunning()) {
    if (acknowledgeCommand(activePumpCommandId_, "completed", "pump completed")) {
      api_.publishLog("watering", "Watering done", "info");
      activePumpCommandId_ = "";
      activePumpAckPending_ = false;
    }
  }

  if (!shouldPoll()) return;
  pollCommands();
}

bool CommandClient::pollNow() {
  const bool canPoll = NvsConfig::getServerUrl().length() > 0 &&
                       NvsConfig::getNodeId().length() > 0 &&
                       health_.isWifiConnected();
  if (!canPoll) {
    return false;
  }

  return pollCommands();
}

bool CommandClient::hasPendingWork() const {
  return pump_.isRunning() || activePumpCommandId_.length() > 0 || activePumpAckPending_;
}

bool CommandClient::shouldPoll() const {
  if (NvsConfig::getServerUrl().length() == 0) return false;
  if (NvsConfig::getNodeId().length() == 0) return false;
  if (!health_.isWifiConnected()) return false;
  return millis() - lastPollAt_ >= NvsConfig::getQueueIntervalMs();
}

String CommandClient::commandsUrl() const {
  String base = NvsConfig::getServerUrl();
  if (base.length() == 0) return "";
  if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
  return base + "/api/nodes/" + NvsConfig::getNodeId() + "/commands";
}

String CommandClient::ackUrl(const String& commandId) const {
  String url = commandsUrl();
  if (url.length() == 0) return "";
  return url + "/" + commandId + "/ack";
}

bool CommandClient::pollCommands() {
  const String url = commandsUrl();
  if (url.length() == 0) return false;

  lastPollAt_ = millis();

  HTTPClient http;
  http.setTimeout(2000);
  if (!http.begin(url)) {
    logger_.info("commands: begin failed");
    return false;
  }

  const int statusCode = http.GET();
  if (statusCode < 0) {
    Serial.printf("commands error=%s target=%s\n", http.errorToString(statusCode).c_str(), url.c_str());
    http.end();
    return false;
  }

  if (statusCode < 200 || statusCode >= 300) {
    Serial.printf("commands status=%d target=%s\n", statusCode, url.c_str());
    http.end();
    return false;
  }

  const String response = http.getString();
  http.end();
  if (response.length() == 0) return false;

  StaticJsonDocument<1024> doc;
  if (deserializeJson(doc, response) != DeserializationError::Ok) {
    Serial.println("commands status=invalid_json");
    return false;
  }

  if (!DeviceResponseValidator::queue(doc.as<JsonVariantConst>(), NvsConfig::getNodeId().c_str())) {
    logger_.info("commands: invalid response identity or capability");
    return false;
  }
  NvsConfig::setNodeCapability(doc["capability"].as<const char*>());
  JsonArray commands = doc["commands"].as<JsonArray>();

  for (JsonObject command : commands) {
    const String commandId = command["commandId"] | "";
    const char* type = command["type"] | "";
    const JsonObject payload = command["payload"].as<JsonObject>();

    if (commandId.length() == 0) {
      continue;
    }

    logCommandReceived(commandId, type);

    if (std::strcmp(type, "pump") == 0) {
      if (activePumpCommandId_.length() > 0 && activePumpCommandId_ != commandId) {
        continue;
      }

      if (activePumpCommandId_.length() == 0 && !pump_.isRunning()) {
        if (processCommand(commandId, payload["durationMs"] | 0)) {
          activePumpCommandId_ = commandId;
          activePumpAckPending_ = true;
        }
      }
      continue;
    }

    if (std::strcmp(type, "power-profile") == 0) {
      if (!payload["intervalMs"].is<unsigned long>()) {
        acknowledgeCommand(commandId, "failed", "invalid power profile payload");
        continue;
      }
      processPowerProfileCommand(commandId, payload["intervalMs"].as<unsigned long>());
      continue;
    }

    acknowledgeCommand(commandId, "failed", "unsupported command type");
  }
  return true;
}

bool CommandClient::processCommand(const String& commandId, unsigned long durationMs) {
  const bool success = pump_.start(durationMs);
  if (!success) {
    acknowledgeCommand(commandId, "failed", "pump start failed");
    return false;
  }

  api_.publishLog("watering", "Watering started", "info");

  return true;
}

void CommandClient::processPowerProfileCommand(
    const String& commandId,
    unsigned long intervalMs) {
  if (!PowerPolicy::isValidInterval(intervalMs)) {
    acknowledgeCommand(commandId, "failed", "invalid power profile payload");
    return;
  }

  if (!NvsConfig::setIntervalMs(intervalMs)) {
    acknowledgeCommand(commandId, "failed", "power profile storage failed");
    return;
  }
  logger_.info("cadence: persisted and applied");
  acknowledgeCommand(commandId, "completed", "power profile applied");
}

bool CommandClient::acknowledgeCommand(const String& commandId, const char* result, const char* message) {
  const String url = ackUrl(commandId);
  if (url.length() == 0) return false;

  StaticJsonDocument<256> doc;
  doc["result"] = result;
  if (message != nullptr && std::strlen(message) > 0) {
    doc["message"] = message;
  }

  String body;
  serializeJson(doc, body);
  return api_.postJson("command-ack", url, body) == ApiClient::HttpPostResult::Success;
}

void CommandClient::logCommandReceived(const String& commandId, const char* type) {
  StaticJsonDocument<128> doc;
  doc["commandId"] = commandId;
  doc["type"] = type;

  String meta;
  serializeJson(doc, meta);
  api_.publishLog("command-queue", "Command received", "info", meta.c_str());
}

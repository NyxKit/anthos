#include "CommandClient.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <cstring>

#include "AppConfig.h"
#include "NvsConfig.h"

CommandClient::CommandClient(Logger& logger, const NodeHealth& health, PumpActuator& pump)
    : logger_(logger), health_(health), pump_(pump) {}

void CommandClient::begin() {
  if (shouldPoll()) {
    pollCommands();
  }
}

void CommandClient::loop() {
  if (!shouldPoll()) return;
  pollCommands();
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

void CommandClient::pollCommands() {
  const String url = commandsUrl();
  if (url.length() == 0) return;

  lastPollAt_ = millis();

  HTTPClient http;
  http.setTimeout(2000);
  if (!http.begin(url)) {
    logger_.info("commands: begin failed");
    return;
  }

  const int statusCode = http.GET();
  if (statusCode < 0) {
    Serial.printf("commands error=%s target=%s\n", http.errorToString(statusCode).c_str(), url.c_str());
    http.end();
    return;
  }

  if (statusCode < 200 || statusCode >= 300) {
    Serial.printf("commands status=%d target=%s\n", statusCode, url.c_str());
    http.end();
    return;
  }

  const String response = http.getString();
  http.end();
  if (response.length() == 0) return;

  StaticJsonDocument<1024> doc;
  if (deserializeJson(doc, response) != DeserializationError::Ok) {
    Serial.println("commands status=invalid_json");
    return;
  }

  JsonArray commands = doc["commands"].as<JsonArray>();
  if (!doc["commands"].is<JsonArray>()) {
    return;
  }

  const String capability = doc["capability"] | "earth";
  NvsConfig::setNodeCapability(capability == "watering" ? "watering" : "earth");

  for (JsonObject command : commands) {
    const String commandId = command["commandId"] | "";
    const char* type = command["type"] | "";
    const JsonObject payload = command["payload"].as<JsonObject>();

    if (commandId.length() == 0) {
      continue;
    }

    if (std::strcmp(type, "pump") == 0) {
      processCommand(commandId, payload["durationMs"] | 0);
      continue;
    }

    if (std::strcmp(type, "power-profile") == 0) {
      processPowerProfileCommand(
        commandId,
        payload["readIntervalMs"] | 0,
        payload["telemetryIntervalMs"] | 0,
        payload["queueIntervalMs"] | 0
      );
      continue;
    }

    acknowledgeCommand(commandId, "failed", "unsupported command type");
  }
}

void CommandClient::processCommand(const String& commandId, unsigned long durationMs) {
  const bool success = pump_.run(durationMs);
  acknowledgeCommand(commandId, success ? "completed" : "failed", success ? "" : "pump run failed");
}

void CommandClient::processPowerProfileCommand(
    const String& commandId,
    unsigned long readIntervalMs,
    unsigned long telemetryIntervalMs,
    unsigned long queueIntervalMs) {
  if (readIntervalMs == 0 || telemetryIntervalMs == 0 || queueIntervalMs == 0) {
    acknowledgeCommand(commandId, "failed", "invalid power profile payload");
    return;
  }

  NvsConfig::setReadIntervalMs(readIntervalMs);
  NvsConfig::setTelemetryIntervalMs(telemetryIntervalMs);
  NvsConfig::setQueueIntervalMs(queueIntervalMs);
  Serial.printf("cadence status=applied read_ms=%lu telemetry_ms=%lu queue_ms=%lu\n", readIntervalMs, telemetryIntervalMs, queueIntervalMs);
  acknowledgeCommand(commandId, "completed", "power profile applied");
}

bool CommandClient::acknowledgeCommand(const String& commandId, const char* result, const char* message) {
  const String url = ackUrl(commandId);
  if (url.length() == 0) return false;

  HTTPClient http;
  http.setTimeout(2000);
  if (!http.begin(url)) {
    logger_.info("commands: ack begin failed");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<256> doc;
  doc["result"] = result;
  if (message != nullptr && std::strlen(message) > 0) {
    doc["message"] = message;
  }

  String body;
  serializeJson(doc, body);
  const int statusCode = http.POST(body);
  if (statusCode < 0) {
    Serial.printf("commands ack_error=%s command=%s\n", http.errorToString(statusCode).c_str(), commandId.c_str());
    http.end();
    return false;
  }

  Serial.printf("commands ack_status=%d command=%s result=%s\n", statusCode, commandId.c_str(), result);
  http.end();
  return statusCode >= 200 && statusCode < 300;
}

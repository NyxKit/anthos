#include "ApiClient.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <cstring>

#include "AppConfig.h"
#include "BleProvisioning.h"
#include "NvsConfig.h"

ApiClient::ApiClient(Logger& logger, const NodeHealth& health, SensorManager& sensors)
    : logger_(logger), health_(health), sensors_(sensors) {}

void ApiClient::begin() {
  publishHeartbeat();
}

void ApiClient::loop() {
  // Telemetry publishing only; command polling is handled separately.
  if (!shouldPublish()) return;
  publishHeartbeat();
}

bool ApiClient::consumeSuccessfulPublish() {
  if (!successfulPublishPending_) {
    return false;
  }

  successfulPublishPending_ = false;
  return true;
}

bool ApiClient::hasSuccessfulPublish() const {
  return successfulPublishPending_;
}

bool ApiClient::shouldPublish() const {
  if (NvsConfig::getServerUrl().length() == 0) return false;
  if (!health_.isWifiConnected()) return false;
  return millis() - lastPublishAt_ >= NvsConfig::getTelemetryIntervalMs();
}

String ApiClient::buildPayload() const {
  const auto snapshot = health_.snapshot();
  const String nodeId = NvsConfig::getNodeId();

  StaticJsonDocument<512> doc;
  doc["nodeId"]    = nodeId.length() > 0 ? nodeId.c_str() : "unregistered";
  doc["hwId"]     = BleProvisioning::getHwId();
  doc["timestampMs"] = millis();

  doc["health"]["wifi"]     = snapshot.wifiStatus;
  doc["health"]["ip"]       = snapshot.ipAddress;
  doc["health"]["rssi"]     = snapshot.rssi;
  doc["health"]["server"]   = NvsConfig::getServerUrl().length() > 0 ? "configured" : "not_configured";
  doc["health"]["target"]   = NvsConfig::getServerUrl().c_str();
  doc["health"]["uptimeMs"] = snapshot.uptimeMs;
  doc["health"]["latencyMs"] = lastNetworkLatencyMs_;

  String sensorJson = sensors_.readAllJson();
  StaticJsonDocument<512> sensorDoc;
  deserializeJson(sensorDoc, sensorJson);
  JsonArray sensorArray = doc["sensors"].to<JsonArray>();
  if (sensorDoc.is<JsonArray>()) {
    for (JsonObject item : sensorDoc.as<JsonArray>()) {
      JsonObject s = sensorArray.add<JsonObject>();
      s["type"]  = item["type"].as<const char*>();
      s["value"] = item["value"].as<double>();
      s["unit"]  = item["unit"].as<const char*>();
    }
  }

  String payload;
  serializeJson(doc, payload);
  return payload;
}

String ApiClient::ingestUrl() const {
  String base = NvsConfig::getServerUrl();
  if (base.length() == 0) return "";
  // Strip trailing slash if present
  if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
  return base + "/api/ingest";
}

String ApiClient::logsUrl() const {
  String base = NvsConfig::getServerUrl();
  if (base.length() == 0) return "";
  if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
  return base + "/api/logs";
}

ApiClient::HttpPostResult ApiClient::postJson(const char* label, const String& url, const String& payload) {
  HTTPClient http;
  http.setTimeout(2000);
  if (!http.begin(url)) {
    Serial.printf("%s begin failed target=%s\n", label, url.c_str());
    return HttpPostResult::NetworkError;
  }

  http.addHeader("Content-Type", "application/json");
  const int statusCode = http.POST(payload);
  if (statusCode < 0) {
    Serial.printf("%s error=%s target=%s\n", label, http.errorToString(statusCode).c_str(), url.c_str());
    http.end();
    return HttpPostResult::NetworkError;
  }

  Serial.printf("%s status=%d target=%s\n", label, statusCode, url.c_str());
  // The current split is actually clearer:
  // - < 0 = network/client error
  // - 200-299 = success
  // - everything else = HTTP failure
  http.end();
  if (statusCode >= 200 && statusCode < 300) {
    return HttpPostResult::Success;
  }

  return HttpPostResult::HttpFailure;
}

bool ApiClient::publishLog(const char* source, const char* message, const char* level, const char* metaJson) {
  if (NvsConfig::getServerUrl().length() == 0) return false;
  if (!health_.isWifiConnected()) return false;

  StaticJsonDocument<256> doc;
  doc["nodeId"] = NvsConfig::hasNodeId() ? NvsConfig::getNodeId().c_str() : nullptr;
  doc["source"] = source;
  doc["level"] = level;
  doc["message"] = message;
  doc["timestampMs"] = millis();
  if (metaJson != nullptr && std::strlen(metaJson) > 0) {
    StaticJsonDocument<128> meta;
    if (deserializeJson(meta, metaJson) == DeserializationError::Ok) {
      doc["meta"] = meta.as<JsonObjectConst>();
    }
  }

  String payload;
  serializeJson(doc, payload);
  return postJson("logs", logsUrl(), payload) == HttpPostResult::Success;
}

bool ApiClient::publishHeartbeat() {
  const String url = ingestUrl();
  if (url.length() == 0) return false;

  lastPublishAt_ = millis();
  if (!health_.isWifiConnected()) return false;

  const unsigned long startedAt = millis();
  HTTPClient http;
  http.setTimeout(2000);
  if (!http.begin(url)) {
    logger_.info("api: begin failed");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  const int statusCode = http.POST(buildPayload());
  lastNetworkLatencyMs_ = millis() - startedAt;
  if (statusCode < 0) {
    Serial.printf("api error=%s target=%s\n", http.errorToString(statusCode).c_str(), url.c_str());
    http.end();
    return false;
  }

  Serial.printf("api status=%d target=%s\n", statusCode, url.c_str());
  // The current split is actually clearer:
  // - < 0 = network/client error
  // - 200-299 = success
  // - everything else = HTTP failure
  if (statusCode < 200 || statusCode >= 300) {
    http.end();
    return false;
  }

  const String response = http.getString();
  if (response.length() > 0) {
    StaticJsonDocument<128> resp;
    if (deserializeJson(resp, response) == DeserializationError::Ok) {
      const String assignedNodeId = resp["nodeId"] | "";
      if (assignedNodeId.length() > 0 && assignedNodeId != NvsConfig::getNodeId()) {
        NvsConfig::setNodeId(assignedNodeId);
        Serial.printf("[API] Synced node_id=%s from ingest response\n", assignedNodeId.c_str());
      }

      const String capability = resp["capability"] | "earth";
      NvsConfig::setNodeCapability(capability == "watering" ? "watering" : "earth");
    }
  }

  http.end();
  successfulPublishPending_ = true;
  return true;
}

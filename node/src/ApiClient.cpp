#include "ApiClient.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>

#include "AppConfig.h"
#include "NvsConfig.h"

ApiClient::ApiClient(Logger& logger, const NodeHealth& health, SensorManager& sensors)
    : logger_(logger), health_(health), sensors_(sensors) {}

void ApiClient::begin() {
  publishHeartbeat();
}

void ApiClient::loop() {
  if (!shouldPublish()) return;
  publishHeartbeat();
}

bool ApiClient::shouldPublish() const {
  if (NvsConfig::getServerUrl().length() == 0) return false;
  if (!health_.isWifiConnected()) return false;
  return millis() - lastPublishAt_ >= kAppConfig.pushIntervalMs;
}

String ApiClient::buildPayload() const {
  const auto snapshot = health_.snapshot();
  const String nodeId = NvsConfig::getNodeId();

  StaticJsonDocument<512> doc;
  doc["nodeId"]    = nodeId.length() > 0 ? nodeId.c_str() : "unregistered";
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

void ApiClient::publishHeartbeat() {
  const String url = ingestUrl();
  if (url.length() == 0) return;

  lastPublishAt_ = millis();
  if (!health_.isWifiConnected()) return;

  HTTPClient http;
  http.setTimeout(2000);
  if (!http.begin(url)) {
    logger_.info("api: begin failed");
    return;
  }

  http.addHeader("Content-Type", "application/json");
  const unsigned long startedAt = millis();
  const int statusCode = http.POST(buildPayload());
  lastNetworkLatencyMs_ = millis() - startedAt;
  if (statusCode < 0) {
    Serial.printf("api error=%s target=%s\n", http.errorToString(statusCode).c_str(), url.c_str());
  } else {
    Serial.printf("api status=%d target=%s\n", statusCode, url.c_str());
  }
  http.end();
}

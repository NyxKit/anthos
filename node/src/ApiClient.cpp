#include "ApiClient.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>

#include "AppConfig.h"

ApiClient::ApiClient(Logger& logger, const NodeHealth& health, SensorManager& sensors)
    : logger_(logger), health_(health), sensors_(sensors) {
}

void ApiClient::begin() {
  publishHeartbeat();
}

void ApiClient::loop() {
  if (!shouldPublish()) {
    return;
  }

  publishHeartbeat();
}

bool ApiClient::shouldPublish() const {
  if (!health_.hasServerTarget()) {
    return false;
  }

  if (!health_.isWifiConnected()) {
    return false;
  }

  return millis() - lastPublishAt_ >= kAppConfig.api.pushIntervalMs;
}

String ApiClient::buildPayload() const {
  const auto snapshot = health_.snapshot();

  StaticJsonDocument<512> doc;
  doc["nodeId"] = kAppConfig.nodeId;
  doc["timestampMs"] = millis();

  doc["health"]["wifi"] = snapshot.wifiStatus;
  doc["health"]["ip"] = snapshot.ipAddress;
  doc["health"]["rssi"] = snapshot.rssi;
  doc["health"]["server"] = snapshot.serverStatus;
  doc["health"]["target"] = snapshot.serverHost;
  doc["health"]["uptimeMs"] = snapshot.uptimeMs;

  String sensorJson = sensors_.readAllJson();
  StaticJsonDocument<512> sensorDoc;
  deserializeJson(sensorDoc, sensorJson);
  JsonArray sensorArray = doc["sensors"].to<JsonArray>();
  if (sensorDoc.is<JsonArray>()) {
    JsonArray inputArr = sensorDoc.as<JsonArray>();
    for (JsonObject item : inputArr) {
      JsonObject s = sensorArray.add<JsonObject>();
      s["type"] = item["type"].as<const char*>();
      s["value"] = item["value"].as<double>();
      s["unit"] = item["unit"].as<const char*>();
    }
  }

  String payload;
  serializeJson(doc, payload);
  return payload;
}

String ApiClient::ingestUrl() const {
  String url = "http://";
  url += kAppConfig.api.host;
  url += ":";
  url += String(kAppConfig.api.port);
  url += "/api/ingest";
  return url;
}

void ApiClient::publishHeartbeat() {
  if (!health_.hasServerTarget()) {
    return;
  }

  lastPublishAt_ = millis();

  if (!health_.isWifiConnected()) {
    return;
  }

  HTTPClient http;
  const String url = ingestUrl();
  http.setTimeout(2000);
  if (!http.begin(url)) {
    logger_.info("api: begin failed");
    return;
  }

  http.addHeader("Content-Type", "application/json");
  const int statusCode = http.POST(buildPayload());
  if (statusCode < 0) {
    Serial.printf("api error=%s target=%s\n", http.errorToString(statusCode).c_str(), url.c_str());
  }
  Serial.printf("api status=%d target=%s\n", statusCode, url.c_str());
  http.end();
}

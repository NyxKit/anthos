#include "ApiClient.h"

#include <HTTPClient.h>

#include "AppConfig.h"

ApiClient::ApiClient(Logger& logger, const NodeHealth& health) : logger_(logger), health_(health) {
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

  return millis() - lastPublishAt_ >= kAppConfig.api.checkIntervalMs;
}

String ApiClient::buildPayload() const {
  const auto snapshot = health_.snapshot();

  String payload = "{";
  payload += "\"nodeId\":\"" + String(kAppConfig.nodeId) + "\",";
  payload += "\"timestampMs\":" + String(millis()) + ",";
  payload += "\"health\":{";
  payload += "\"wifi\":\"" + String(snapshot.wifiStatus) + "\",";
  payload += "\"ip\":\"" + String(snapshot.ipAddress) + "\",";
  payload += "\"rssi\":" + String(snapshot.rssi) + ",";
  payload += "\"server\":\"" + String(snapshot.serverStatus) + "\",";
  payload += "\"target\":\"" + String(snapshot.serverHost) + "\",";
  payload += "\"uptimeMs\":" + String(snapshot.uptimeMs);
  payload += "},";
  payload += "\"sensors\":[]";
  payload += "}";
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

#include "NodeHealth.h"

#include <cstring>

#include <WiFi.h>

#include "AppConfig.h"
#include "NvsConfig.h"

NodeHealth::NodeHealth(Logger& logger) : logger_(logger) {}

void NodeHealth::begin() {
  ensureWifiConnected();
  emitHeartbeat();
}

void NodeHealth::loop() {
  ensureWifiConnected();

  const auto now = millis();
  if (now - lastHealthReportAt_ >= kAppConfig.healthIntervalMs) {
    emitHeartbeat();
  }
}

bool NodeHealth::isWifiConnected() const {
  return WiFi.status() == WL_CONNECTED;
}

NodeHealthSnapshot NodeHealth::snapshot() const {
  const bool wifiConnected = isWifiConnected();
  const String ssid = NvsConfig::getWifiSsid();

  const char* wifiStatus = ssid.length() > 0
      ? (wifiConnected ? "connected" : "disconnected")
      : "not_configured";

  if (wifiConnected) {
    const String ip = WiFi.localIP().toString();
    ip.toCharArray(ipAddress_, sizeof(ipAddress_));
  } else {
    std::strcpy(ipAddress_, "n/a");
  }

  NodeHealthSnapshot s;
  s.wifiStatus = wifiStatus;
  s.ipAddress  = ipAddress_;
  s.rssi       = wifiConnected ? WiFi.RSSI() : 0;
  s.uptimeMs   = millis();
  return s;
}

void NodeHealth::ensureWifiConnected() {
  const String ssid = NvsConfig::getWifiSsid();
  if (ssid.length() == 0) return;

  if (WiFi.status() == WL_CONNECTED) return;

  const auto now = millis();
  if (now - lastWifiAttemptAt_ < kAppConfig.retryIntervalMs) return;

  lastWifiAttemptAt_ = now;
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), NvsConfig::getWifiPass().c_str());
  logger_.info("wifi: connect requested");
}

void NodeHealth::emitHeartbeat() const {
  const auto s = snapshot();
  logger_.health(s.wifiStatus, s.ipAddress, s.rssi, "n/a", "n/a", s.uptimeMs);
  const_cast<NodeHealth*>(this)->lastHealthReportAt_ = millis();
}

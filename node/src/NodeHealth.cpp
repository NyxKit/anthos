#include "NodeHealth.h"

#include <cstdlib>
#include <cstring>

#include <WiFi.h>

#include "AppConfig.h"

namespace {
bool hasValue(const char* value) {
  return value != nullptr && value[0] != '\0';
}

const char* stripScheme(const char* url) {
  const char* scheme = strstr(url, "://");
  return scheme ? scheme + 3 : url;
}
}

NodeHealth::NodeHealth(Logger& logger) : logger_(logger) {
}

void NodeHealth::begin() {
  ensureWifiConnected();
  refreshServerReachability();
  emitHeartbeat();
}

void NodeHealth::loop() {
  ensureWifiConnected();

  const auto now = millis();
  if (now - lastServerCheckAt_ >= kAppConfig.api.checkIntervalMs) {
    refreshServerReachability();
  }

  if (now - lastHealthReportAt_ >= kAppConfig.healthIntervalMs) {
    emitHeartbeat();
  }
}

const char* NodeHealth::serverHost() const {
  if (!hasServerTarget()) {
    return "not_configured";
  }

  static char host[128];
  const char* start = stripScheme(kAppConfig.api.baseUrl);
  size_t index = 0;

  while (start[index] != '\0' && start[index] != ':' && start[index] != '/' && index < sizeof(host) - 1) {
    host[index] = start[index];
    ++index;
  }
  host[index] = '\0';

  return host[0] == '\0' ? "not_configured" : host;
}

uint16_t NodeHealth::serverPort() const {
  if (!hasServerTarget()) {
    return 0;
  }

  const char* url = kAppConfig.api.baseUrl;
  const bool https = strncmp(url, "https://", 8) == 0;
  const char* start = stripScheme(url);
  const char* colon = strchr(start, ':');
  const char* slash = strchr(start, '/');

  if (colon != nullptr && (slash == nullptr || colon < slash)) {
    return static_cast<uint16_t>(atoi(colon + 1));
  }

  return https ? 443 : 80;
}

bool NodeHealth::hasServerTarget() const {
  return hasValue(kAppConfig.api.baseUrl);
}

void NodeHealth::ensureWifiConnected() {
  if (!hasValue(kAppConfig.wifi.ssid)) {
    return;
  }

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  const auto now = millis();
  if (now - lastWifiAttemptAt_ < kAppConfig.retryIntervalMs) {
    return;
  }

  lastWifiAttemptAt_ = now;
  WiFi.mode(WIFI_STA);
  WiFi.begin(kAppConfig.wifi.ssid, kAppConfig.wifi.password);
  logger_.info("wifi: connect requested");
}

void NodeHealth::refreshServerReachability() {
  lastServerCheckAt_ = millis();

  if (WiFi.status() != WL_CONNECTED || !hasServerTarget()) {
    serverReachable_ = false;
    return;
  }

  WiFiClient client;
  client.setTimeout(1000);
  serverReachable_ = client.connect(serverHost(), serverPort());
  if (serverReachable_) {
    client.stop();
  }
}

void NodeHealth::emitHeartbeat() const {
  const bool wifiConnected = WiFi.status() == WL_CONNECTED;
  const char* wifiStatus = hasValue(kAppConfig.wifi.ssid)
                               ? (wifiConnected ? "connected" : "disconnected")
                               : "not_configured";
  static char ipAddress[24] = "n/a";
  if (wifiConnected) {
    const String ip = WiFi.localIP().toString();
    ip.toCharArray(ipAddress, sizeof(ipAddress));
  } else {
    std::strcpy(ipAddress, "n/a");
  }
  const long rssi = wifiConnected ? WiFi.RSSI() : 0;

  const char* serverStatus = !hasServerTarget()
                                 ? "not_configured"
                                 : (wifiConnected ? (serverReachable_ ? "reachable" : "unreachable")
                                                  : "wifi_down");

  logger_.health(wifiStatus, ipAddress, rssi, serverStatus, serverHost(), millis());
  const_cast<NodeHealth*>(this)->lastHealthReportAt_ = millis();
}

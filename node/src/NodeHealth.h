#pragma once

#include <Arduino.h>

#include "Logger.h"

struct NodeHealthSnapshot {
  const char* wifiStatus = "not_configured";
  const char* ipAddress = "n/a";
  long rssi = 0;
  const char* serverStatus = "not_configured";
  const char* serverHost = "not_configured";
  unsigned long uptimeMs = 0;
};

class NodeHealth {
 public:
  explicit NodeHealth(Logger& logger);

  void begin();
  void loop();
  bool isWifiConnected() const;
  bool hasServerTarget() const;
  NodeHealthSnapshot snapshot() const;

 private:
  const char* serverHost() const;
  uint16_t serverPort() const;
  void ensureWifiConnected();
  void refreshServerReachability();
  void emitHeartbeat() const;

  Logger& logger_;
  unsigned long lastWifiAttemptAt_ = 0;
  unsigned long lastHealthReportAt_ = 0;
  unsigned long lastServerCheckAt_ = 0;
  bool serverReachable_ = false;
  mutable char ipAddress_[24] = "n/a";
};

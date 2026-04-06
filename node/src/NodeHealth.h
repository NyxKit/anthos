#pragma once

#include <Arduino.h>

#include "Logger.h"

struct NodeHealthSnapshot {
  const char* wifiStatus = "not_configured";
  const char* ipAddress  = "n/a";
  long        rssi       = 0;
  unsigned long uptimeMs = 0;
};

class NodeHealth {
 public:
  explicit NodeHealth(Logger& logger);

  void begin();
  void loop();
  bool isWifiConnected() const;
  NodeHealthSnapshot snapshot() const;

 private:
  void ensureWifiConnected();
  void emitHeartbeat() const;

  Logger& logger_;
  unsigned long lastWifiAttemptAt_   = 0;
  unsigned long lastHealthReportAt_  = 0;
  mutable char  ipAddress_[24]       = "n/a";
};

#pragma once

#include <Arduino.h>

#include "Logger.h"

class NodeHealth {
 public:
  explicit NodeHealth(Logger& logger);

  void begin();
  void loop();

 private:
  const char* serverHost() const;
  uint16_t serverPort() const;
  bool hasServerTarget() const;
  void ensureWifiConnected();
  void refreshServerReachability();
  void emitHeartbeat() const;

  Logger& logger_;
  unsigned long lastWifiAttemptAt_ = 0;
  unsigned long lastHealthReportAt_ = 0;
  unsigned long lastServerCheckAt_ = 0;
  bool serverReachable_ = false;
};

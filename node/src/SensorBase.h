#pragma once

#include <Arduino.h>

#include "AppConfig.h"
#include "Logger.h"

class SensorBase {
 public:
  virtual ~SensorBase() = default;
  virtual void begin(bool forceRetry = true) = 0;
  virtual void read() = 0;
  virtual String toJson() const = 0;

 protected:
  static Logger logger_;

  static void printUnavailable(const char* sensorName, const char* reason) {
    logger_.sensorUnavailable(sensorName, reason);
  }

  static bool shouldRetry(unsigned long& lastAttemptAt, bool forceRetry) {
    const auto now = millis();
    if (!forceRetry && now - lastAttemptAt < kAppConfig.retryIntervalMs) {
      return false;
    }

    lastAttemptAt = now;
    return true;
  }
};

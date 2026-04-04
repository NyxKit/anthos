#pragma once

#include "ApiClient.h"
#include "I2CBus.h"
#include "Logger.h"
#include "NodeHealth.h"
#include "NtpSync.h"
#include "SensorManager.h"

class NodeApp {
 public:
  void begin();
  void loop();

 private:
  const char* describePortMode() const;

  Logger logger_;
  I2CBus i2cBus_{logger_};
  NodeHealth health_{logger_};
  NtpSync ntp_;
  SensorManager sensors_;
  ApiClient api_{logger_, health_, sensors_, ntp_};
  unsigned long lastReadAt_ = 0;
};

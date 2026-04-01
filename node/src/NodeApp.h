#pragma once

#include "Logger.h"
#include "SensorManager.h"

class NodeApp {
 public:
  void begin();
  void loop();

 private:
  const char* describePortMode() const;

  Logger logger_;
  SensorManager sensors_;
  unsigned long lastReadAt_ = 0;
};

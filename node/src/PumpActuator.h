#pragma once

#include <Arduino.h>

#include "Logger.h"

class PumpActuator {
 public:
  explicit PumpActuator(Logger& logger);

  void begin();
  bool run(unsigned long durationMs);

 private:
  Logger& logger_;
  bool ready_ = false;
};

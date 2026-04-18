#pragma once

#include <Arduino.h>

#include "Logger.h"

class PumpActuator {
 public:
  explicit PumpActuator(Logger& logger);

  void begin();
  bool start(unsigned long durationMs);
  void loop();
  bool isRunning() const;
  bool consumeCompletion();

 private:
  Logger& logger_;
  bool ready_ = false;
  bool running_ = false;
  bool completionPending_ = false;
  unsigned long startedAt_ = 0;
  unsigned long durationMs_ = 0;
};

#pragma once

#include <Arduino.h>

#include "Logger.h"
#include "NodeHealth.h"
#include "PumpActuator.h"

class CommandClient {
 public:
  CommandClient(Logger& logger, const NodeHealth& health, PumpActuator& pump);

  void begin();
  void loop();

 private:
  bool shouldPoll() const;
  String commandsUrl() const;
  String ackUrl(const String& commandId) const;
  void pollCommands();
  void processCommand(const String& commandId, unsigned long durationMs);
  bool acknowledgeCommand(const String& commandId, const char* result, const char* message);

  Logger& logger_;
  const NodeHealth& health_;
  PumpActuator& pump_;
  unsigned long lastPollAt_ = 0;
};

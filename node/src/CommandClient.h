#pragma once

#include <Arduino.h>

#include "ApiClient.h"
#include "Logger.h"
#include "NodeHealth.h"
#include "PumpActuator.h"

class CommandClient {
 public:
  CommandClient(Logger& logger, const NodeHealth& health, PumpActuator& pump, ApiClient& api);

  void begin();
  void loop();
  bool pollNow();

 private:
  bool shouldPoll() const;
  String commandsUrl() const;
  String ackUrl(const String& commandId) const;
  void pollCommands();
  void logCommandReceived(const String& commandId, const char* type);
  bool processCommand(const String& commandId, unsigned long durationMs);
  void processPowerProfileCommand(const String& commandId,
                                  unsigned long intervalMs);
  bool acknowledgeCommand(const String& commandId, const char* result, const char* message);

  Logger& logger_;
  const NodeHealth& health_;
  PumpActuator& pump_;
  ApiClient& api_;
  unsigned long lastPollAt_ = 0;
  String activePumpCommandId_ = "";
  bool activePumpAckPending_ = false;
};

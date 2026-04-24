#pragma once

#include <Arduino.h>

#include "Logger.h"
#include "NodeHealth.h"
#include "SensorManager.h"

class ApiClient {
 public:
  ApiClient(Logger& logger, const NodeHealth& health, SensorManager& sensors);

  void begin();
  void loop();
  bool consumeSuccessfulPublish();
  bool hasSuccessfulPublish() const;

 private:
  bool shouldPublish() const;
  String buildPayload() const;
  String ingestUrl() const;
  bool publishHeartbeat();

  Logger& logger_;
  const NodeHealth& health_;
  SensorManager& sensors_;
  unsigned long lastPublishAt_ = 0;
  unsigned long lastNetworkLatencyMs_ = 0;
  bool successfulPublishPending_ = false;
};

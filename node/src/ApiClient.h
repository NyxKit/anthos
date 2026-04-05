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

 private:
  bool shouldPublish() const;
  String buildPayload() const;
  String ingestUrl() const;
  void publishHeartbeat();

  Logger& logger_;
  const NodeHealth& health_;
  SensorManager& sensors_;
  unsigned long lastPublishAt_ = 0;
};

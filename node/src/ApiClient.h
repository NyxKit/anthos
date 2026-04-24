#pragma once

#include <Arduino.h>

#include "Logger.h"
#include "NodeHealth.h"
#include "SensorManager.h"

class ApiClient {
 public:
  enum class HttpPostResult {
    NetworkError,
    HttpFailure,
    Success,
  };

  ApiClient(Logger& logger, const NodeHealth& health, SensorManager& sensors);

  void begin();
  void loop();
  bool consumeSuccessfulPublish();
  bool hasSuccessfulPublish() const;
  HttpPostResult postJson(const char* label, const String& url, const String& payload);
  bool publishLog(const char* source,
                  const char* message,
                  const char* level = "info",
                  const char* metaJson = nullptr);

 private:
  bool shouldPublish() const;
  String buildPayload() const;
  String ingestUrl() const;
  String logsUrl() const;
  bool publishHeartbeat();

  Logger& logger_;
  const NodeHealth& health_;
  SensorManager& sensors_;
  unsigned long lastPublishAt_ = 0;
  unsigned long lastNetworkLatencyMs_ = 0;
  bool successfulPublishPending_ = false;
};

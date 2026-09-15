#pragma once

#include <ArduinoJson.h>

class DeviceResponseValidator {
 public:
  static bool ingest(JsonVariantConst response, const char* expectedNodeId);
  static bool queue(JsonVariantConst response, const char* expectedNodeId);

 private:
  static bool identityAndCapability(JsonVariantConst response, const char* expectedNodeId);
};

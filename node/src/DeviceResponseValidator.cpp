#include "DeviceResponseValidator.h"

#include <cstring>

bool DeviceResponseValidator::identityAndCapability(JsonVariantConst response, const char* expectedNodeId) {
  if (!response.is<JsonObjectConst>() || expectedNodeId == nullptr || expectedNodeId[0] == '\0') return false;
  if (!response["nodeId"].is<const char*>() || !response["capability"].is<const char*>()) return false;
  const auto nodeId = response["nodeId"].as<JsonString>();
  const auto capability = response["capability"].as<JsonString>();
  if (nodeId.size() != std::strlen(expectedNodeId) || std::strcmp(nodeId.c_str(), expectedNodeId) != 0) return false;
  return (capability.size() == 5 && std::strcmp(capability.c_str(), "earth") == 0) ||
         (capability.size() == 8 && std::strcmp(capability.c_str(), "watering") == 0);
}

bool DeviceResponseValidator::ingest(JsonVariantConst response, const char* expectedNodeId) {
  if (!identityAndCapability(response, expectedNodeId) || !response["status"].is<const char*>()) return false;
  const auto status = response["status"].as<JsonString>();
  return (status.size() == 8 && std::strcmp(status.c_str(), "accepted") == 0) ||
         (status.size() == 10 && std::strcmp(status.c_str(), "registered") == 0);
}

bool DeviceResponseValidator::queue(JsonVariantConst response, const char* expectedNodeId) {
  return identityAndCapability(response, expectedNodeId) && response["commands"].is<JsonArrayConst>();
}

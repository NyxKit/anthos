#pragma once

#include <Arduino.h>

enum class PortMode {
  I2cSensors,
  EarthOnly,
};

struct WifiConfig {
  const char* ssid = "";
  const char* password = "";
};

struct ApiConfig {
  const char* baseUrl = "";
};

struct AppConfig {
  const char* nodeId = "dev-node";
  PortMode portMode = PortMode::I2cSensors;
  uint8_t portYellowPin = 2;
  uint8_t portWhitePin = 1;
  uint8_t dlightAddress = 0x23;
  unsigned long readIntervalMs = 1000;
  unsigned long retryIntervalMs = 5000;
  WifiConfig wifi{};
  ApiConfig api{};
};

extern const AppConfig kAppConfig;

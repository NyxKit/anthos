#pragma once

#include <Arduino.h>

enum class PortMode {
  I2cSensors,
  EarthOnly,
  Combined,
};

struct AppConfig {
  PortMode portMode      = PortMode::I2cSensors;
  uint8_t  portYellowPin = 2;
  uint8_t  portWhitePin  = 1;
  uint8_t  earthYellowPin = 39;
  uint8_t  earthWhitePin  = 5;
  uint8_t  dlightAddress = 0x23;
  uint32_t i2cClockHz    = 50000;
  unsigned long readIntervalMs   = 1000;
  unsigned long healthIntervalMs = 5000;
  unsigned long retryIntervalMs  = 5000;
  unsigned long pushIntervalMs   = 1000;
};

extern const AppConfig kAppConfig;

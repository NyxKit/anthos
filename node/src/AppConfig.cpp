#include "AppConfig.h"

#include <cstring>

#ifndef ANTHOS_PORT_MODE
#define ANTHOS_PORT_MODE "i2c"
#endif

namespace {
PortMode parsePortMode(const char* value) {
  return std::strcmp(value, "earth") == 0 ? PortMode::EarthOnly : PortMode::I2cSensors;
}

AppConfig makeAppConfig() {
  AppConfig config;
  config.portMode      = parsePortMode(ANTHOS_PORT_MODE);
  config.portYellowPin = 2;
  config.portWhitePin  = 1;
  config.dlightAddress = 0x23;
  config.i2cClockHz    = 50000;
  config.readIntervalMs   = 1000;
  config.healthIntervalMs = 5000;
  config.retryIntervalMs  = 5000;
  config.pushIntervalMs   = 1000;
  return config;
}
}

const AppConfig kAppConfig = makeAppConfig();

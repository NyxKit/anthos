#include "AppConfig.h"

#include <cstring>

#ifndef ANTHOS_NODE_ID
#define ANTHOS_NODE_ID "dev-node"
#endif

#ifndef ANTHOS_PORT_MODE
#define ANTHOS_PORT_MODE "i2c"
#endif

#ifndef ANTHOS_WIFI_SSID
#define ANTHOS_WIFI_SSID ""
#endif

#ifndef ANTHOS_WIFI_PASSWORD
#define ANTHOS_WIFI_PASSWORD ""
#endif

#ifndef ANTHOS_API_BASE_URL
#define ANTHOS_API_BASE_URL ""
#endif

namespace {
PortMode parsePortMode(const char* value) {
  return std::strcmp(value, "earth") == 0 ? PortMode::EarthOnly : PortMode::I2cSensors;
}

bool parseBool(const char* value) {
  return std::strcmp(value, "1") == 0 || std::strcmp(value, "true") == 0 ||
         std::strcmp(value, "yes") == 0 || std::strcmp(value, "on") == 0;
}

AppConfig makeAppConfig() {
  AppConfig config;
  config.nodeId = ANTHOS_NODE_ID;
  config.portMode = parsePortMode(ANTHOS_PORT_MODE);
  config.portYellowPin = 2;
  config.portWhitePin = 1;
  config.dlightAddress = 0x23;
  config.i2cClockHz = 50000;
  config.readIntervalMs = 1000;
  config.healthIntervalMs = 5000;
  config.retryIntervalMs = 5000;
  config.wifi.ssid = ANTHOS_WIFI_SSID;
  config.wifi.password = ANTHOS_WIFI_PASSWORD;
  config.api.baseUrl = ANTHOS_API_BASE_URL;
  config.api.checkIntervalMs = 10000;
  return config;
}
}

const AppConfig kAppConfig = makeAppConfig();

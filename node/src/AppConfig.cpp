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

#ifndef ANTHOS_API_HOST
#define ANTHOS_API_HOST ""
#endif

#ifndef ANTHOS_API_PORT
#define ANTHOS_API_PORT "8088"
#endif

namespace {
PortMode parsePortMode(const char* value) {
  return std::strcmp(value, "earth") == 0 ? PortMode::EarthOnly : PortMode::I2cSensors;
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
  config.api.host = ANTHOS_API_HOST;
  config.api.port = static_cast<uint16_t>(atoi(ANTHOS_API_PORT));
  config.api.checkIntervalMs = 10000;
  return config;
}
}

const AppConfig kAppConfig = makeAppConfig();

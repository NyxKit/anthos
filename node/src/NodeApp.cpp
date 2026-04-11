#include "NodeApp.h"

#include <Arduino.h>
#include <Wire.h>

#include "AppConfig.h"
#include "NvsConfig.h"

const char* NodeApp::describePortMode() const {
  switch (kAppConfig.portMode) {
    case PortMode::I2cSensors:
      return "i2c";
    case PortMode::EarthOnly:
      return "earth";
    case PortMode::Combined:
      return "all";
  }
  return "i2c";
}

void NodeApp::begin() {
  logger_.begin(115200);
  delay(1500);

  logger_.line();

  const String nodeId = NvsConfig::getNodeId();
  logger_.boot(nodeId.length() > 0 ? nodeId.c_str() : "unregistered", describePortMode());
  logger_.portPins(kAppConfig.portYellowPin, kAppConfig.portWhitePin);

  if (kAppConfig.portMode != PortMode::EarthOnly) {
    Wire.begin(kAppConfig.portYellowPin, kAppConfig.portWhitePin);
    Wire.setClock(kAppConfig.i2cClockHz);
    logger_.info("hy2.0 bus: i2c initialized");
    delay(100);
  }

  // Run provisioning (BLE → WiFi → hub registration) before starting telemetry.
  // This call blocks until the node is fully configured (BootState::READY).
  provisioning_.begin();

  health_.begin();
  api_.begin();
  sensors_.begin();
}

void NodeApp::loop() {
  provisioning_.loop();
  health_.loop();
  api_.loop();

  const auto now = millis();
  if (now - lastReadAt_ < kAppConfig.readIntervalMs) {
    delay(10);
    return;
  }

  lastReadAt_ = now;
  sensors_.readAll();
}

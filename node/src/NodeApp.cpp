#include "NodeApp.h"

#include <Arduino.h>
#include <Wire.h>

#include "AppConfig.h"

const char* NodeApp::describePortMode() const {
  return kAppConfig.portMode == PortMode::I2cSensors ? "i2c" : "earth";
}

void NodeApp::begin() {
  logger_.begin(115200);
  delay(1500);

  logger_.line();
  logger_.boot(kAppConfig.nodeId, describePortMode());
  logger_.portPins(kAppConfig.portYellowPin, kAppConfig.portWhitePin);

  if (kAppConfig.portMode == PortMode::I2cSensors) {
    Wire.begin(kAppConfig.portYellowPin, kAppConfig.portWhitePin);
    logger_.info("hy2.0 bus: i2c initialized");
  }

  sensors_.begin();
}

void NodeApp::loop() {
  const auto now = millis();
  if (now - lastReadAt_ < kAppConfig.readIntervalMs) {
    delay(10);
    return;
  }

  lastReadAt_ = now;
  sensors_.readAll();
}

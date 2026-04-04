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
    Wire.setClock(kAppConfig.i2cClockHz);
    logger_.info("hy2.0 bus: i2c initialized");
    delay(100);
  }

  health_.begin();
  ntp_.begin();
  api_.begin();
  sensors_.begin();
}

void NodeApp::loop() {
  health_.loop();
  ntp_.loop();
  api_.loop();

  const auto now = millis();
  if (now - lastReadAt_ < kAppConfig.readIntervalMs) {
    delay(10);
    return;
  }

  lastReadAt_ = now;
  sensors_.readAll();
}

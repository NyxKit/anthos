#include "NodeApp.h"

#include <Arduino.h>
#include <Wire.h>

#include "AppConfig.h"
#include "BleProvisioning.h"
#include "NvsConfig.h"

namespace {
constexpr const char* kFirmwareVersion = "dev";
}

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

  // Run provisioning (BLE → WiFi) before starting telemetry.
  // Telemetry and hub sync continue in the background.
  provisioning_.begin();

  health_.begin();
  syncNodeRegistration();
  applyHardwareProfileIfNeeded();
  api_.begin();
  commands_.begin();
}

void NodeApp::loop() {
  provisioning_.loop();
  health_.loop();
  syncNodeRegistration();
  applyHardwareProfileIfNeeded();
  commands_.loop();
  api_.loop();

  const auto now = millis();
  if (now - lastReadAt_ < NvsConfig::getReadIntervalMs()) {
    delay(10);
    return;
  }

  lastReadAt_ = now;
  sensors_.readAll();
}

void NodeApp::syncNodeRegistration() {
  if (!health_.isWifiConnected()) {
    return;
  }

  const auto now = millis();
  if (now - lastRegisterAt_ < kAppConfig.retryIntervalMs) {
    return;
  }

  lastRegisterAt_ = now;
  const String nodeId = hub_.tryRegisterOnce(BleProvisioning::getHwId(), kFirmwareVersion);
  if (nodeId.length() > 0) {
    if (NvsConfig::getNodeId() != nodeId) {
      NvsConfig::setNodeId(nodeId);
      Serial.printf("[REG] Synced node_id=%s from registration\n", nodeId.c_str());
    }
  }
}

void NodeApp::applyHardwareProfileIfNeeded() {
  const String capability = NvsConfig::getNodeCapability();
  if (capability == appliedCapability_) {
    return;
  }

  appliedCapability_ = capability;
  pump_.begin();
  sensors_.begin();
  Serial.printf("[REG] Applied hardware capability=%s\n", appliedCapability_.c_str());
}

#include "NodeApp.h"

#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>

#include <esp_sleep.h>

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
  holdAfterCycle();
  maybeSuspendAfterTelemetry();

  const auto now = millis();
  if (now - lastReadAt_ < NvsConfig::getIntervalMs()) {
    delay(10);
    return;
  }

  lastReadAt_ = now;
  sensors_.readAll();
}

void NodeApp::maybeSuspendAfterTelemetry() {
  if (suspendHoldUntilAt_ == 0) {
    return;
  }

  const auto now = millis();
  if (now < suspendHoldUntilAt_) {
    return;
  }

  const unsigned long intervalMs = NvsConfig::getIntervalMs();
  if (!PowerPolicy::shouldSuspendAfterTelemetry(intervalMs)) {
    suspendHoldUntilAt_ = 0;
    return;
  }

  commands_.pollNow();
  suspendHoldUntilAt_ = 0;

  Serial.printf("[PWR] Deep sleep for %lu ms\n", intervalMs);
  sensors_.suspend();
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(100);
  esp_sleep_enable_timer_wakeup(static_cast<uint64_t>(intervalMs) * 1000ULL);
  esp_deep_sleep_start();
}

void NodeApp::holdAfterCycle() {
  if (!api_.consumeSuccessfulPublish()) {
    return;
  }

  suspendHoldUntilAt_ = millis() + PowerPolicy::kSuspendHoldMs;
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

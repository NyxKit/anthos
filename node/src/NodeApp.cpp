#include "NodeApp.h"

#include <Arduino.h>
#include <M5AtomS3.h>
#include <WiFi.h>
#include <Wire.h>

#include <esp_sleep.h>

#include "AppConfig.h"
#include "BleProvisioning.h"
#include "NvsConfig.h"

namespace {
constexpr const char* kFirmwareVersion = "dev";

void showBootColor(uint32_t rgb) {
  AtomS3.dis.drawpix(rgb);
  AtomS3.update();
}
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
  NvsConfig::restoreIntervalMs();

  AtomS3.begin(true);
  showBootColor(0x080000);

  const bool hasWifiCredentials = NvsConfig::hasWifiCredentials();
  if (!hasWifiCredentials) {
    // Give `node:flash && node:monitor` time to reconnect after a full erase.
    delay(8000);
  }

  delay(1500);

  logger_.line();

  const String nodeId = NvsConfig::hasNodeId() ? NvsConfig::getNodeId() : "unregistered";
  logger_.boot(nodeId.c_str(), describePortMode());
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
  showBootColor(0x000808);

  health_.begin();
  syncNodeRegistration();
  applyHardwareProfileIfNeeded();
  api_.begin();
  commands_.begin();

  showBootColor(0x000800);
}

void NodeApp::loop() {
  AtomS3.update();
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
  const uint32_t intervalMs = sleep_.prepareSleep(
      millis(),
      [this]() { return commands_.pollNow(); },
      []() { return NvsConfig::getIntervalMs(); },
      [this]() { return commands_.hasPendingWork(); });
  if (intervalMs == 0) return;

  logger_.info("[PWR] Entering deep sleep with applied cadence");
  api_.publishLog("power", "I'm hibernating now");
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

  sleep_.onSuccessfulPublish(millis());
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
  if (!NvsConfig::hasNodeCapability()) {
    return;
  }

  const String capability = NvsConfig::getNodeCapability();
  if (capability == appliedCapability_) {
    return;
  }

  appliedCapability_ = capability;
  pump_.begin();
  sensors_.begin();
  Serial.printf("[REG] Applied hardware capability=%s\n", appliedCapability_.c_str());
}

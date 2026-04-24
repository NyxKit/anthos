#include "ProvisioningManager.h"

#include <WiFi.h>
#include "BleProvisioning.h"
#include "NvsConfig.h"

void ProvisioningManager::begin() {
  pinMode(kButtonPin, INPUT_PULLUP);

  if (!NvsConfig::hasWifiCredentials()) {
    state_ = BootState::NO_CREDS;
    Serial.println("[BOOT] No credentials. Entering BLE provisioning mode.");
    runBleProvisioning();
  } else {
    state_ = BootState::READY;
    Serial.println("[BOOT] WiFi credentials found. Starting telemetry loop.");
  }
}

void ProvisioningManager::loop() {
  checkFactoryReset();
}

void ProvisioningManager::runBleProvisioning() {
  while (true) {
    BleProvisioning ble;
    const bool success = ble.begin();

    if (success) {
      Serial.println("[PROV] WiFi provisioning succeeded. Starting telemetry loop.");
      state_ = BootState::READY;
      return;
    }

    Serial.println("[PROV] WiFi provisioning failed. Reopening BLE.");
    delay(1000);
  }
}

void ProvisioningManager::checkFactoryReset() {
  const bool pressed = (digitalRead(kButtonPin) == LOW);

  if (pressed && !buttonWasPressed_) {
    buttonPressedAt_ = millis();
    buttonWasPressed_ = true;
  } else if (!pressed) {
    buttonWasPressed_ = false;
    buttonPressedAt_ = 0;
  }

  if (buttonWasPressed_ && millis() - buttonPressedAt_ >= kHoldMs) {
    Serial.println("[RESET] Factory reset triggered. Clearing NVS.");
    NvsConfig::factoryReset();  // calls ESP.restart()
  }
}

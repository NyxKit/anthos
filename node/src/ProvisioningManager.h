#pragma once

#include <Arduino.h>

#include "BleProvisioning.h"

enum class BootState {
  NO_CREDS,    // No WiFi credentials in NVS → enter BLE provisioning
  READY,       // WiFi is configured → start telemetry loop
};

class ProvisioningManager {
 public:
  // Returns the boot state determined from NVS on construction
  BootState bootState() const { return state_; }

  // Call once in setup(). Handles provisioning and then lets telemetry run.
  void begin();

  // Call every loop() iteration: polls button for factory reset.
  void loop();

 private:
  void runBleProvisioning();
  void checkFactoryReset();

  BootState state_ = BootState::NO_CREDS;
  BleProvisioning ble_;

  static constexpr uint8_t kButtonPin          = 41;     // AtomS3 Lite built-in button
  static constexpr unsigned long kHoldMs       = 3000;   // 3-second hold for factory reset
  unsigned long buttonPressedAt_               = 0;
  bool          buttonWasPressed_              = false;
};

#pragma once

#include <Arduino.h>

enum class BootState {
  NO_CREDS,    // No WiFi credentials in NVS → enter BLE provisioning
  NO_NODE_ID,  // Has WiFi creds, no node_id → connect WiFi → register with hub
  READY,       // Fully configured → start telemetry loop
};

class ProvisioningManager {
 public:
  // Returns the boot state determined from NVS on construction
  BootState bootState() const { return state_; }

  // Call once in setup(). Handles BLE provisioning and hub registration
  // before the telemetry loop begins. Blocks until state reaches READY.
  void begin();

  // Call every loop() iteration: polls button for factory reset.
  void loop();

 private:
  void runBleProvisioning();
  void runHubRegistration();
  void runApFallback();
  void checkFactoryReset();

  BootState state_ = BootState::NO_CREDS;

  static constexpr uint8_t kButtonPin          = 41;     // AtomS3 Lite built-in button
  static constexpr unsigned long kHoldMs       = 3000;   // 3-second hold for factory reset
  static constexpr unsigned long kBleTimeoutMs = 300000; // 5 minutes
  unsigned long buttonPressedAt_               = 0;
  bool          buttonWasPressed_              = false;
};

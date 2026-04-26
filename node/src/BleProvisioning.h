#pragma once

#include <Arduino.h>
#include <NimBLEDevice.h>
#include <WiFi.h>

// BLE GATT provisioning service.
// Advertises as "Anthos-XXXX" (last 4 chars of hw_id from eFuse MAC).
// Exposes two characteristics per contracts/ble-gatt.md:
//   - Credentials (write): receives JSON {"ssid","pass","serverUrl"(opt)}
//   - Status (notify):     sends {"status":"connecting"|"success"|"failed","ip"(opt),"reason"(opt)}
// Session closes after reporting a terminal status (success or failed).
class BleProvisioning : public NimBLEServerCallbacks,
                        public NimBLECharacteristicCallbacks {
 public:
  // Start advertising and wait for provisioning to complete.
  // Returns true if WiFi credentials were successfully received and WiFi joined.
  // Returns false if WiFi join failed.
  bool begin();

  // Stop BLE advertising and release resources.
  void stop();

  // Returns the hardware ID derived from eFuse MAC (12-char uppercase hex).
  static String getHwId();

  // Returns the BLE advertisement name (e.g. "Anthos-EEFF").
  static String getAdvertisementName();

 private:
  // NimBLEServerCallbacks
  void onConnect(NimBLEServer* server) override;
  void onDisconnect(NimBLEServer* server) override;

  // NimBLECharacteristicCallbacks
  void onWrite(NimBLECharacteristic* characteristic) override;

  void notifyStatus(const String& status, const String& extra = "");
  bool attemptWifiConnect(const String& ssid, const String& pass);
  void handleWifiDisconnect(uint8_t reason);
  static const char* describeWifiDisconnectReason(uint8_t reason);

  // UUIDs from contracts/ble-gatt.md
  static constexpr const char* kServiceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
  static constexpr const char* kCredsUuid   = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
  static constexpr const char* kStatusUuid  = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

  static constexpr unsigned long kWifiTimeoutMs = 30000;

  NimBLECharacteristic* statusChar_ = nullptr;
  bool initialized_                 = false;
  bool clientConnected_             = false;
  bool provisioningDone_            = false;
  bool provisioningSuccess_         = false;
  uint8_t wifiDisconnectReason_     = 0;
  WiFiEventId_t wifiDisconnectEventId_ = 0;
};

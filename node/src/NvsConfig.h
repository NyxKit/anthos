#pragma once

#include <Arduino.h>

// NvsConfig: runtime configuration backed by ESP32 NVS (Arduino Preferences).
// All methods are static — no instance needed.
// NVS namespace: "anthos"
// Keys: wifi_ssid, wifi_pass, server_url, node_id
class NvsConfig {
 public:
  // Credential checks
  static bool hasWifiCredentials();
  static bool hasNodeId();

  // Getters
  static String getWifiSsid();
  static String getWifiPass();
  static String getServerUrl();  // full URL, e.g. "http://192.168.1.10:3000"
  static String getNodeId();

  // Setters
  static void setWifiCredentials(const String& ssid, const String& pass);
  static void setServerUrl(const String& url);
  static void setNodeId(const String& nodeId);

  // Factory reset: clears all keys in "anthos" namespace then restarts
  static void factoryReset();

 private:
  static constexpr const char* kNamespace = "anthos";
  static constexpr const char* kWifiSsid  = "wifi_ssid";
  static constexpr const char* kWifiPass  = "wifi_pass";
  static constexpr const char* kServerUrl = "server_url";
  static constexpr const char* kNodeId    = "node_id";
};

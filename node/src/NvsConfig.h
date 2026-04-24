#pragma once

#include <Arduino.h>

// NvsConfig: runtime configuration backed by ESP32 NVS (Arduino Preferences).
// All methods are static — no instance needed.
// NVS namespace: "anthos"
// Keys: wifi_ssid, wifi_pass, server_url, node_id, node_capability
class NvsConfig {
 public:
  // Credential checks
  static bool hasWifiCredentials();
  static bool hasNodeId();
  static bool hasNodeCapability();

  // Getters
  static String getWifiSsid();
  static String getWifiPass();
  static String getServerUrl();  // full URL, e.g. "http://192.168.1.10:3000"
  static String getNodeId();
  static String getNodeCapability();
  static unsigned long getIntervalMs();
  static unsigned long getReadIntervalMs();
  static unsigned long getTelemetryIntervalMs();
  static unsigned long getQueueIntervalMs();
  static unsigned long getTelemetrySuspendCutoffMs();

  // Setters
  static void setWifiCredentials(const String& ssid, const String& pass);
  static void setServerUrl(const String& url);
  static void setNodeId(const String& nodeId);
  static void setNodeCapability(const String& capability);
  static void setIntervalMs(unsigned long intervalMs);
  static void setReadIntervalMs(unsigned long intervalMs);
  static void setTelemetryIntervalMs(unsigned long intervalMs);
  static void setQueueIntervalMs(unsigned long intervalMs);

  // Factory reset: clears all keys in "anthos" namespace then restarts
  static void factoryReset();

 private:
  static constexpr const char* kNamespace = "anthos";
  static constexpr const char* kWifiSsid  = "wifi_ssid";
  static constexpr const char* kWifiPass  = "wifi_pass";
  static constexpr const char* kServerUrl = "server_url";
  static constexpr const char* kNodeId    = "node_id";
  static constexpr const char* kNodeCapability = "node_capability";
};

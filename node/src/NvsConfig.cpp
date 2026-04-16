#include "NvsConfig.h"
#include <Preferences.h>
#include "AppConfig.h"

namespace {
unsigned long sReadIntervalMs = 0;
unsigned long sTelemetryIntervalMs = 0;
unsigned long sQueueIntervalMs = 0;
}

bool NvsConfig::hasWifiCredentials() {
  Preferences prefs;
  if (!prefs.begin(kNamespace, true)) {
    Serial.println("[NVS] Failed to open namespace (read). Treating as first boot.");
    return false;
  }
  bool has = prefs.isKey(kWifiSsid) && prefs.getString(kWifiSsid, "").length() > 0;
  prefs.end();
  return has;
}

bool NvsConfig::hasNodeId() {
  Preferences prefs;
  if (!prefs.begin(kNamespace, true)) return false;
  bool has = prefs.isKey(kNodeId) && prefs.getString(kNodeId, "").length() > 0;
  prefs.end();
  return has;
}

String NvsConfig::getWifiSsid() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.getString(kWifiSsid, "");
  prefs.end();
  return val;
}

String NvsConfig::getWifiPass() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.getString(kWifiPass, "");
  prefs.end();
  return val;
}

String NvsConfig::getServerUrl() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.getString(kServerUrl, "");
  prefs.end();
  return val;
}

String NvsConfig::getNodeId() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.getString(kNodeId, "");
  prefs.end();
  return val;
}

String NvsConfig::getNodeCapability() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.getString(kNodeCapability, "earth");
  prefs.end();
  return val;
}

unsigned long NvsConfig::getReadIntervalMs() {
  return sReadIntervalMs > 0 ? sReadIntervalMs : kAppConfig.readIntervalMs;
}

unsigned long NvsConfig::getTelemetryIntervalMs() {
  return sTelemetryIntervalMs > 0 ? sTelemetryIntervalMs : kAppConfig.pushIntervalMs;
}

unsigned long NvsConfig::getQueueIntervalMs() {
  return sQueueIntervalMs > 0 ? sQueueIntervalMs : kAppConfig.commandPollIntervalMs;
}

void NvsConfig::setWifiCredentials(const String& ssid, const String& pass) {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.putString(kWifiSsid, ssid);
  prefs.putString(kWifiPass, pass);
  prefs.end();
}

void NvsConfig::setServerUrl(const String& url) {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.putString(kServerUrl, url);
  prefs.end();
}

void NvsConfig::setNodeId(const String& nodeId) {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.putString(kNodeId, nodeId);
  prefs.end();
}

void NvsConfig::setNodeCapability(const String& capability) {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.putString(kNodeCapability, capability);
  prefs.end();
}

void NvsConfig::setReadIntervalMs(unsigned long intervalMs) {
  sReadIntervalMs = intervalMs;
}

void NvsConfig::setTelemetryIntervalMs(unsigned long intervalMs) {
  sTelemetryIntervalMs = intervalMs;
}

void NvsConfig::setQueueIntervalMs(unsigned long intervalMs) {
  sQueueIntervalMs = intervalMs;
}

void NvsConfig::factoryReset() {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.clear();
  prefs.end();
  ESP.restart();
}

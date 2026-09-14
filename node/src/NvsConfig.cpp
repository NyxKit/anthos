#include "NvsConfig.h"
#include <Preferences.h>
#include "AppConfig.h"
#include "PowerPolicy.h"

namespace {
unsigned long sIntervalMs = 0;
}

bool NvsConfig::hasWifiCredentials() {
  Preferences prefs;
  if (!prefs.begin(kNamespace, true)) {
    Serial.println("[NVS] Failed to open namespace (read). Treating as first boot.");
    return false;
  }
  const bool has = prefs.isKey(kWifiSsid);
  prefs.end();
  return has;
}

bool NvsConfig::hasNodeId() {
  Preferences prefs;
  if (!prefs.begin(kNamespace, true)) return false;
  const bool has = prefs.isKey(kNodeId);
  prefs.end();
  return has;
}

bool NvsConfig::hasNodeCapability() {
  Preferences prefs;
  if (!prefs.begin(kNamespace, true)) return false;
  const bool has = prefs.isKey(kNodeCapability);
  prefs.end();
  return has;
}

String NvsConfig::getWifiSsid() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.isKey(kWifiSsid) ? prefs.getString(kWifiSsid, "") : "";
  prefs.end();
  return val;
}

String NvsConfig::getWifiPass() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.isKey(kWifiPass) ? prefs.getString(kWifiPass, "") : "";
  prefs.end();
  return val;
}

String NvsConfig::getServerUrl() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.isKey(kServerUrl) ? prefs.getString(kServerUrl, "") : "";
  prefs.end();
  return val;
}

String NvsConfig::getNodeId() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.isKey(kNodeId) ? prefs.getString(kNodeId, "") : "";
  prefs.end();
  return val;
}

String NvsConfig::getNodeCapability() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.isKey(kNodeCapability) ? prefs.getString(kNodeCapability, "earth") : "earth";
  prefs.end();
  return val;
}

String NvsConfig::getDeviceToken() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.isKey(kDeviceToken) ? prefs.getString(kDeviceToken, "") : "";
  prefs.end();
  return val;
}

unsigned long NvsConfig::getIntervalMs() {
  return sIntervalMs > 0 ? sIntervalMs : kAppConfig.pushIntervalMs;
}

unsigned long NvsConfig::getReadIntervalMs() {
  return getIntervalMs();
}

unsigned long NvsConfig::getTelemetryIntervalMs() {
  return getIntervalMs();
}

unsigned long NvsConfig::getQueueIntervalMs() {
  return getIntervalMs();
}

unsigned long NvsConfig::getTelemetrySuspendCutoffMs() {
  return PowerPolicy::kSuspendCutoffMs;
}

bool NvsConfig::isPerformancePowerProfile() {
  return getIntervalMs() == kPerformanceProfileIntervalMs;
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

void NvsConfig::setDeviceToken(const String& token) {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.putString(kDeviceToken, token);
  prefs.end();
}

void NvsConfig::setIntervalMs(unsigned long intervalMs) {
  sIntervalMs = intervalMs;
}

void NvsConfig::setReadIntervalMs(unsigned long intervalMs) {
  setIntervalMs(intervalMs);
}

void NvsConfig::setTelemetryIntervalMs(unsigned long intervalMs) {
  setIntervalMs(intervalMs);
}

void NvsConfig::setQueueIntervalMs(unsigned long intervalMs) {
  setIntervalMs(intervalMs);
}

void NvsConfig::factoryReset() {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.clear();
  prefs.end();
  ESP.restart();
}

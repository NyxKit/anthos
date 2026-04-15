#include "NvsConfig.h"
#include <Preferences.h>
#include "AppConfig.h"

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

String NvsConfig::getAssignedPowerProfileId() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.getString(kPowerProfileAssignedId, "");
  prefs.end();
  return val;
}

String NvsConfig::getAppliedPowerProfileId() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  String val = prefs.getString(kPowerProfileAppliedId, "");
  prefs.end();
  return val;
}

unsigned long NvsConfig::getTelemetryIntervalMs() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  const unsigned long val = prefs.getULong(
    kPowerProfileAppliedTelemetry,
    prefs.getULong(kPowerProfileAssignedTelemetry, kAppConfig.pushIntervalMs)
  );
  prefs.end();
  return val;
}

unsigned long NvsConfig::getQueueIntervalMs() {
  Preferences prefs;
  prefs.begin(kNamespace, true);
  const unsigned long val = prefs.getULong(
    kPowerProfileAppliedQueue,
    prefs.getULong(kPowerProfileAssignedQueue, kAppConfig.commandPollIntervalMs)
  );
  prefs.end();
  return val;
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

void NvsConfig::setPowerProfileAssignment(const String& profileId, unsigned long telemetryIntervalMs, unsigned long queueIntervalMs) {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.putString(kPowerProfileAssignedId, profileId);
  prefs.putULong(kPowerProfileAssignedTelemetry, telemetryIntervalMs);
  prefs.putULong(kPowerProfileAssignedQueue, queueIntervalMs);
  prefs.end();
}

void NvsConfig::setPowerProfileApplied(const String& profileId, unsigned long telemetryIntervalMs, unsigned long queueIntervalMs) {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.putString(kPowerProfileAppliedId, profileId);
  prefs.putULong(kPowerProfileAppliedTelemetry, telemetryIntervalMs);
  prefs.putULong(kPowerProfileAppliedQueue, queueIntervalMs);
  prefs.end();
}

void NvsConfig::factoryReset() {
  Preferences prefs;
  prefs.begin(kNamespace, false);
  prefs.clear();
  prefs.end();
  ESP.restart();
}

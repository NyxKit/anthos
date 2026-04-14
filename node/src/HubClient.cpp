#include "HubClient.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

#include "NvsConfig.h"

// ── Hub discovery ─────────────────────────────────────────────────────────────

bool HubClient::isUrlReachable(const String& url) {
  if (url.length() == 0) return false;
  HTTPClient http;
  http.setTimeout(2000);
  const String healthUrl = url + "/api/health";
  if (!http.begin(healthUrl)) return false;
  const int code = http.GET();
  http.end();
  return code == 200;
}

String HubClient::discoverHub() {
  // Use NVS-stored URL if present and reachable
  const String stored = NvsConfig::getServerUrl();
  if (stored.length() > 0) {
    if (isUrlReachable(stored)) {
      Serial.printf("[HUB] Using stored URL: %s\n", stored.c_str());
      return stored;
    }
    Serial.printf("[HUB] Stored URL unreachable: %s\n", stored.c_str());
  } else {
    Serial.println("[HUB] No server URL in NVS. Re-provision with serverUrl included.");
  }

  return "";
}

// ── Registration ──────────────────────────────────────────────────────────────

String HubClient::tryRegisterOnce(const String& hwId, const String& firmwareVersion) {
  const String hubUrl = discoverHub();
  if (hubUrl.length() == 0) {
    Serial.println("[REG] Hub not found.");
    return "";
  }

  const String registerUrl = hubUrl + "/api/register";

  StaticJsonDocument<128> doc;
  doc["hwId"]            = hwId;
  doc["firmwareVersion"] = firmwareVersion;
  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.setTimeout(5000);
  if (!http.begin(registerUrl)) {
    Serial.println("[REG] HTTP begin failed.");
    return "";
  }

  http.addHeader("Content-Type", "application/json");
  const int code = http.POST(body);

  if (code == 200 || code == 201) {
    const String response = http.getString();
    http.end();

    StaticJsonDocument<128> resp;
    if (deserializeJson(resp, response) == DeserializationError::Ok) {
      const String nodeId = resp["nodeId"] | "";
      if (nodeId.length() > 0) {
        const String capability = resp["capability"] | "earth";
        NvsConfig::setNodeCapability(capability == "watering" ? "watering" : "earth");
        Serial.printf("[REG] Assigned node_id=%s (status=%s)\n",
          nodeId.c_str(), (resp["status"] | "unknown"));
        return nodeId;
      }
    }
    Serial.println("[REG] Invalid response body.");

  } else if (code == 403) {
    http.end();
    Serial.println("[REG] Pairing window closed (403). Open window in app.");

  } else {
    http.end();
    Serial.printf("[REG] Unexpected status %d.\n", code);
  }

  return "";
}

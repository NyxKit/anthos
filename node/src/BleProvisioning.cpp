#include "BleProvisioning.h"

#include <ArduinoJson.h>
#include <WiFi.h>

#include "NvsConfig.h"

// ── Hardware ID ─────────────────────────────────────────────────────────────

String BleProvisioning::getHwId() {
  uint64_t mac = ESP.getEfuseMac();
  char buf[13];
  snprintf(buf, sizeof(buf), "%02X%02X%02X%02X%02X%02X",
    (uint8_t)(mac >> 40), (uint8_t)(mac >> 32), (uint8_t)(mac >> 24),
    (uint8_t)(mac >> 16), (uint8_t)(mac >>  8), (uint8_t)(mac));
  return String(buf);
}

String BleProvisioning::getAdvertisementName() {
  String hw = getHwId();
  return "Anthos-" + hw.substring(8);  // last 4 chars
}

// ── NimBLE callbacks ────────────────────────────────────────────────────────

void BleProvisioning::onConnect(NimBLEServer*) {
  clientConnected_ = true;
  Serial.println("[BLE] Client connected");
}

void BleProvisioning::onDisconnect(NimBLEServer* server) {
  clientConnected_ = false;
  Serial.println("[BLE] Client disconnected");
  if (!provisioningDone_) {
    server->startAdvertising();
  }
}

void BleProvisioning::onWrite(NimBLECharacteristic* characteristic) {
  const String raw = characteristic->getValue().c_str();
  Serial.printf("[BLE] Credentials received (%d bytes)\n", raw.length());

  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, raw) != DeserializationError::Ok) {
    Serial.println("[BLE] Invalid JSON in credentials");
    return;
  }

  const String ssid      = doc["ssid"] | "";
  const String pass      = doc["pass"] | "";
  const String serverUrl = doc["serverUrl"] | "";

  if (ssid.length() == 0) {
    Serial.println("[BLE] Missing ssid — ignoring");
    return;
  }

  // Persist before attempting WiFi (T039: store serverUrl if provided)
  NvsConfig::setWifiCredentials(ssid, pass);
  if (serverUrl.length() > 0) {
    NvsConfig::setServerUrl(serverUrl);
  }

  notifyStatus("connecting");

  if (attemptWifiConnect(ssid, pass)) {
    // Store mDNS-resolved URL if no serverUrl was provided (handled by HubClient later)
    String ip = WiFi.localIP().toString();
    notifyStatus("success", ip);
    provisioningSuccess_ = true;
  } else {
    notifyStatus("failed", "timeout");
    provisioningSuccess_ = false;
  }

  provisioningDone_ = true;
}

// ── WiFi connect ─────────────────────────────────────────────────────────────

bool BleProvisioning::attemptWifiConnect(const String& ssid, const String& pass) {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  Serial.printf("[WIFI] Connecting to %s...\n", ssid.c_str());

  const unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > kWifiTimeoutMs) {
      Serial.println("[WIFI] Connection timed out");
      WiFi.disconnect();
      return false;
    }
    delay(200);
  }

  Serial.printf("[WIFI] Connected. IP: %s\n", WiFi.localIP().toString().c_str());
  return true;
}

// ── Status notify ────────────────────────────────────────────────────────────

void BleProvisioning::notifyStatus(const String& status, const String& extra) {
  if (!statusChar_) return;

  StaticJsonDocument<128> doc;
  doc["status"] = status;
  if (extra.length() > 0) {
    // Distinguish IP (success) from reason (failed)
    if (status == "success") {
      doc["ip"] = extra;
    } else if (status == "failed") {
      doc["reason"] = extra;
    }
  }

  String payload;
  serializeJson(doc, payload);
  statusChar_->setValue(payload.c_str());
  statusChar_->notify();
  Serial.printf("[BLE] Status: %s\n", payload.c_str());
}

// ── begin() / stop() ─────────────────────────────────────────────────────────

bool BleProvisioning::begin() {
  const String name = getAdvertisementName();
  NimBLEDevice::init(name.c_str());

  NimBLEServer* server = NimBLEDevice::createServer();
  server->setCallbacks(this);

  NimBLEService* service = server->createService(kServiceUuid);

  // Credentials characteristic (write)
  NimBLECharacteristic* credsChar = service->createCharacteristic(
    kCredsUuid, NIMBLE_PROPERTY::WRITE);
  credsChar->setCallbacks(this);

  // Status characteristic (notify)
  statusChar_ = service->createCharacteristic(
    kStatusUuid, NIMBLE_PROPERTY::NOTIFY);

  service->start();

  NimBLEAdvertising* adv = NimBLEDevice::getAdvertising();
  adv->addServiceUUID(kServiceUuid);
  adv->setName(name.c_str());
  adv->start();

  Serial.printf("[BLE] Advertising as \"%s\"\n", name.c_str());

  // Block until provisioning completes (credentials written + WiFi attempted)
  while (!provisioningDone_) {
    delay(100);
  }

  // Small delay to let the status notification reach the client before BLE closes
  delay(500);
  stop();

  return provisioningSuccess_;
}

void BleProvisioning::stop() {
  NimBLEDevice::getAdvertising()->stop();
  Serial.println("[BLE] Session closed");
}

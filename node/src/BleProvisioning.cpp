#include "BleProvisioning.h"

#include <ArduinoJson.h>
#include <WiFi.h>
#include <cstring>

#include "NvsConfig.h"

namespace {
const char* describeAuthMode(wifi_auth_mode_t authmode) {
  switch (authmode) {
    case WIFI_AUTH_OPEN: return "open";
    case WIFI_AUTH_WEP: return "wep";
    case WIFI_AUTH_WPA_PSK: return "wpa";
    case WIFI_AUTH_WPA2_PSK: return "wpa2";
    case WIFI_AUTH_WPA_WPA2_PSK: return "wpa/wpa2";
    case WIFI_AUTH_WPA2_ENTERPRISE: return "wpa2-enterprise";
    case WIFI_AUTH_WPA3_PSK: return "wpa3";
    case WIFI_AUTH_WPA2_WPA3_PSK: return "wpa2/wpa3";
    default: return "unknown";
  }
}

bool parseBssid(const String& value, uint8_t (&bssid)[6]) {
  if (value.length() != 17) {
    return false;
  }

  unsigned int bytes[6] = {0, 0, 0, 0, 0, 0};
  if (std::sscanf(value.c_str(), "%02x:%02x:%02x:%02x:%02x:%02x",
                  &bytes[0], &bytes[1], &bytes[2], &bytes[3], &bytes[4], &bytes[5]) != 6) {
    return false;
  }

  for (size_t index = 0; index < 6; ++index) {
    bssid[index] = static_cast<uint8_t>(bytes[index]);
  }

  return true;
}

struct WifiCandidate {
  uint8_t bssid[6];
  int32_t channel;
  int rssi;
  String bssidStr;
};

bool select2_4GhzBssid(const String& targetSsid, WifiCandidate& best, WifiCandidate& secondary) {
  const int networks = WiFi.scanNetworks();
  if (networks <= 0) {
    Serial.printf("[WIFI] Scan found no networks for %s\n", targetSsid.c_str());
    return false;
  }

  int bestIndex = -1;
  int secondaryIndex = -1;
  int bestRssi = -1000;
  int secondaryRssi = -1000;
  for (int index = 0; index < networks; ++index) {
    if (WiFi.SSID(index) != targetSsid) {
      continue;
    }

    const int32_t candidateChannel = WiFi.channel(index);
    if (candidateChannel < 1 || candidateChannel > 13) {
      continue;
    }

    const int candidateRssi = WiFi.RSSI(index);
    Serial.printf("[WIFI] Found SSID %s bssid=%s channel=%ld rssi=%d auth=%s\n",
                  targetSsid.c_str(), WiFi.BSSIDstr(index).c_str(),
                  static_cast<long>(candidateChannel), candidateRssi,
                  describeAuthMode(WiFi.encryptionType(index)));
    if (candidateRssi > bestRssi) {
      secondaryRssi = bestRssi;
      secondaryIndex = bestIndex;
      bestRssi = candidateRssi;
      bestIndex = index;
    } else if (candidateRssi > secondaryRssi) {
      secondaryRssi = candidateRssi;
      secondaryIndex = index;
    }
  }

  if (bestIndex < 0) {
    Serial.printf("[WIFI] No 2.4 GHz BSSID found for SSID %s\n", targetSsid.c_str());
    WiFi.scanDelete();
    return false;
  }

  best.bssidStr = WiFi.BSSIDstr(bestIndex);
  best.channel = WiFi.channel(bestIndex);
  best.rssi = WiFi.RSSI(bestIndex);
  const bool parsedBest = parseBssid(best.bssidStr, best.bssid);

  if (secondaryIndex >= 0) {
    secondary.bssidStr = WiFi.BSSIDstr(secondaryIndex);
    secondary.channel = WiFi.channel(secondaryIndex);
    secondary.rssi = WiFi.RSSI(secondaryIndex);
    const bool parsedSecondary = parseBssid(secondary.bssidStr, secondary.bssid);
    WiFi.scanDelete();
    return parsedBest && parsedSecondary;
  }

  WiFi.scanDelete();
  return parsedBest;
}
}

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

const char* BleProvisioning::describeWifiDisconnectReason(uint8_t reason) {
  switch (reason) {
    case WIFI_REASON_AUTH_EXPIRE:
      return "auth_expired";
    case WIFI_REASON_AUTH_FAIL:
      return "auth_failed";
    case WIFI_REASON_NO_AP_FOUND:
      return "ap_not_found";
    case WIFI_REASON_ASSOC_FAIL:
      return "assoc_failed";
    case WIFI_REASON_HANDSHAKE_TIMEOUT:
      return "handshake_timeout";
    case WIFI_REASON_BEACON_TIMEOUT:
      return "beacon_timeout";
    case WIFI_REASON_MIC_FAILURE:
      return "mic_failure";
    case WIFI_REASON_4WAY_HANDSHAKE_TIMEOUT:
      return "4way_handshake_timeout";
    case WIFI_REASON_GROUP_KEY_UPDATE_TIMEOUT:
      return "group_key_timeout";
    default:
      return "unknown";
  }
}

void BleProvisioning::handleWifiDisconnect(uint8_t reason) {
  wifiDisconnectReason_ = reason;
  Serial.printf("[WIFI] Disconnected reason=%u (%s)\n", reason, describeWifiDisconnectReason(reason));
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

  // Persist the user-provided credentials immediately so a failed join doesn't discard them.
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
    const String reason = String(describeWifiDisconnectReason(wifiDisconnectReason_));
    notifyStatus("failed", reason);
    provisioningSuccess_ = false;
  }

  provisioningDone_ = true;
}

// ── WiFi connect ─────────────────────────────────────────────────────────────

bool BleProvisioning::attemptWifiConnect(const String& ssid, const String& pass) {
  WiFi.mode(WIFI_STA);
  wifiDisconnectReason_ = 0;

  wifiDisconnectEventId_ = WiFi.onEvent([this](WiFiEvent_t event, WiFiEventInfo_t info) {
    if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
      handleWifiDisconnect(info.wifi_sta_disconnected.reason);
    }
  }, ARDUINO_EVENT_WIFI_STA_DISCONNECTED);

  WifiCandidate primary{};
  WifiCandidate secondary{};
  const bool hasBssid = select2_4GhzBssid(ssid, primary, secondary);

  if (hasBssid) {
    Serial.printf("[WIFI] Connecting to %s via %s on channel %ld...\n",
                  ssid.c_str(), primary.bssidStr.c_str(), static_cast<long>(primary.channel));
    WiFi.begin(ssid.c_str(), pass.c_str(), primary.channel, primary.bssid, true);
  } else {
    Serial.printf("[WIFI] Connecting to %s without BSSID pinning...\n", ssid.c_str());
    WiFi.begin(ssid.c_str(), pass.c_str());
  }

  const unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > kWifiTimeoutMs) {
      Serial.printf("[WIFI] Connection timed out (last reason=%u %s)\n",
                    wifiDisconnectReason_, describeWifiDisconnectReason(wifiDisconnectReason_));
      WiFi.disconnect();
      if (wifiDisconnectEventId_ != 0) {
        WiFi.removeEvent(wifiDisconnectEventId_);
        wifiDisconnectEventId_ = 0;
      }

      if (hasBssid && secondary.channel > 0) {
        Serial.printf("[WIFI] Retrying %s via %s on channel %ld...\n",
                      ssid.c_str(), secondary.bssidStr.c_str(), static_cast<long>(secondary.channel));
        wifiDisconnectReason_ = 0;
        wifiDisconnectEventId_ = WiFi.onEvent([this](WiFiEvent_t event, WiFiEventInfo_t info) {
          if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
            handleWifiDisconnect(info.wifi_sta_disconnected.reason);
          }
        }, ARDUINO_EVENT_WIFI_STA_DISCONNECTED);
        WiFi.begin(ssid.c_str(), pass.c_str(), secondary.channel, secondary.bssid, true);

        const unsigned long retryStart = millis();
        while (WiFi.status() != WL_CONNECTED) {
          if (millis() - retryStart > kWifiTimeoutMs) {
            Serial.printf("[WIFI] Retry timed out (last reason=%u %s)\n",
                          wifiDisconnectReason_, describeWifiDisconnectReason(wifiDisconnectReason_));
            WiFi.disconnect();
            if (wifiDisconnectEventId_ != 0) {
              WiFi.removeEvent(wifiDisconnectEventId_);
              wifiDisconnectEventId_ = 0;
            }
            break;
          }
          delay(200);
        }

        if (WiFi.status() == WL_CONNECTED) {
          Serial.printf("[WIFI] Connected. IP: %s\n", WiFi.localIP().toString().c_str());
          if (wifiDisconnectEventId_ != 0) {
            WiFi.removeEvent(wifiDisconnectEventId_);
            wifiDisconnectEventId_ = 0;
          }
          return true;
        }
      }

      if (hasBssid) {
        Serial.printf("[WIFI] Retrying %s without BSSID pinning...\n", ssid.c_str());
        wifiDisconnectReason_ = 0;
        wifiDisconnectEventId_ = WiFi.onEvent([this](WiFiEvent_t event, WiFiEventInfo_t info) {
          if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
            handleWifiDisconnect(info.wifi_sta_disconnected.reason);
          }
        }, ARDUINO_EVENT_WIFI_STA_DISCONNECTED);
        WiFi.begin(ssid.c_str(), pass.c_str());

        const unsigned long retryStart = millis();
        while (WiFi.status() != WL_CONNECTED) {
          if (millis() - retryStart > kWifiTimeoutMs) {
            Serial.printf("[WIFI] Retry timed out (last reason=%u %s)\n",
                          wifiDisconnectReason_, describeWifiDisconnectReason(wifiDisconnectReason_));
            WiFi.disconnect();
            if (wifiDisconnectEventId_ != 0) {
              WiFi.removeEvent(wifiDisconnectEventId_);
              wifiDisconnectEventId_ = 0;
            }
            return false;
          }
          delay(200);
        }
      } else {
        return false;
      }
    }
    delay(200);
  }

  Serial.printf("[WIFI] Connected. IP: %s\n", WiFi.localIP().toString().c_str());
  if (wifiDisconnectEventId_ != 0) {
    WiFi.removeEvent(wifiDisconnectEventId_);
    wifiDisconnectEventId_ = 0;
  }
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
  NimBLEAdvertising* adv = NimBLEDevice::getAdvertising();

  if (!initialized_) {
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
    adv->addServiceUUID(kServiceUuid);
    initialized_ = true;
  }

  provisioningDone_ = false;
  provisioningSuccess_ = false;
  wifiDisconnectReason_ = 0;
  clientConnected_ = false;

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

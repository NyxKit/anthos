#include "ProvisioningManager.h"

#include <WebServer.h>
#include <WiFi.h>

#include <ESPmDNS.h>

#include "AppConfig.h"
#include "BleProvisioning.h"
#include "HubClient.h"
#include "NvsConfig.h"

// Firmware version constant — update on each release
static constexpr const char* kFirmwareVersion = "1.0.0";

void ProvisioningManager::begin() {
  // ONE-TIME: clear NVS so BLE provisioning runs fresh. Remove after testing.
  NvsConfig::clearAll();

  if (!NvsConfig::hasWifiCredentials()) {
    state_ = BootState::NO_CREDS;
    Serial.println("[BOOT] No credentials. Entering BLE provisioning mode.");
    runBleProvisioning();
  } else if (!NvsConfig::hasNodeId()) {
    state_ = BootState::NO_NODE_ID;
    Serial.println("[BOOT] WiFi credentials found, no node_id. Starting registration.");
    runHubRegistration();
  } else {
    state_ = BootState::READY;
    Serial.println("[BOOT] Fully configured. Starting telemetry loop.");
  }
}

void ProvisioningManager::loop() {
  checkFactoryReset();
}

void ProvisioningManager::runBleProvisioning() {
  BleProvisioning ble;
  const bool success = ble.begin();

  if (success) {
    Serial.println("[PROV] WiFi provisioning succeeded. Proceeding to hub registration.");
    state_ = BootState::NO_NODE_ID;
    runHubRegistration();
  } else {
    // BLE session ended without success — try AP fallback
    Serial.println("[PROV] BLE failed. Starting AP captive portal.");
    runApFallback();
  }
}

void ProvisioningManager::runHubRegistration() {
  // Wait for WiFi connection first (credentials are in NVS from BLE provisioning)
  Serial.println("[PROV] Waiting for WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(NvsConfig::getWifiSsid().c_str(), NvsConfig::getWifiPass().c_str());

  const unsigned long wifiStart = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - wifiStart > 30000) {
      Serial.println("[PROV] WiFi timeout. Restarting.");
      ESP.restart();
    }
    delay(200);
  }
  Serial.printf("[PROV] WiFi connected. IP: %s\n", WiFi.localIP().toString().c_str());

  // Initialize mDNS now that WiFi is up
  MDNS.begin("anthos-node");

  // Register with hub — retry every 30s, checking factory-reset button between attempts
  HubClient hub;
  const String hwId = BleProvisioning::getHwId();

  while (true) {
    const String nodeId = hub.tryRegisterOnce(hwId, kFirmwareVersion);
    if (nodeId.length() > 0) {
      NvsConfig::setNodeId(nodeId);
      Serial.printf("[PROV] Registered. node_id=%s. Starting telemetry loop.\n", nodeId.c_str());
      state_ = BootState::READY;
      return;
    }

    Serial.println("[REG] Retrying in 30s... (hold button 3s to factory reset)");
    const unsigned long retryStart = millis();
    while (millis() - retryStart < 30000) {
      checkFactoryReset();
      delay(100);
    }
  }
}

void ProvisioningManager::runApFallback() {
  Serial.println("[AP] Starting AP captive portal \"Anthos-Setup\"...");

  WiFi.mode(WIFI_AP);
  WiFi.softAP("Anthos-Setup");
  Serial.printf("[AP] AP started. IP: %s\n", WiFi.softAPIP().toString().c_str());

  WebServer server(80);

  // Serve a minimal HTML form at "/"
  server.on("/", HTTP_GET, [&server]() {
    server.send(200, "text/html",
      "<!DOCTYPE html><html><head><meta charset='utf-8'>"
      "<title>Anthos Setup</title></head><body>"
      "<h2>Anthos Node Setup</h2>"
      "<form method='POST' action='/save'>"
      "<label>SSID:<br><input name='ssid' type='text' required></label><br><br>"
      "<label>Password:<br><input name='pass' type='password'></label><br><br>"
      "<input type='submit' value='Connect'>"
      "</form></body></html>");
  });

  // Handle form POST at "/save"
  server.on("/save", HTTP_POST, [&server]() {
    const String ssid = server.arg("ssid");
    const String pass = server.arg("pass");

    if (ssid.length() == 0) {
      server.send(400, "text/plain", "SSID required");
      return;
    }

    NvsConfig::setWifiCredentials(ssid, pass);
    server.send(200, "text/html",
      "<!DOCTYPE html><html><body>"
      "<h2>Credentials saved. Restarting...</h2>"
      "</body></html>");
    delay(1000);
    ESP.restart();
  });

  server.begin();
  Serial.println("[AP] HTTP server started. Waiting for credentials...");

  // Serve requests indefinitely until credentials are submitted (ESP.restart() exits)
  while (true) {
    server.handleClient();
    delay(10);
  }
}

void ProvisioningManager::checkFactoryReset() {
  const bool pressed = (digitalRead(kButtonPin) == LOW);

  if (pressed && !buttonWasPressed_) {
    buttonPressedAt_ = millis();
    buttonWasPressed_ = true;
  } else if (!pressed) {
    buttonWasPressed_ = false;
    buttonPressedAt_ = 0;
  }

  if (buttonWasPressed_ && millis() - buttonPressedAt_ >= kHoldMs) {
    Serial.println("[RESET] Factory reset triggered. Clearing NVS.");
    NvsConfig::factoryReset();  // calls ESP.restart()
  }
}

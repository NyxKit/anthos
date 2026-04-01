#include "EarthSensor.h"

#include <ArduinoJson.h>

void EarthSensor::begin(bool forceRetry) {
  (void)forceRetry;

  if (kAppConfig.portMode != PortMode::EarthOnly) {
    available_ = false;
    printUnavailable("earth", "port_mode_mismatch");
    return;
  }

  pinMode(kAppConfig.portYellowPin, INPUT);
  available_ = true;
  Serial.printf("sensor=earth status=ready analog_pin=%u digital_pin=%u\n",
                kAppConfig.portWhitePin,
                kAppConfig.portYellowPin);
}

void EarthSensor::read() {
  if (!available_) {
    return;
  }

  lastRaw_ = analogRead(kAppConfig.portWhitePin);
  lastDigital_ = digitalRead(kAppConfig.portYellowPin);
  Serial.printf("sensor=earth status=ok raw=%d digital=%d\n", lastRaw_, lastDigital_);
}

String EarthSensor::toJson() const {
  if (!available_) {
    return "";
  }
  StaticJsonDocument<128> doc;
  JsonArray arr = doc.to<JsonArray>();

  JsonObject moist = arr.add<JsonObject>();
  moist["type"] = "moisture";
  moist["value"] = lastRaw_;
  moist["unit"] = "raw";

  JsonObject probe = arr.add<JsonObject>();
  probe["type"] = "probe";
  probe["value"] = lastDigital_;
  probe["unit"] = "bool";

  String json;
  serializeJson(doc, json);
  return json;
}

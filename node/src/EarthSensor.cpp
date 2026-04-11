#include "EarthSensor.h"

#include <ArduinoJson.h>

void EarthSensor::begin(bool forceRetry) {
  (void)forceRetry;

  if (kAppConfig.portMode == PortMode::I2cSensors) {
    available_ = false;
    Serial.println("sensor=earth status=unavailable port_mode_mismatch");
    return;
  }

  pinMode(kAppConfig.earthWhitePin, INPUT);
  pinMode(kAppConfig.earthYellowPin, INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(kAppConfig.earthWhitePin, ADC_11db);
  available_ = true;
  Serial.printf("sensor=earth status=ready analog_pin=%u digital_pin=%u\n",
                kAppConfig.earthWhitePin,
                kAppConfig.earthYellowPin);
}

void EarthSensor::read() {
  if (!available_) {
    return;
  }

  const int rawMv = analogReadMilliVolts(kAppConfig.earthWhitePin);
  lastRaw_ = analogRead(kAppConfig.earthWhitePin);
  lastDigital_ = digitalRead(kAppConfig.earthYellowPin);
  Serial.printf("sensor=earth status=ok raw=%d mv=%d digital=%d\n",
                lastRaw_, rawMv, lastDigital_);
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

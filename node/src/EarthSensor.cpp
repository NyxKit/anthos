#include "EarthSensor.h"

#include <ArduinoJson.h>

#include "NvsConfig.h"

void EarthSensor::begin(bool forceRetry) {
  (void)forceRetry;

  const String capability = NvsConfig::getNodeCapability();
  wateringProfile_ = capability == "watering";

  if (kAppConfig.portMode == PortMode::I2cSensors) {
    available_ = false;
    Serial.println("sensor=earth status=unavailable port_mode_mismatch");
    return;
  }

  const uint8_t analogPin = kAppConfig.earthWhitePin;
  const uint8_t digitalPin = kAppConfig.earthYellowPin;

  pinMode(analogPin, INPUT);
  if (!wateringProfile_) {
    pinMode(digitalPin, INPUT);
  }
  analogReadResolution(12);
  analogSetPinAttenuation(analogPin, ADC_11db);
  available_ = true;
  if (wateringProfile_) {
    Serial.printf("sensor=earth status=ready profile=watering analog_pin=%u pump_pin=%u\n", analogPin, digitalPin);
  } else {
    Serial.printf("sensor=earth status=ready profile=earth analog_pin=%u digital_pin=%u\n", analogPin, digitalPin);
  }
}

void EarthSensor::read() {
  if (!available_) {
    return;
  }

  const uint8_t analogPin = kAppConfig.earthWhitePin;

  const int rawMv = analogReadMilliVolts(analogPin);
  lastRaw_ = analogRead(analogPin);
  lastDigital_ = wateringProfile_ ? 0 : digitalRead(kAppConfig.earthYellowPin);
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

  if (!wateringProfile_) {
    JsonObject probe = arr.add<JsonObject>();
    probe["type"] = "probe";
    probe["value"] = lastDigital_;
    probe["unit"] = "bool";
  }

  String json;
  serializeJson(doc, json);
  return json;
}

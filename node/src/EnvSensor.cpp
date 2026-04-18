#include "EnvSensor.h"

#include <ArduinoJson.h>
#include <Wire.h>

namespace {
bool probeI2cAddress(const uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}
}

void EnvSensor::begin(bool forceRetry) {
  if (kAppConfig.portMode == PortMode::EarthOnly) {
    enviiiAvailable_ = false;
    envproAvailable_ = false;
    printUnavailable("enviii", "port_mode_mismatch");
    printUnavailable("envpro", "port_mode_mismatch");
    return;
  }

  if (!forceRetry && (enviiiAvailable_ || envproAvailable_)) {
    return;
  }
  if (!shouldRetry(lastInitAttemptAt_, forceRetry)) {
    return;
  }

  const bool hasSht30 = probeI2cAddress(0x44);
  const bool hasQmp6988 = probeI2cAddress(0x70);
  const bool hasEnvpro77 = probeI2cAddress(0x77);
  const bool hasEnvpro76 = probeI2cAddress(0x76);

  Serial.printf("sensor=i2c detect sht30=%s qmp6988=%s bme688_77=%s bme688_76=%s\n",
                hasSht30 ? "yes" : "no", hasQmp6988 ? "yes" : "no",
                hasEnvpro77 ? "yes" : "no", hasEnvpro76 ? "yes" : "no");

  if (!unitsAdded_) {
    if (hasSht30 && hasQmp6988) {
      units_.add(enviii_, Wire);
    }

    if (hasEnvpro77) {
      units_.add(envpro_, Wire);
      useEnvproAlt_ = false;
    } else if (hasEnvpro76) {
      units_.add(envproAlt_, Wire);
      useEnvproAlt_ = true;
    }

    unitsAdded_ = true;
  }
  units_.begin();
  
  enviiiAvailable_ = hasSht30 && hasQmp6988;
  if (enviiiAvailable_) {
    enviii_.sht30.startPeriodicMeasurement();
    enviii_.qmp6988.startPeriodicMeasurement();
    Serial.printf("sensor=enviii ready addr_sht30=0x%02X addr_qmp6988=0x%02X\n",
                  enviii_.sht30.address(), enviii_.qmp6988.address());
  } else {
    Serial.println("sensor=enviii init_failed");
  }

  envproAvailable_ = hasEnvpro77 || hasEnvpro76;
  if (envproAvailable_) {
    if (useEnvproAlt_) {
      envproAlt_.startPeriodicMeasurement(m5::unit::bme688::Mode::Forced);
      Serial.printf("sensor=envpro ready addr=0x%02X\n", envproAlt_.address());
    } else {
      envpro_.startPeriodicMeasurement(m5::unit::bme688::Mode::Forced);
      Serial.printf("sensor=envpro ready addr=0x%02X\n", envpro_.address());
    }
  } else {
    Serial.println("sensor=envpro init_failed");
  }
}

void EnvSensor::read() {
  if (!enviiiAvailable_ && !envproAvailable_) {
    begin(false);
    return;
  }

  units_.update();

  auto& envproUnit = useEnvproAlt_ ? envproAlt_ : envpro_;

  const bool sht30Ok = enviiiAvailable_ && enviii_.sht30.updated();
  const bool qmpOk = enviiiAvailable_ && enviii_.qmp6988.updated();
  bool envproOk = envproAvailable_ && envproUnit.updated();

  Serial.printf("sensor=check sht30=%s qmp=%s envpro=%s\n", 
    sht30Ok ? "yes" : "no", qmpOk ? "yes" : "no", envproOk ? "yes" : "no");

  bool hasFreshReading = false;
  if (envproAvailable_ && envproOk) {
    lastTemp_ = envproUnit.temperature();
    lastHumidity_ = envproUnit.humidity();
    lastPressure_ = envproUnit.pressure();
    hasFreshReading = true;
    Serial.printf("sensor=envpro status=ok temp_c=%.2f humidity_pct=%.2f pressure_pa=%.2f\n",
                  lastTemp_, lastHumidity_, lastPressure_);
  } else {
    if (sht30Ok) {
      lastTemp_ = enviii_.sht30.temperature();
      lastHumidity_ = enviii_.sht30.humidity();
      hasFreshReading = true;
      Serial.printf("sensor=sht30 ok temp=%.2f hum=%.2f\n", lastTemp_, lastHumidity_);
    }
    if (qmpOk) {
      lastPressure_ = enviii_.qmp6988.pressure();
      hasFreshReading = true;
      Serial.printf("sensor=qmp6988 ok pres=%.2f\n", lastPressure_);
    }
  }

  if (enviiiAvailable_ && (sht30Ok || qmpOk)) {
    Serial.printf("sensor=enviii status=ok temp_c=%.2f humidity_pct=%.2f pressure_pa=%.2f\n",
                  lastTemp_, lastHumidity_, lastPressure_);
  }

  if (!hasFreshReading) {
    Serial.println("sensor=env status=pending");
  }
}

String EnvSensor::toJson() const {
  if (!enviiiAvailable_ && !envproAvailable_) {
    return "";
  }
  StaticJsonDocument<256> doc;
  JsonArray arr = doc.to<JsonArray>();

  JsonObject temp = arr.add<JsonObject>();
  temp["type"] = "temperature";
  temp["value"] = lastTemp_;
  temp["unit"] = "c";

  JsonObject hum = arr.add<JsonObject>();
  hum["type"] = "humidity";
  hum["value"] = lastHumidity_;
  hum["unit"] = "%";

  JsonObject pres = arr.add<JsonObject>();
  pres["type"] = "pressure";
  pres["value"] = lastPressure_;
  pres["unit"] = "pa";

  String json;
  serializeJson(doc, json);
  return json;
}

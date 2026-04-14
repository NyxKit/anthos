#include "PumpActuator.h"

#include "NvsConfig.h"

namespace {
constexpr uint8_t kPumpPin = 39;
}

PumpActuator::PumpActuator(Logger& logger) : logger_(logger) {}

void PumpActuator::begin() {
  ready_ = true;
  const String capability = NvsConfig::getNodeCapability();
  if (capability == "watering") {
    pinMode(kPumpPin, OUTPUT);
    digitalWrite(kPumpPin, LOW);
    Serial.printf("pump status=ready pin=%u profile=watering\n", kPumpPin);
  } else {
    Serial.println("pump status=disabled profile=earth");
  }
}

bool PumpActuator::run(unsigned long durationMs) {
  if (!ready_) {
    begin();
  }

  if (NvsConfig::getNodeCapability() != "watering") {
    Serial.println("pump status=ignored reason=unsupported_profile");
    return false;
  }

  if (durationMs == 0) {
    Serial.println("pump status=error reason=duration_zero");
    return false;
  }

  Serial.printf("pump status=running pin=%u duration_ms=%lu\n", kPumpPin, durationMs);
  digitalWrite(kPumpPin, HIGH);
  delay(durationMs);
  digitalWrite(kPumpPin, LOW);
  Serial.println("pump status=complete");
  return true;
}

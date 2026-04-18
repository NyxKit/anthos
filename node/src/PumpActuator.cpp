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

bool PumpActuator::start(unsigned long durationMs) {
  if (!ready_) {
    begin();
  }

  if (NvsConfig::getNodeCapability() != "watering") {
    Serial.println("pump status=ignored reason=unsupported_profile");
    return false;
  }

  if (running_) {
    Serial.println("pump status=busy reason=already_running");
    return false;
  }

  if (durationMs == 0) {
    Serial.println("pump status=error reason=duration_zero");
    return false;
  }

  Serial.printf("pump status=running pin=%u duration_ms=%lu\n", kPumpPin, durationMs);
  digitalWrite(kPumpPin, HIGH);
  running_ = true;
  completionPending_ = false;
  startedAt_ = millis();
  durationMs_ = durationMs;
  return true;
}

void PumpActuator::loop() {
  if (!running_) return;

  if (millis() - startedAt_ < durationMs_) return;

  digitalWrite(kPumpPin, LOW);
  running_ = false;
  completionPending_ = true;
  Serial.println("pump status=complete");
}

bool PumpActuator::isRunning() const {
  return running_;
}

bool PumpActuator::consumeCompletion() {
  if (!completionPending_) return false;
  completionPending_ = false;
  return true;
}

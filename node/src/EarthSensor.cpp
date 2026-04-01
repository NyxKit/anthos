#include "EarthSensor.h"

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

  const int rawAnalog = analogRead(kAppConfig.portWhitePin);
  const int digitalState = digitalRead(kAppConfig.portYellowPin);
  Serial.printf("sensor=earth status=ok raw=%d digital=%d\n", rawAnalog, digitalState);
}

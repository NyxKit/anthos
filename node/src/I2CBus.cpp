#include "I2CBus.h"

#include <Arduino.h>
#include <Wire.h>

I2CBus::I2CBus(Logger& logger) : logger_(logger) {
}

void I2CBus::scan() const {
  bool foundDevice = false;

  logger_.info("i2c scan: start");
  for (uint8_t address = 1; address < 127; ++address) {
    Wire.beginTransmission(address);
    const uint8_t error = Wire.endTransmission();
    if (error != 0) {
      continue;
    }

    foundDevice = true;
    Serial.printf("i2c device address=0x%02X\n", address);
  }

  if (!foundDevice) {
    logger_.info("i2c scan: no devices found");
  }

  logger_.info("i2c scan: end");
}

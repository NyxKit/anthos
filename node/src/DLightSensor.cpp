#include "DLightSensor.h"

#include <Wire.h>

void DLightSensor::begin(bool forceRetry) {
  if (kAppConfig.portMode != PortMode::I2cSensors) {
    available_ = false;
    printUnavailable("dlight", "port_mode_mismatch");
    return;
  }

  if (!forceRetry && available_) {
    return;
  }
  if (!shouldRetry(lastInitAttemptAt_, forceRetry)) {
    return;
  }

  available_ = meter_.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, kAppConfig.dlightAddress, &Wire);
  if (available_) {
    Serial.printf("sensor=dlight status=ready address=0x%02X\n", kAppConfig.dlightAddress);
    return;
  }

  printUnavailable("dlight", "init_failed");
}

void DLightSensor::read() {
  if (!available_) {
    begin(false);
    return;
  }

  if (!meter_.measurementReady()) {
    Serial.println("sensor=dlight status=pending");
    return;
  }

  const float lux = meter_.readLightLevel();
  if (lux < 0) {
    available_ = false;
    printUnavailable("dlight", "read_failed");
    return;
  }

  Serial.printf("sensor=dlight status=ok lux=%.2f\n", lux);
}

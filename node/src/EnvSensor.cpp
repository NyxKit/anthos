#include "EnvSensor.h"

#include <Wire.h>

void EnvSensor::begin(bool forceRetry) {
  if (!kAppConfig.enableEnvSensor) {
    sht30Available_ = false;
    qmp6988Available_ = false;
    printUnavailable("enviii_sht30", "disabled");
    printUnavailable("enviii_qmp6988", "disabled");
    return;
  }

  if (kAppConfig.portMode != PortMode::I2cSensors) {
    sht30Available_ = false;
    qmp6988Available_ = false;
    printUnavailable("enviii_sht30", "port_mode_mismatch");
    printUnavailable("enviii_qmp6988", "port_mode_mismatch");
    return;
  }

  if (!forceRetry && (sht30Available_ || qmp6988Available_)) {
    return;
  }
  if (!shouldRetry(lastInitAttemptAt_, forceRetry)) {
    return;
  }

  sht30Available_ = sht30_.begin(
      &Wire, SHT3X_I2C_ADDR, kAppConfig.portYellowPin, kAppConfig.portWhitePin, 400000U);
  qmp6988Available_ = qmp6988_.begin(&Wire,
                                     QMP6988_SLAVE_ADDRESS_L,
                                     kAppConfig.portYellowPin,
                                     kAppConfig.portWhitePin,
                                     400000U);

  if (sht30Available_) {
    Serial.printf("sensor=enviii_sht30 status=ready address=0x%02X\n", SHT3X_I2C_ADDR);
  } else {
    printUnavailable("enviii_sht30", "init_failed");
  }

  if (qmp6988Available_) {
    Serial.printf("sensor=enviii_qmp6988 status=ready address=0x%02X\n",
                  QMP6988_SLAVE_ADDRESS_L);
  } else {
    printUnavailable("enviii_qmp6988", "init_failed");
  }
}

void EnvSensor::read() {
  if (!sht30Available_ && !qmp6988Available_) {
    begin(false);
    return;
  }

  if (sht30Available_) {
    if (sht30_.update()) {
      Serial.printf("sensor=enviii_sht30 status=ok temp_c=%.2f humidity_pct=%.2f\n",
                    sht30_.cTemp,
                    sht30_.humidity);
    } else {
      sht30Available_ = false;
      printUnavailable("enviii_sht30", "read_failed");
    }
  }

  if (qmp6988Available_) {
    if (qmp6988_.update()) {
      Serial.printf("sensor=enviii_qmp6988 status=ok temp_c=%.2f pressure_pa=%.2f altitude_m=%.2f\n",
                    qmp6988_.cTemp,
                    qmp6988_.pressure,
                    qmp6988_.altitude);
    } else {
      qmp6988Available_ = false;
      printUnavailable("enviii_qmp6988", "read_failed");
    }
  }
}

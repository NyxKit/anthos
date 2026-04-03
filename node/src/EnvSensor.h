#pragma once

#include <M5UnitUnified.h>
#include <M5UnitUnifiedENV.h>

#include "SensorBase.h"

class EnvSensor : public SensorBase {
 public:
  void begin(bool forceRetry = true) override;
  void read() override;
  String toJson() const override;

 private:
  m5::unit::UnitUnified units_;
  m5::unit::UnitENV3 enviii_;
  m5::unit::UnitENVPro envpro_;
  m5::unit::UnitENVPro envproAlt_{0x76};
  bool unitsAdded_ = false;
  bool useEnvproAlt_ = false;
  bool enviiiAvailable_ = false;
  bool envproAvailable_ = false;
  float lastTemp_ = 0;
  float lastHumidity_ = 0;
  float lastPressure_ = 0;
  unsigned long lastInitAttemptAt_ = 0;
};

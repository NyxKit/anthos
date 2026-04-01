#pragma once

#include <M5UnitENV.h>

#include "SensorBase.h"

class EnvSensor : public SensorBase {
 public:
  void begin(bool forceRetry = true) override;
  void read() override;
  String toJson() const override;

 private:
  SHT3X sht30_;
  QMP6988 qmp6988_;
  bool sht30Available_ = false;
  bool qmp6988Available_ = false;
  float lastTemp_ = 0;
  float lastHumidity_ = 0;
  float lastPressure_ = 0;
  unsigned long lastInitAttemptAt_ = 0;
};

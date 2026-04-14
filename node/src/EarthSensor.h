#pragma once

#include "SensorBase.h"

class EarthSensor : public SensorBase {
 public:
  void begin(bool forceRetry = true) override;
  void read() override;
  String toJson() const override;

 private:
  bool available_ = false;
  bool wateringProfile_ = false;
  int lastRaw_ = 0;
  int lastDigital_ = 0;
};

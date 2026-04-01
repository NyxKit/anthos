#pragma once

#include "SensorBase.h"

class EarthSensor : public SensorBase {
 public:
  void begin(bool forceRetry = true) override;
  void read() override;

 private:
  bool available_ = false;
};

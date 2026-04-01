#pragma once

#include <BH1750.h>

#include "SensorBase.h"

class DLightSensor : public SensorBase {
 public:
  void begin(bool forceRetry = true) override;
  void read() override;
  String toJson() const override;

 private:
  BH1750 meter_;
  bool available_ = false;
  float lastLux_ = 0;
  unsigned long lastInitAttemptAt_ = 0;
};

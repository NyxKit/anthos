#pragma once

#include <BH1750.h>

#include "SensorBase.h"

class DLightSensor : public SensorBase {
 public:
  void begin(bool forceRetry = true) override;
  void read() override;

 private:
  BH1750 meter_;
  bool available_ = false;
  unsigned long lastInitAttemptAt_ = 0;
};

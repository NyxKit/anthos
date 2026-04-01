#pragma once

#include "AppConfig.h"
#include "DLightSensor.h"
#include "EarthSensor.h"
#include "EnvSensor.h"

class SensorManager {
 public:
  void begin();
  void readAll();

 private:
  DLightSensor dlight_;
  EnvSensor env_;
  EarthSensor earth_;
};

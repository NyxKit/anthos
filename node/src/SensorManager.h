#pragma once

#include "AppConfig.h"
#include "DLightSensor.h"
#include "EarthSensor.h"
#include "EnvSensor.h"

class SensorManager {
 public:
  void begin();
  void suspend();
  void resume();
  void readAll();
  String readAllJson() const;

 private:
  bool suspended_ = false;
  DLightSensor dlight_;
  EnvSensor env_;
  EarthSensor earth_;
};

#include "SensorManager.h"

void SensorManager::begin() {
  dlight_.begin(true);
  earth_.begin(true);
}

void SensorManager::readAll() {
  dlight_.read();
  env_.read();
  earth_.read();
}

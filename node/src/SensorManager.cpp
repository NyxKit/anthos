#include "SensorManager.h"

#include <Arduino.h>

void SensorManager::begin() {
  dlight_.begin(true);
  earth_.begin(true);
}

void SensorManager::readAll() {
  dlight_.read();
  env_.read();
  earth_.read();
}

String SensorManager::readAllJson() const {
  String json = "[";
  bool first = true;

  String dlightJson = dlight_.toJson();
  if (dlightJson.length() > 0) {
    if (!first) json += ",";
    if (dlightJson.startsWith("[")) {
      json += dlightJson.substring(1, dlightJson.length() - 1);
    } else {
      json += dlightJson;
    }
    first = false;
  }

  String envJson = env_.toJson();
  if (envJson.length() > 0) {
    if (!first) json += ",";
    if (envJson.startsWith("[")) {
      json += envJson.substring(1, envJson.length() - 1);
    } else {
      json += envJson;
    }
    first = false;
  }

  String earthJson = earth_.toJson();
  if (earthJson.length() > 0) {
    if (!first) json += ",";
    if (earthJson.startsWith("[")) {
      json += earthJson.substring(1, earthJson.length() - 1);
    } else {
      json += earthJson;
    }
  }

  json += "]";
  return json;
}

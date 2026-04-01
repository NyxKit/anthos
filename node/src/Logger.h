#pragma once

#include <Arduino.h>

class Logger {
 public:
  void begin(unsigned long baudRate) const;
  void line() const;
  void boot(const char* nodeId, const char* portMode) const;
  void portPins(uint8_t yellowPin, uint8_t whitePin) const;
  void info(const char* message) const;
  void sensorUnavailable(const char* sensorName, const char* reason) const;
};

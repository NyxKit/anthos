#pragma once

#include <Arduino.h>

class NtpSync {
 public:
  void begin();
  void loop();
  bool isSynced() const;
  unsigned long long nowMs() const;

 private:
  bool synced_ = false;
  unsigned long lastCheckAt_ = 0;
};

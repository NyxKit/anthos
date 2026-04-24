#pragma once

#include <Arduino.h>

class PowerPolicy {
 public:
  static constexpr unsigned long kSuspendCutoffMs = 5UL * 60UL * 1000UL;
  static constexpr unsigned long kSuspendHoldMs = 10UL * 1000UL;

  static bool staysAwakeBetweenTelemetry(unsigned long intervalMs);
  static bool shouldSuspendAfterTelemetry(unsigned long intervalMs);
};

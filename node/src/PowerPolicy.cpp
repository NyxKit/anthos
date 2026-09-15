#include "PowerPolicy.h"

bool PowerPolicy::isValidInterval(unsigned long intervalMs) {
  return intervalMs == 1000UL || intervalMs == 600000UL || intervalMs == 3600000UL;
}

bool PowerPolicy::staysAwakeBetweenTelemetry(unsigned long intervalMs) {
  return intervalMs < kSuspendCutoffMs;
}

bool PowerPolicy::shouldSuspendAfterTelemetry(unsigned long intervalMs) {
  return !staysAwakeBetweenTelemetry(intervalMs);
}

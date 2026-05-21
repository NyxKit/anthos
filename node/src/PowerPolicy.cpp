#include "PowerPolicy.h"

bool PowerPolicy::staysAwakeBetweenTelemetry(unsigned long intervalMs) {
  return intervalMs < kSuspendCutoffMs;
}

bool PowerPolicy::shouldSuspendAfterTelemetry(unsigned long intervalMs) {
  return !staysAwakeBetweenTelemetry(intervalMs);
}

bool PowerPolicy::shouldDisableWifiSleep(bool bleInitialized, bool performanceProfile) {
  return performanceProfile && !bleInitialized;
}

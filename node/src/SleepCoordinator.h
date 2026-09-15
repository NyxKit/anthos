#pragma once

#include <cstdint>

#include "PowerPolicy.h"

// Owns the wake-cycle grace period. Callbacks read live state after the final
// poll, which can start an action or replace the operating profile.
class SleepCoordinator {
 public:
  void onSuccessfulPublish(uint32_t now);

  template <typename Poll, typename Interval, typename PendingWork>
  uint32_t prepareSleep(uint32_t now, Poll poll, Interval interval, PendingWork pendingWork) {
    if (state_ != State::Holding) return 0;
    if (!PowerPolicy::shouldSuspendAfterTelemetry(interval())) {
      state_ = State::Idle;
      return 0;
    }
    if (static_cast<uint32_t>(now - holdStartedAt_) < PowerPolicy::kSuspendHoldMs || pendingWork()) {
      return 0;
    }
    if (!poll()) {
      // Failed final polls stay failures. Space attempts by the existing grace
      // period; a bounded sleep-with-durable-work policy awaits OD-004.
      holdStartedAt_ = now;
      return 0;
    }
    const uint32_t currentInterval = interval();
    if (!PowerPolicy::shouldSuspendAfterTelemetry(currentInterval)) {
      state_ = State::Idle;
      return 0;
    }
    if (pendingWork()) return 0;
    state_ = State::Idle;
    return currentInterval;
  }

 private:
  enum class State { Idle, Holding };
  State state_ = State::Idle;
  uint32_t holdStartedAt_ = 0;
};

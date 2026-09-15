#include "SleepCoordinator.h"

void SleepCoordinator::onSuccessfulPublish(uint32_t now) {
  holdStartedAt_ = now;
  state_ = State::Holding;
}

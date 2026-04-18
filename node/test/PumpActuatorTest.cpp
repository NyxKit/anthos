#include <Arduino.h>
#include <unity.h>

#include "../src/Logger.h"
#include "../src/NvsConfig.h"
#include "../src/PumpActuator.h"

namespace {
Logger logger;
PumpActuator* actuator = nullptr;
}

void setUp(void) {
  NvsConfig::setNodeCapability("watering");
  static PumpActuator pump(logger);
  actuator = &pump;
  actuator->begin();
}

void tearDown(void) {
  NvsConfig::setNodeCapability("earth");
  actuator = nullptr;
}

void test_pump_runs_without_blocking_loop() {
  TEST_ASSERT_NOT_NULL(actuator);
  TEST_ASSERT_TRUE(actuator->start(10));
  TEST_ASSERT_TRUE(actuator->isRunning());

  delay(15);
  actuator->loop();

  TEST_ASSERT_FALSE(actuator->isRunning());
  TEST_ASSERT_TRUE(actuator->consumeCompletion());
  TEST_ASSERT_FALSE(actuator->consumeCompletion());
}

void setup() {
  delay(1000);
  UNITY_BEGIN();
  RUN_TEST(test_pump_runs_without_blocking_loop);
  UNITY_END();
}

void loop() {}

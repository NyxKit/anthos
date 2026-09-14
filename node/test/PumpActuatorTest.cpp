#include <Arduino.h>
#include <unity.h>

#include "../src/Logger.h"
#include "../src/NvsConfig.h"
#include "../src/PowerPolicy.h"
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

void test_performance_profile_disables_wifi_power_save() {
  NvsConfig::setIntervalMs(1000);
  TEST_ASSERT_TRUE(NvsConfig::isPerformancePowerProfile());

  NvsConfig::setIntervalMs(600000);
  TEST_ASSERT_FALSE(NvsConfig::isPerformancePowerProfile());

  NvsConfig::setIntervalMs(0);
}

void test_wifi_sleep_disable_is_blocked_while_ble_is_initialized() {
  TEST_ASSERT_FALSE(PowerPolicy::shouldDisableWifiSleep(true, true));
  TEST_ASSERT_TRUE(PowerPolicy::shouldDisableWifiSleep(false, true));
  TEST_ASSERT_FALSE(PowerPolicy::shouldDisableWifiSleep(true, false));
}

void setup() {
  delay(1000);
  UNITY_BEGIN();
  RUN_TEST(test_pump_runs_without_blocking_loop);
  RUN_TEST(test_performance_profile_disables_wifi_power_save);
  RUN_TEST(test_wifi_sleep_disable_is_blocked_while_ble_is_initialized);
  UNITY_END();
}

void loop() {}

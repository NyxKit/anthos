#include <cassert>
#include <iostream>
#include <limits>

#include <Preferences.h>

#include "DeviceResponseValidator.h"
#include "NvsConfig.h"
#include "SleepCoordinator.h"

void testCadenceRestoration() {
  Preferences::values.clear();
  assert(!NvsConfig::restoreIntervalMs());
  assert(NvsConfig::getIntervalMs() == 1000);
  assert(Preferences::writes == 0);
  for (auto interval : {1000UL, 600000UL, 3600000UL}) {
    assert(NvsConfig::setIntervalMs(interval));
    for (int cycle = 0; cycle < 3; ++cycle) {
      assert(NvsConfig::restoreIntervalMs());
      assert(NvsConfig::getReadIntervalMs() == interval);
      assert(NvsConfig::getTelemetryIntervalMs() == interval);
      assert(NvsConfig::getQueueIntervalMs() == interval);
    }
    const auto writes = Preferences::writes;
    assert(NvsConfig::setIntervalMs(interval));
    assert(Preferences::writes == writes);
  }
  for (auto invalid : {0UL, 999UL, 5000UL, std::numeric_limits<unsigned long>::max()}) {
    assert(!NvsConfig::setIntervalMs(invalid));
    assert(NvsConfig::getIntervalMs() == 3600000);
  }
  Preferences::failWrite = true;
  assert(!NvsConfig::setIntervalMs(600000));
  assert(NvsConfig::getIntervalMs() == 3600000);
  Preferences::failWrite = false;
  assert(NvsConfig::restoreIntervalMs());
  assert(NvsConfig::getIntervalMs() == 3600000);
  Preferences::failOpen = true;
  assert(!NvsConfig::setIntervalMs(600000));
  assert(NvsConfig::getIntervalMs() == 3600000);
  assert(!NvsConfig::restoreIntervalMs());
  assert(NvsConfig::getIntervalMs() == 1000);
  Preferences::failOpen = false;
  Preferences::values["interval_ms"] = uint32_t{1234};
  assert(!NvsConfig::restoreIntervalMs());
  assert(NvsConfig::getIntervalMs() == 1000);
  Preferences::values["interval_ms"] = String("600000");
  assert(!NvsConfig::restoreIntervalMs());
  assert(NvsConfig::getIntervalMs() == 1000);
}

void testSleepLifecycle() {
  SleepCoordinator sleep;
  uint32_t interval = 600000;
  bool busy = false;
  unsigned polls = 0;
  auto poll = [&]() { ++polls; return true; };
  auto cadence = [&]() { return interval; };
  auto pending = [&]() { return busy; };
  assert(sleep.prepareSleep(20000, poll, cadence, pending) == 0);
  assert(polls == 0);

  // Boot at zero is a valid start time, as is a grace period spanning wrap.
  for (uint32_t start : {uint32_t{0}, UINT32_MAX - 5000, UINT32_MAX - 9999}) {
    sleep.onSuccessfulPublish(start);
    assert(sleep.prepareSleep(start + 9999, poll, cadence, pending) == 0);
    assert(sleep.prepareSleep(start + 10000, poll, cadence, pending) == interval);
    assert(sleep.prepareSleep(start + 10001, poll, cadence, pending) == 0);
  }
  sleep.onSuccessfulPublish(0);
  busy = true;
  const auto before = polls;
  assert(sleep.prepareSleep(10000, poll, cadence, pending) == 0);
  assert(polls == before);
  busy = false;
  // A final poll starts watering. Completion awaiting ACK remains busy too.
  assert(sleep.prepareSleep(10000, [&]() { busy = true; return true; }, cadence, pending) == 0);
  assert(sleep.prepareSleep(20000, poll, cadence, pending) == 0);
  busy = false;
  assert(sleep.prepareSleep(20001, poll, cadence, pending) == 600000);

  sleep.onSuccessfulPublish(0);
  assert(sleep.prepareSleep(10000, [&]() { interval = 1000; return true; }, cadence, pending) == 0);
  assert(sleep.prepareSleep(20000, poll, cadence, pending) == 0);
  interval = 600000;
  sleep.onSuccessfulPublish(0);
  assert(sleep.prepareSleep(10000, [&]() { interval = 3600000; return true; }, cadence, pending) == 3600000);

  sleep.onSuccessfulPublish(0);
  assert(sleep.prepareSleep(10000, []() { return false; }, cadence, pending) == 0);
  const auto beforeRetry = polls;
  assert(sleep.prepareSleep(19999, poll, cadence, pending) == 0);
  assert(polls == beforeRetry);
  assert(sleep.prepareSleep(20000, poll, cadence, pending) == interval);

  sleep.onSuccessfulPublish(0);
  sleep.onSuccessfulPublish(9000);
  assert(sleep.prepareSleep(10000, poll, cadence, pending) == 0);
  assert(sleep.prepareSleep(19000, poll, cadence, pending) == interval);
}

void testResponseValidation() {
  for (const char* invalid : {
      "null", "[]", "{}",
      R"({"status":"accepted","nodeId":"node-002","capability":"earth","commands":[]})",
      R"({"status":"accepted","nodeId":"node-001","commands":[]})",
      R"({"status":"accepted","nodeId":"node-001","capability":"unknown","commands":[]})",
      R"({"status":"accepted","nodeId":1,"capability":"earth","commands":[]})",
      R"({"status":"accepted","nodeId":"node-001\u0000suffix","capability":"earth","commands":[]})",
      R"({"status":"accepted","nodeId":"node-001","capability":"earth\u0000suffix","commands":[]})"}) {
    JsonDocument doc;
    assert(deserializeJson(doc, invalid) == DeserializationError::Ok);
    assert(!DeviceResponseValidator::ingest(doc.as<JsonVariantConst>(), "node-001"));
    assert(!DeviceResponseValidator::queue(doc.as<JsonVariantConst>(), "node-001"));
  }
  JsonDocument doc;
  doc["nodeId"] = "node-001";
  doc["capability"] = "earth";
  assert(!DeviceResponseValidator::ingest(doc.as<JsonVariantConst>(), "node-001"));
  assert(!DeviceResponseValidator::queue(doc.as<JsonVariantConst>(), "node-001"));
  doc["commands"].to<JsonArray>();
  assert(DeviceResponseValidator::queue(doc.as<JsonVariantConst>(), "node-001"));
  for (const auto* status : {"accepted", "registered"}) {
    doc["status"] = status;
    assert(DeviceResponseValidator::ingest(doc.as<JsonVariantConst>(), "node-001"));
  }
  doc["status"] = "unknown";
  assert(!DeviceResponseValidator::ingest(doc.as<JsonVariantConst>(), "node-001"));
  doc["commands"] = "invalid";
  assert(!DeviceResponseValidator::queue(doc.as<JsonVariantConst>(), "node-001"));
}

int main() {
  testCadenceRestoration();
  testSleepLifecycle();
  testResponseValidation();
  std::cout << "PASS: cadence storage/reconstruction, sleep lifecycle/rollover, response validation\n";
}

#include "NtpSync.h"

#include <WiFi.h>
#include <time.h>
#include <sys/time.h>

void NtpSync::begin() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ntp: wifi not connected yet");
    return;
  }

  Serial.println("ntp: starting sync...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov", "time.google.com");
  lastCheckAt_ = millis();
}

void NtpSync::loop() {
  if (synced_) return;
  if (WiFi.status() != WL_CONNECTED) return;

  const auto now = millis();
  if (now - lastCheckAt_ < 2000) return;
  lastCheckAt_ = now;

  time_t t = time(nullptr);
  Serial.printf("ntp: time=%ld\n", t);

  if (t > 1700000000) {
    synced_ = true;
    Serial.printf("ntp: synced! %ld\n", t);
  }
}

bool NtpSync::isSynced() const {
  return synced_;
}

unsigned long long NtpSync::nowMs() const {
  if (!synced_) {
    return 0;
  }
  struct timeval tv;
  gettimeofday(&tv, nullptr);
  return (unsigned long long)tv.tv_sec * 1000ULL + tv.tv_usec / 1000ULL;
}

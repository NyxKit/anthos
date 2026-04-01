#include "Logger.h"

void Logger::begin(unsigned long baudRate) const {
  Serial.begin(baudRate);
}

void Logger::line() const {
  Serial.println();
}

void Logger::boot(const char* nodeId, const char* portMode) const {
  Serial.println("boot ok");
  Serial.printf("node id: %s\n", nodeId);
  Serial.printf("port mode: %s\n", portMode);
}

void Logger::portPins(uint8_t yellowPin, uint8_t whitePin) const {
  Serial.printf("hy2.0 pins: yellow=%u white=%u\n", yellowPin, whitePin);
}

void Logger::info(const char* message) const {
  Serial.println(message);
}

void Logger::sensorUnavailable(const char* sensorName, const char* reason) const {
  Serial.printf("sensor=%s status=unavailable reason=%s\n", sensorName, reason);
}

void Logger::health(const char* wifiStatus,
                    const char* ipAddress,
                    long rssi,
                    const char* serverStatus,
                    const char* serverHost,
                    unsigned long uptimeMs) const {
  Serial.printf(
      "health uptime_ms=%lu wifi=%s ip=%s rssi=%ld server=%s target=%s\n",
      uptimeMs,
      wifiStatus,
      ipAddress,
      rssi,
      serverStatus,
      serverHost);
}

#include <Arduino.h>
#include <BH1750.h>
#include <Wire.h>

namespace {
  constexpr uint8_t kSdaPin = 2;
  constexpr uint8_t kSclPin = 1;
  constexpr uint8_t kDLightAddress = 0x23;
  constexpr unsigned long kReadIntervalMs = 1000;

  BH1750 lightMeter;
  unsigned long lastReadAt = 0;
}

void readLight() {
  if (lightMeter.measurementReady()) {
    const float lux = lightMeter.readLightLevel();
    if (lux < 0) {
      Serial.println("lux read failed");
      return;
    }

    Serial.printf("lux: %.2f\n", lux);
    return;
  }

  Serial.println("waiting for light sample");
}

void setup() {
  Serial.begin(115200);
  delay(1500);

  Wire.begin(kSdaPin, kSclPin);

  Serial.println();
  Serial.println("boot ok");
  Serial.printf("I2C pins: SDA=%u SCL=%u\n", kSdaPin, kSclPin);

  const bool started = lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, kDLightAddress, &Wire);
  if (started) {
    Serial.println("dlight ok");
  } else {
    Serial.println("dlight init failed");
  }
}

void loop() {
  const auto now = millis();
  if (now - lastReadAt < kReadIntervalMs) {
    delay(10);
    return;
  }

  lastReadAt = now;
  readLight();
}

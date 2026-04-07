#pragma once

#include "ApiClient.h"
#include "I2CBus.h"
#include "Logger.h"
#include "NodeHealth.h"
#include "NvsConfig.h"
#include "ProvisioningManager.h"
#include "SensorManager.h"

class NodeApp {
 public:
  void begin();
  void loop();

 private:
  const char* describePortMode() const;

  Logger             logger_;
  ProvisioningManager provisioning_;
  I2CBus             i2cBus_{logger_};
  NodeHealth         health_{logger_};
  SensorManager      sensors_;
  ApiClient          api_{logger_, health_, sensors_};
  unsigned long      lastReadAt_ = 0;
};

#pragma once

#include "ApiClient.h"
#include "CommandClient.h"
#include "HubClient.h"
#include "I2CBus.h"
#include "Logger.h"
#include "NodeHealth.h"
#include "NvsConfig.h"
#include "ProvisioningManager.h"
#include "PumpActuator.h"
#include "SensorManager.h"

class NodeApp {
 public:
  void begin();
  void loop();

 private:
  const char* describePortMode() const;
  void syncNodeRegistration();
  void applyHardwareProfileIfNeeded();

  Logger             logger_;
  ProvisioningManager provisioning_;
  I2CBus             i2cBus_{logger_};
  NodeHealth         health_{logger_};
  HubClient          hub_;
  SensorManager      sensors_;
  PumpActuator       pump_{logger_};
  CommandClient      commands_{logger_, health_, pump_};
  ApiClient          api_{logger_, health_, sensors_};
  unsigned long      lastReadAt_ = 0;
  unsigned long      lastRegisterAt_ = 0;
  String             appliedCapability_ = "";
};

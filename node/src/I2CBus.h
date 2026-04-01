#pragma once

#include "Logger.h"

class I2CBus {
 public:
  explicit I2CBus(Logger& logger);

  void scan() const;

 private:
  Logger& logger_;
};

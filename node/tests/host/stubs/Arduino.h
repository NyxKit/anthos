#pragma once

#include <cstdint>
#include <string>

using String = std::string;

struct SerialStub {
  void println(const char*) {}
};
inline SerialStub Serial;

struct EspStub {
  void restart() {}
};
inline EspStub ESP;

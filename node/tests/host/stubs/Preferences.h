#pragma once

#include <cassert>
#include <map>
#include <string>
#include <variant>

#include "Arduino.h"

// Only the storage boundary is fake: tests execute production NvsConfig.
class Preferences {
 public:
  using Value = std::variant<uint32_t, String>;
  inline static std::map<std::string, Value> values;
  inline static bool failOpen = false;
  inline static bool failWrite = false;
  inline static unsigned writes = 0;

  bool begin(const char* ns, bool readOnly) {
    assert(std::string(ns) == "anthos");
    readOnly_ = readOnly;
    return !failOpen;
  }
  void end() {}
  bool isKey(const char* key) { return values.count(key) > 0; }
  String getString(const char* key, const char* fallback) {
    if (!isKey(key) || !std::holds_alternative<String>(values.at(key))) return fallback;
    return std::get<String>(values.at(key));
  }
  uint32_t getULong(const char* key, uint32_t fallback) {
    if (!isKey(key) || !std::holds_alternative<uint32_t>(values.at(key))) return fallback;
    return std::get<uint32_t>(values.at(key));
  }
  size_t putString(const char* key, const String& value) {
    assert(!readOnly_);
    if (failWrite) return 0;
    values[key] = value;
    ++writes;
    return value.size();
  }
  size_t putULong(const char* key, uint32_t value) {
    assert(!readOnly_);
    if (failWrite) return 0;
    values[key] = value;
    ++writes;
    return sizeof(uint32_t);
  }
  void clear() { values.clear(); }

 private:
  bool readOnly_ = true;
};

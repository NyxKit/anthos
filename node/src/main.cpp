#include "NodeApp.h"

namespace {
NodeApp app;
}

#ifndef UNIT_TEST
void setup() {
  app.begin();
}

void loop() {
  app.loop();
}
#endif

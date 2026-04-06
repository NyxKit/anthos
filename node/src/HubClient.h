#pragma once

#include <Arduino.h>

// HubClient: discovers the Anthos hub via mDNS and registers this node.
// Discovery priority (per research.md):
//   1. NVS-stored server_url (if present and reachable via HEAD /health)
//   2. mDNS query for "anthos.local"
//   3. Retry loop every 30 seconds if both fail
class HubClient {
 public:
  // Discover the hub URL. Returns empty string if not found (caller retries).
  String discoverHub();

  // Attempt registration once. Returns node_id on success, empty string on
  // any failure (not found, 403, network error). Caller owns retry logic.
  String tryRegisterOnce(const String& hwId, const String& firmwareVersion);

 private:
  bool isUrlReachable(const String& url);

  static constexpr unsigned long kRetryIntervalMs = 30000;
};

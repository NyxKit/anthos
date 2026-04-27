# Quickstart: Power Telemetry Online Status

## Goal

Verify that nodes stay online during expected quiet windows and only show offline after the profile-specific silence limit.

## What to check

1. Open the dashboard and confirm a node in performance mode turns offline after about 3 seconds without telemetry.
2. Switch the same node to balanced mode and confirm the offline label does not appear during the first 30 minutes of intentional silence.
3. Switch the node to power saver mode and confirm the same behavior extends to 3 hours.
4. Change the profile while the node is quiet and confirm the offline timer restarts from the change time.
5. Confirm the node returns to online on the first telemetry event after a quiet period.
6. Confirm a profile change does not make the node look offline until the new profile’s quiet window is actually exceeded.

## Expected result

- Online means the node is within its allowed quiet window.
- Offline means the node has exceeded the allowed quiet window for its active profile.

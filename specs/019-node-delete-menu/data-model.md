# Data Model: Node Actions Menu

## Entities

### Logical Node

- Fields: `node_id`, `hw_id`, `display_name`, `node_order`, `capability`, `registered_at`, power profile fields, status derived from telemetry.
- Relationships: Belongs to one hardware device and can have automations, telemetry history, and commands associated with it.
- Validation rules: The node can be deleted from the operator view regardless of current online state.

### Hardware Node

- Fields: `hw_id`, `first_seen`, `last_seen`, `firmware_version`, `device_token`.
- Relationships: Outlives logical node deletion so the same physical device can be recognized again later.
- Validation rules: Hardware tracking must remain after logical node deletion.

### Node Delete Confirmation

- Fields: node identity, warning copy, confirmation action.
- Relationships: Presented from the node actions menu before the delete request is sent.
- Validation rules: The warning must tell the operator that the hardware still needs a manual reset.

## State Changes

- Active logical node -> deleted from the node list when delete is confirmed.
- Deleted logical node -> re-created automatically when the same hardware resumes telemetry or registration and has not been manually reset.
- Offline logical node -> still eligible for deletion.

## Notes

- The feature does not introduce a persisted deleted state.
- Existing telemetry and automation history may remain tied to the previous node record behavior unless the current API already cascades those dependencies.

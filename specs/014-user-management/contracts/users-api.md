# Contract: Users API

## Overview
The users API exposes the user list, setup detection, and user creation for the Anthos admin surface.

## GET /api/users
- Returns the current list of users.
- Used by the users page to populate the NyxTable.

### Response shape
```json
{
  "users": [
    {
      "id": "user-001",
      "username": "admin",
      "displayName": "Primary Admin",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": 1713456000000
    }
  ]
}
```

## GET /api/users/setup-status
- Returns whether the app should enter first-run setup mode.

### Response shape
```json
{
  "setupRequired": true
}
```

## POST /api/users
- Creates a new user.
- Admin-only after setup is complete.

### Request shape
```json
{
  "username": "jane",
  "displayName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "repeatPassword": "secret123",
  "role": "user"
}
```

### Behavior
- Rejects mismatched passwords.
- Rejects duplicate usernames or emails.
- Rejects non-admin creation attempts after setup.
- If the request is part of first-run setup, the created user becomes `admin` automatically and role selection is not shown.

## Notes
- The users API is local to Anthos and is not intended for third-party integration.
- The app may treat an empty `users` response as confirmation that setup is required, but the setup-status endpoint keeps the bootstrap decision explicit.

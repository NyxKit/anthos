# Data Model: User Management

## User
- Represents an account that can sign in to Anthos.
- Fields: `id`, `username`, `displayName`, `email`, `password`, `role`, `createdAt`.
- Relationships: May be referenced by the current session and by any future audit or ownership features.
- Validation: `username` and `email` must be unique; `displayName`, `password`, and `role` are required; passwords must be confirmed during creation.

## User Role
- Represents the access level attached to a user.
- Values: `admin`, `user`.
- Relationships: Every user has exactly one role.
- Validation: The first user must be created as `admin`; later users may only be created by an admin.

## Setup State
- Represents whether the app must show first-run registration.
- Fields: derived from the absence or presence of user records.
- Relationships: Applies to the whole installation, not to an individual account.
- Validation: Setup mode is active only when there are no users.

## Create User Submission
- Represents the information entered when creating a user.
- Fields: `username`, `displayName`, `email`, `password`, `repeatPassword`, `role`.
- Relationships: Used by both the first-run registration flow and admin-created users, with different allowed role behavior.
- Validation: `password` and `repeatPassword` must match; setup mode omits role choice and assigns `admin` automatically.

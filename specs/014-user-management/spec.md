# Feature Specification: User Management

**Feature Branch**: `014-user-management`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "add a new page \"users\" to manage users (use a NyxTable). Users have a username, display name, email, password (create model has a 'repeat password' field), role (setup registration does not allow role selection - that user is automatically an admin). When running the app for the first time (criteria: the db table \"users\" has no records), go in setup mode: show a small window to register the first (admin) user. Only admins are allowed to add new users afterwards."

## Clarifications

### Session 2026-04-19

- Q: How should passwords be handled? → A: Store passwords as non-reversible hashes and never expose them back to the app.
- Q: How is the current user's role determined? → A: Add authentication/session management with this feature.
- Q: How should username/email uniqueness be handled? → A: Treat usernames and emails as case-insensitive for uniqueness.
- Q: Where should shared user logic live? → A: Shared user logic lives in `shared/src/users`, with `shared/src/users/classes/User.ts` as the user model and `shared/src/anthos/classes/AnthosUsers.ts` as the Anthos API wrapper for `anthos.users.login` and `anthos.users.register`.
- Q: What methods should the Anthos users client expose? → A: `login`, `logout`, `get`, `create`, `update`, and `delete`, with `create` replacing `register`.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Authentication & Session Management (Priority: P1)

Users can sign in and stay signed in so the app can determine who is allowed to manage users.

**Why this priority**: Admin-only actions depend on a current signed-in user and role.

**Independent Test**: Sign in with valid credentials, confirm the session is established, and verify it is restored after restarting the app.

**Acceptance Scenarios**:

1. **Given** a valid user account exists, **When** the user signs in with correct credentials, **Then** the app establishes a session for that user.
2. **Given** a signed-in user closes and reopens the app, **When** the app starts, **Then** the session is restored.
3. **Given** a signed-in user chooses to sign out, **When** the sign-out action completes, **Then** the session ends and privileged actions are no longer available.

---

### User Story 2 - First-Time Admin Setup (Priority: P2)

When the system has no users yet, a first-time operator is guided into setup mode and creates the initial administrator account in a focused registration window.

**Why this priority**: Without an initial administrator, no one can configure or administer the system.

**Independent Test**: Verify that an empty system opens in setup mode and allows creation of one admin account with required user details and password confirmation.

**Acceptance Scenarios**:

1. **Given** there are no user records, **When** the app starts, **Then** the setup window is shown instead of the normal users page.
2. **Given** the setup window is shown, **When** the operator enters valid user details and matching passwords, **Then** the first user is created with administrator access and a signed-in admin session starts.
3. **Given** the setup window is shown, **When** the passwords do not match, **Then** the user is not created and the form shows a clear validation error.

---

### User Story 3 - Admin User Creation (Priority: P3)

An administrator opens the users page, reviews the current user list, and adds new users as needed.

**Why this priority**: Admins need a central place to manage access as the team grows.

**Independent Test**: Sign in as an administrator, open the users page, and create a new user while verifying the new entry appears in the list.

**Acceptance Scenarios**:

1. **Given** an administrator is viewing the users page, **When** they open the create-user form and submit valid details, **Then** the new user is added to the list.
2. **Given** the create-user form is open, **When** the repeated password does not match, **Then** the user cannot be saved.
3. **Given** the users list contains records, **When** an administrator refreshes or reopens the page, **Then** the existing users remain visible.

---

### User Story 4 - Access Control for User Management (Priority: P4)

Non-admin users can use the app, but they cannot access user creation or user administration actions.

**Why this priority**: User management must be restricted to trusted operators.

**Independent Test**: Sign in as a non-admin user and confirm that user creation controls are hidden or blocked.

**Acceptance Scenarios**:

1. **Given** a non-admin user is signed in, **When** they open the app, **Then** they cannot add new users.
2. **Given** a non-admin user attempts to reach user management directly, **When** access is evaluated, **Then** the action is denied.

---

### Edge Cases

- Existing systems with one or more users must not re-enter setup mode.
- The initial administrator account must always be created without a selectable role.
- The initial administrator account must start a signed-in admin session after creation.
- Attempting to create a user with a duplicate username or email must fail with a clear message.
- Password and repeat password must both be required for account creation.
- If a non-admin reaches the users page through a direct link or shortcut, access must be denied or the action must be disabled.
- A valid session must be required before admin-only user-management actions are shown or allowed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically enter setup mode when no users exist.
- **FR-002**: Setup mode MUST present a compact registration window for creating the first user.
- **FR-003**: The first user created in setup mode MUST be assigned administrator access automatically.
- **FR-004**: The system MUST provide a sign-in flow for existing users.
- **FR-005**: The system MUST maintain a session for a signed-in user across app restarts until sign-out.
- **FR-006**: Shared user-related logic MUST live under `shared/src/users`.
- **FR-007**: The shared user model MUST be defined in `shared/src/users/classes/User.ts`.
- **FR-008**: The Anthos users client MUST expose `login`, `logout`, `get`, `create`, `update`, and `delete` through `anthos.users`.
- **FR-009**: The Anthos users client wrapper MUST live in `shared/src/anthos/classes/AnthosUsers.ts`.
- **FR-010**: Setup mode MUST require username, display name, email, password, and repeat password.
- **FR-011**: Setup mode MUST not allow role selection.
- **FR-012**: The system MUST provide a users page that lists existing users in a tabular layout.
- **FR-013**: Only administrators MUST be allowed to create additional users after setup is complete.
- **FR-014**: The create-user flow MUST require username, display name, email, password, repeat password, and role.
- **FR-015**: The system MUST reject user creation when password and repeat password do not match.
- **FR-016**: The system MUST reject user creation when the username or email conflicts with an existing user.
- **FR-017**: The system MUST preserve the created user's role and show it in the users list.
- **FR-018**: The system MUST prevent non-admin users from accessing user creation actions.
- **FR-019**: The system MUST store passwords as non-reversible hashes and never return password values to the app.
- **FR-020**: The system MUST provide a signed-in user context so admin-only actions can be evaluated for the current user.
- **FR-021**: Username and email uniqueness MUST be treated as case-insensitive.

### Key Entities *(include if feature involves data)*

- **User**: A person account with username, display name, email, password hash, and role.
- **Role**: The access level assigned to a user, distinguishing administrators from standard users.
- **Setup State**: The initial system condition that exists until the first user account is created.
- **Session**: The signed-in state that identifies the current user and persists until sign-out.
- **Auth Client**: The shared Anthos wrapper in `shared/src/anthos/classes/AnthosUsers.ts` that exposes `anthos.users.login`, `anthos.users.logout`, `anthos.users.get`, `anthos.users.create`, `anthos.users.update`, and `anthos.users.delete`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a fresh system with no users, 100% of startups present setup mode instead of the normal users page.
- **SC-002**: At least 95% of first-time operators can create the initial administrator account in under 2 minutes.
- **SC-003**: 100% of successful user creation attempts require matching password and repeat password values.
- **SC-004**: 100% of non-admin access attempts to create users are blocked.
- **SC-005**: Administrators can add a new user and see the new user appear in the list on the same visit.

## Assumptions

- User management is limited to viewing the user list and creating new users; editing and deleting users are out of scope for this feature.
- The users page is available only after setup is complete.
- Duplicate username and duplicate email are both treated as invalid.
- Username and email uniqueness checks ignore letter casing.
- Auth/session management is implemented within this feature and does not depend on an existing identity system.

## Dependencies

- The feature must provide its own authentication and session management so the current user's role is known at runtime.
- The system must know whether any users already exist before choosing between setup mode and the normal app.

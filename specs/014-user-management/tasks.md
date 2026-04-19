---

description: "Task list for User Management feature"
---

# Tasks: User Management

**Input**: Design documents from `/specs/014-user-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared feature scaffolding

- [ ] T001 [P] Create shared user model module in `shared/src/users/classes/User.ts` and export it from `shared/src/users/index.ts` and `shared/src/index.ts`
- [ ] T002 [P] Create auth feature scaffolding in `app/src/auth/` and `server/api/src/auth/` with initial index files where needed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Add `users` table initialization and uniqueness constraints to `server/api/src/services/TelemetryService.ts`
- [ ] T004 [P] Implement auth persistence, password hashing, and session issuance in `server/api/src/services/AuthService.ts`
- [ ] T005 [P] Add auth controller endpoints and wire them into `server/api/src/controllers/AuthController.ts` and `server/api/src/routes/createApiRouter.ts`
- [ ] T006 [P] Extend the shared Anthos users client in `shared/src/anthos/classes/AnthosUsers.ts` and export it from `shared/src/anthos/classes/Anthos.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentication & Session Management (Priority: P1) 🎯 MVP

**Goal**: Users can sign in, stay signed in, and sign out so the app can evaluate user roles.

**Independent Test**: Sign in with valid credentials, confirm the session is restored after restarting the app, and verify sign-out ends access.

- [ ] T007 [P] [US1] Add auth/session store in `app/src/auth/stores/auth.ts`
- [ ] T008 [US1] Create the sign-in view in `app/src/views/SignInView.vue`
- [ ] T009 [US1] Wire app startup and session restoration in `app/src/App.vue` and `app/src/shared/router/index.ts`
- [ ] T010 [US1] Connect sign-in and sign-out actions to the shared auth client in `app/src/views/SignInView.vue` and `app/src/dashboard/components/SidebarNav.vue`

**Checkpoint**: User Story 1 should now work independently as the MVP identity flow.

---

## Phase 4: User Story 2 - First-Time Admin Setup (Priority: P2)

**Goal**: When no users exist, the app opens in setup mode and creates the first administrator account.

**Independent Test**: Launch the app against an empty users table and confirm the setup window appears, accepts valid details, creates the first admin account, and starts an admin session.

- [ ] T011 [P] [US2] Add setup-state loading and bootstrap detection in `app/src/users/stores/users.ts`
- [ ] T012 [US2] Create the compact first-run setup window in `app/src/views/UserSetupView.vue`
- [ ] T013 [US2] Wire app startup to open setup mode before the normal shell in `app/src/App.vue` and `app/src/shared/router/index.ts`
- [ ] T014 [US2] Connect first-run submission to the shared users and auth clients in `app/src/views/UserSetupView.vue`, `shared/src/anthos/classes/AnthosUsers.ts`, and `shared/src/users/classes/User.ts`

**Checkpoint**: User Story 2 should now work independently as the MVP bootstrap flow.

---

## Phase 5: User Story 3 - Admin User Creation (Priority: P3)

**Goal**: Admins can review existing users in a table and add new users with password confirmation.

**Independent Test**: Sign in as an admin, open the users page, create a user, and confirm the new record appears in the table.

- [ ] T015 [P] [US3] Add the users page route and sidebar navigation entry in `app/src/shared/router/index.ts` and `app/src/dashboard/components/SidebarNav.vue`
- [ ] T016 [P] [US3] Build the user list and create-user workflow state in `app/src/users/stores/users.ts`
- [ ] T017 [P] [US3] Create the users table view in `app/src/users/views/UsersView.vue` using NyxTable
- [ ] T018 [P] [US3] Create the reusable user form in `app/src/users/components/UserForm.vue` with repeat-password validation
- [ ] T019 [US3] Connect the users page to the shared users client in `app/src/users/views/UsersView.vue` and `shared/src/anthos/classes/AnthosUsers.ts`

**Checkpoint**: User Story 3 should now be fully functional and independently demonstrable.

---

## Phase 6: User Story 4 - Access Control for User Management (Priority: P4)

**Goal**: Non-admin users cannot create users or interact with user-management actions.

**Independent Test**: Sign in as a non-admin user and confirm the users page hides or blocks creation actions.

- [ ] T020 [P] [US4] Add route-level admin gating in `app/src/shared/router/index.ts` and `app/src/users/views/UsersView.vue`
- [ ] T021 [P] [US4] Hide or disable create-user controls for non-admin sessions in `app/src/users/views/UsersView.vue` and `app/src/users/components/UserForm.vue`
- [ ] T022 [US4] Handle unauthorized user-management attempts with a clear blocked-access state in `app/src/users/views/UsersView.vue`

**Checkpoint**: User Story 4 should now prevent non-admin access to user creation flows.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T023 [P] Review and align `specs/014-user-management/contracts/users-api.md` with the implemented behavior
- [ ] T024 [P] Validate the first-run, auth/session, and admin flows against `specs/014-user-management/quickstart.md`
- [ ] T025 Clean up user-management exports and shared types in `shared/src/index.ts` and `shared/src/anthos/types.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (P1)**: Can start after Foundational - establishes auth/session
- **User Story 2 (P2)**: Can start after User Story 1 - setup creates the first session
- **User Story 3 (P3)**: Can start after User Story 2 - uses the auth-enabled admin path
- **User Story 4 (P4)**: Can start after User Story 1 - may be implemented alongside User Stories 2/3 once auth exists
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Within Each User Story

- Shared client and service changes before UI wiring
- UI state before view composition
- View composition before polish and messaging
- Story complete before moving to the next priority

### Parallel Opportunities

- Setup tasks `T001` and `T002` can run in parallel
- Foundational tasks `T003` through `T006` can run in parallel across different files
- User Story 1 tasks `T007` and `T008` can run in parallel once the shared auth client is ready
- User Story 3 tasks `T015` through `T018` can run in parallel before the final page wiring task `T019`
- User Story 4 tasks `T020` and `T021` can run in parallel before the blocked-access messaging task `T022`

---

## Parallel Example: User Story 3

```bash
# Launch these in parallel after auth/session exists:
Task: "Add the users page route and sidebar navigation entry in app/src/shared/router/index.ts and app/src/dashboard/components/SidebarNav.vue"
Task: "Build the user list and create-user workflow state in app/src/users/stores/users.ts"
Task: "Create the users table view in app/src/users/views/UsersView.vue using NyxTable"
Task: "Create the reusable user form in app/src/users/components/UserForm.vue with repeat-password validation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate sign-in, session restoration, and sign-out independently

### Incremental Delivery

1. Setup + Foundational → auth plumbing ready
2. Add User Story 1 → sign-in/session works
3. Add User Story 2 → first-run admin bootstrap works
4. Add User Story 3 → admin user management page works
5. Add User Story 4 → access control is enforced in the UI
6. Finish with Polish tasks and quickstart validation

### Parallel Team Strategy

1. Team completes Setup and Foundational tasks together
2. Once the foundation is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Merge and validate after each story checkpoint

---

## Notes

- `[P]` tasks can run in parallel when they touch different files and have no unfinished dependencies
- `[Story]` labels map each task to a specific user story for traceability
- Keep each story independently demonstrable before moving on
- Preserve the existing monorepo structure and shared contract conventions

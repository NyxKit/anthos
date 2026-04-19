# Research: User Management

## 1. User storage
- Decision: Store users in the existing SQLite database managed by `server/api`.
- Rationale: The app already persists operational state there, so user records stay local, simple, and consistent with the rest of Anthos.
- Alternatives considered: A separate auth database, and file-based persistence. Both add unnecessary drift for a single local admin surface.

## 2. First-run setup detection
- Decision: Treat setup mode as active when the users table has zero rows.
- Rationale: This matches the feature definition directly and avoids a second bootstrap flag that could get out of sync.
- Alternatives considered: A dedicated setup flag and a migration marker. Both create extra state without a clearer user benefit.

## 3. Role model
- Decision: Use a shared string enum with `admin` and `user` roles.
- Rationale: The role value is part of the public contract between app and API, so a shared enum keeps it consistent across modules.
- Alternatives considered: Free-form role strings and a larger permission matrix. Those would complicate validation without a current requirement.

## 4. Admin-only creation
- Decision: Enforce user creation permissions on the API, not just in the UI.
- Rationale: The users page is admin-facing, but the real security boundary must live at the server.
- Alternatives considered: UI-only hiding of buttons and routes. That would be easier to bypass.

## 5. Users page layout
- Decision: Present users in a NyxTable-backed page with a separate create-user flow.
- Rationale: The feature specifically calls for NyxTable, and the table fits the expected admin review workflow.
- Alternatives considered: Cards or a custom list layout. Those would be less efficient for scanning user records.

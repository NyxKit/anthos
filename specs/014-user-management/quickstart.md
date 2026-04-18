# Quickstart: User Management

1. Start the API and app using the normal Anthos development commands.
2. Launch the app with an empty users table.
3. Confirm the app opens in first-run setup mode.
4. Create the initial administrator account and verify the setup window closes.
5. Open the users page and confirm the new admin appears in the table.
6. Sign in as an admin and create an additional user.
7. Sign in as a non-admin and confirm user creation is blocked.

## Verification Targets
- Empty installations always go through setup first.
- The first created user is always an admin.
- The users page lists current accounts in a table.
- Only admins can add new users after setup.

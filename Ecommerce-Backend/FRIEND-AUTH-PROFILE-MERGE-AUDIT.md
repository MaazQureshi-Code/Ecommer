# Friend Auth/Profile Merge Audit

Date: 2026-08-10

## Decision

The uploaded `Ecommerce-Backend 2.zip` was reviewed as a source of changes,
not used as a replacement backend.

The uploaded project contained only 78 C# files. The preserved, merged backend
contains 188 C# files and includes the existing catalogue, seller products,
seller stores, cart, orders, notifications, addresses, reviews, and tests.
Replacing the project would have removed working features and changed the
application from .NET 10 back to .NET 8.

## Friend files that were not copied

- Old authentication code that throws exceptions for normal login failures.
- Registration/login responses that omit the complete JWT session fields.
- The duplicate `Profile` and `UserManagement` implementations.
- User-profile code that edits Store ownership data.
- Old entities, enums, database context, Program configuration, and SQL names.
- `.git`, `bin`, `obj`, `.vscode`, and macOS metadata.
- Empty placeholder files for change password, forgot password, reset password,
  refresh token, current user, API response, validators, and mappings.

## Preserved authentication behavior

- `POST /api/auth/register` creates Buyer or Seller accounts and returns a
  complete JWT session.
- `POST /api/auth/login` returns a controlled 401 for incorrect credentials;
  it does not crash the API or expose whether the email exists.
- `GET /api/auth/me` returns the authenticated active account.
- Duplicate registration returns a controlled 409.
- Malformed legacy BCrypt data is treated as invalid credentials, not a server
  error.
- JWTs contain the database user ID and role and expire after the configured
  duration.

## New compatible work completed

### Profile

- `GET /api/profile`
- `PATCH /api/profile`
- Only `FullName` and `PhoneNumber` can be edited.
- Email, role, account status, user ID, and Store ownership cannot be changed
  through the profile endpoint.
- All operations use the authenticated JWT user ID.

### Password management

- `POST /api/auth/change-password`
  - verifies the current password;
  - enforces a strong new password;
  - rejects reuse of the current password;
  - creates a new BCrypt hash.
- `POST /api/auth/forgot-password`
  - always returns the same safe response, even for an unknown email;
  - creates a cryptographically random, 20-minute reset token;
  - stores only its SHA-256 hash;
  - invalidates older unused tokens.
- `POST /api/auth/reset-password`
  - accepts only a valid, unexpired, unused token;
  - uses database concurrency protection so two requests cannot consume the
    same token successfully;
  - rejects password reuse;
  - changes the BCrypt password hash;
  - makes the token single-use.

In Development, the forgot-password response can expose
`developmentResetToken` for local testing. In Production it is omitted.
A production email/SMS provider still needs to deliver the raw reset link;
that external provider and its credentials were not present in either project.

### Authorization cleanup

Temporary caller-controlled identity headers were removed from:

- Buyer addresses
- Buyer review writes
- Admin Store approval and notifications
- Admin category management

Protected controllers now use `Authorization: Bearer <token>`, the JWT user ID,
and role authorization. Public product-review reading remains anonymous.

### Database

`Database/add-password-reset-token.sql` safely adds the new reset-token table
and indexes without recreating the existing commerce database.

Run it once against `ECommerceDB_Final`, followed by:

```sql
Database/verify-commerce-schema.sql
```

## Validation added

- Auth tests cover unknown users, wrong passwords, malformed legacy hashes,
  successful sessions, controlled 401/409 responses, password changing,
  account-safe forgot-password behavior, expired reset tokens, and single-use
  valid reset tokens.
- Profile tests cover profile reading, safe editable fields, and inactive
  accounts.
- All C# source files were syntax-parsed after the merge.

## Run on Windows

From the extracted backend root:

```powershell
dotnet restore
dotnet build
dotnet test
dotnet run
```

Keep `Jwt:Key` and `ConnectionStrings:DefaultConnection` in User Secrets; do
not add them to the ZIP or commit them.

## Not implemented from the friend ZIP

Refresh-token files in the friend ZIP were empty and no refresh-token database
schema or working service existed. This backend therefore retains the existing
60-minute access JWT and requires login again after expiration. A refresh-token
feature should only be added together with secure token rotation, revocation,
database persistence, and frontend support.

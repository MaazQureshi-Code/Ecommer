# Authentication and Store validation fix

## Corrected behavior

- Unknown email, wrong password, inactive account, unsupported role, and
  malformed legacy password hashes are controlled authentication results.
- Incorrect credentials return HTTP 401 with code
  `AUTH_INVALID_CREDENTIALS`; they no longer throw
  `UnauthorizedAccessException` from `AuthService.LoginAsync`.
- Duplicate registration returns HTTP 409 with code
  `AUTH_EMAIL_ALREADY_EXISTS`.
- Successful login and registration retain the existing JWT response contract.
- Seller Store creation and profile update require a non-empty, valid
  `SupportEmail` at both DTO and service levels.
- Unexpected exceptions still use `GlobalExceptionHandler`.

## Install

Keep the current working backend as `Ecommerce-Backend-old`, then use this
folder as `Ecommerce-Backend`. The JWT key remains in .NET user-secrets and is
not included in this package.

## Verify on Windows

Stop any running Shopera process first, then run:

```powershell
dotnet restore
dotnet build
dotnet test
dotnet list package --vulnerable --include-transitive
dotnet run
```

Expected authentication checks:

- Wrong credentials return HTTP 401; Visual Studio does not pause inside
  `AuthService.LoginAsync`.
- Correct credentials return a JWT and expiry.
- A missing or invalid Store Business Email returns HTTP 400 validation data.
- A valid Business Email allows Store creation/update to continue.

# Friend backend merge audit

## Verdict

The friend repository was useful, but it was not safe to copy over the current backend. It targeted .NET 8 and contained older copies of Product, Store, Address, Admin, `Program.cs`, `ApplicationDbContext`, application settings, and SQL ownership. Those files were excluded.

This package starts from the newest Shopera backend and adapts only the useful commerce work to the current .NET 10 entities, string status constants, EF configurations, routes, and seller ownership rules.

| Friend area | Decision | Reason |
|---|---|---|
| JWT identity boundary | Adapted | Uses current `UserAccount` fields, configured token lifetime, active-account checks, and Buyer/Seller-only public registration |
| Cart ownership | Adapted and hardened | JWT buyer ownership, active-account recheck, current price metadata, clear-cart endpoint, and one-store rule |
| Order checkout and stock | Adapted and hardened | Transactional checkout, immutable purchase snapshots, stock revalidation, seller ownership, cancellation restore, and status history |
| Seller order views | Adapted | Seller ownership is applied in the database query; confidential cost and buyer email are not returned |
| Notifications | Adapted | Authenticated recipient comes from JWT; stored notifications remain the durable source of truth |
| Friend Product/Store/Admin/UserManagement | Excluded | Older and incompatible with the newer completed modules |
| Friend `Program.cs`/DbContext/appsettings | Excluded | Would overwrite current registrations/mappings and contained environment-specific configuration |
| Wishlist | Excluded | A separate teammate owns this backend feature |
| Refresh/forgot/reset password stubs | Excluded | Empty/incomplete implementations must not be exposed as working endpoints |

## Security corrections made during adaptation

- Public registration cannot create Admin accounts.
- Seller registration does not silently create a Store; the existing seller store submission and admin approval flow remains authoritative.
- JWT expiry uses `Jwt:DurationInMinutes` instead of a hard-coded seven days.
- Seller Product and Store controllers use the authenticated seller claim; the old development header is not trusted as identity.
- Cart, Order, and Notification endpoints derive account ownership from JWT claims.
- Checkout accepts only a payment method. It never accepts or stores PAN/CVV/card form fields.
- The friend repository's connection string and JWT key were not copied. If they were real credentials, rotate them.

## Intentionally unfinished integrations

- No payment gateway is connected. Checkout creates a `PENDING` payment record with no card secrets.
- Coupon `UsageLimit` can reject zero remaining uses, but decrementing usage requires a coupon-redemption ledger/table and is not invented here.
- Refresh tokens and password recovery require token persistence, expiry, revocation, and email delivery; they are intentionally absent.
- Buyer Address and Review controllers still use their existing development identity bridge. Convert those when buyer work begins.
- Admin controllers still use their existing development identity bridge. Production Admin authentication should be handled as a separate security task.

## Verification performed here

- Compared the friend and newest backend structures and contracts.
- Excluded `.git`, `.vs`, `bin`, `obj`, coverage output, user-specific project files, and friend secrets.
- Parsed every C# source file with a C# grammar: no syntax-error nodes were found.
- Added commerce integration tests for cart/checkout snapshots, stock decrement, seller ownership, buyer cancellation, and stock restoration.

The current workspace does not contain the .NET SDK, so semantic compilation and xUnit execution must be run on the target Windows machine using the commands in `MERGE_AND_RUN.md`.

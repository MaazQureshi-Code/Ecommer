# Merge and run this backend

This ZIP is a complete backend based on your newest backend. Extract it into a new folder first; do not copy the friend's old repository over your existing project.

## 1. Keep a backup

Rename your current backend folder, for example:

```powershell
Rename-Item "Ecommerce-Backend" "Ecommerce-Backend-before-friend-merge"
```

Extract this ZIP and rename the extracted `Shopera-Backend-Merged` folder to `Ecommerce-Backend`.

## 2. Configure secrets

The ZIP intentionally contains no database password and no JWT signing key.

From the extracted backend folder:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_CURRENT_CONNECTION_STRING"
$jwtKey = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
dotnet user-secrets set "Jwt:Key" $jwtKey
```

The non-secret defaults are already in `appsettings.json`:

- issuer: `Shopera.Api`
- audience: `Shopera.Frontend`
- access-token lifetime: 60 minutes

## 3. Verify the database tables

Run `Database/verify-commerce-schema.sql` against the same Shopera database. It must report no missing tables or columns. This verification script changes no data.

## 4. Restore, build, and test

```powershell
dotnet restore
dotnet build
dotnet test
dotnet run
```

Do not continue to frontend integration if build or tests fail. Send the complete terminal output so the exact failure can be corrected.

## 5. Main merged routes

| Method | Route | Role |
|---|---|---|
| POST | `/api/auth/register` | Public Buyer/Seller |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/cart` | Buyer |
| POST | `/api/cart/items` | Buyer |
| PUT | `/api/cart/items/{variantId}` | Buyer |
| DELETE | `/api/cart/items/{variantId}` | Buyer |
| DELETE | `/api/cart/items` | Buyer |
| POST | `/api/orders/checkout` | Buyer |
| GET | `/api/orders` | Buyer |
| GET | `/api/orders/{orderId}` | Buyer owner |
| PATCH | `/api/orders/{orderId}/cancel` | Buyer owner, Pending only |
| GET | `/api/orders/seller` | Seller owner |
| GET | `/api/orders/seller/{orderId}` | Seller owner |
| PATCH | `/api/orders/{orderId}/status` | Seller owner |
| GET | `/api/notifications` | Authenticated owner |
| GET | `/api/notifications/unread-count` | Authenticated owner |
| PATCH | `/api/notifications/{id}/read` | Authenticated owner |
| PATCH | `/api/notifications/read-all` | Authenticated owner |

Seller status flow is strictly:

`PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED`

The buyer may cancel only while the order is `PENDING`.

## 6. Frontend note

Your current frontend authentication service is still demo/local. After this backend passes its tests, the next step is to replace frontend demo registration/login with `/api/auth/register` and `/api/auth/login`, store the returned token, and send `Authorization: Bearer <token>` through the shared HTTP client. The old `X-Seller-User-Id` header must not be used as authentication.

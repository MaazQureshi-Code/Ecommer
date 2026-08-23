# E-Commerce Backend

Backend repository for the Mini E-Commerce Platform internship project.

## Technologies
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server

## Team
- Ehsan
- Keymanesh
- Maaz

## Project status

The backend now contains these database-aligned vertical slices:

- Notification foundation and dynamic Admin seller approval.
- Buyer-owned `BUYER_ADDRESS` CRUD with default-address rules.
- Product `REVIEW` listing, average rating, and Buyer-owned write actions
  restricted to products received in a `DELIVERED` order.
- Seller Store creation, profile update, and rejected-store resubmission.
- Admin-managed category hierarchy with cycle and in-use protection.
- Complete Seller product aggregates covering product information, images,
  variants, SKU, inventory, pricing, confidential cost, status, and optimistic
  concurrency.
- Public paged catalogue, category browsing, approved Store pages, search,
  filters, sorting, related products, dynamic brands, and complete buyer-safe
  product detail.
- Configurable frontend CORS with localhost Vite origins in Development and
  no wildcard production policy.
- JWT registration, login, current-user identity, profile editing, password
  change, and single-use password-reset tokens.
- Automated service tests plus organized HTTP and SQL verification material.

## Admin workflow

The admin feature reads the existing SQL Server tables:

- `USER_ACCOUNT`
- `STORE`
- `STORE_APPROVAL_HISTORY`
- `NOTIFICATION`

It supports:

- Paginated pending-store search
- Store approval and rejection
- Permanent approval-history records
- Automatic seller notifications
- Dynamic buyer, seller, admin, and store-owner recipient search
- Manual admin notifications to a user or store owner

The public notification test endpoint was removed. Use the request examples in
`Shopera.http`.

### Authentication

Protected Buyer, Seller, Admin, profile, and notification routes require
`Authorization: Bearer <token>`. The API reads the user ID and role from the
validated JWT; caller-provided identity headers are not accepted.

Password-reset tokens are random, single-use, expire after 20 minutes, and are
stored only as SHA-256 hashes. Development responses may expose the raw token
for local testing. Production still needs an email provider to deliver the
reset link.

### Why `NotificationHub` is empty

The hub is the SignalR connection endpoint. It does not need public methods
because this feature sends events from `NotificationService` through
`IHubContext<NotificationHub>`. Add methods to the hub only if a connected
client must invoke server behavior directly.

## Feature folders

```text
Common/
Data/Configurations/
Domain/Entities/
Features/
  Admin/
    Categories/
  Buyer/
    Addresses/
    Reviews/
  Notifications/
  Seller/
    Products/
    Stores/
  Catalogue/
Testing/
tests/Shopera.Tests/
```

The misspelled `Data/Configrations` folder and the `DTOS` casing split were
removed. Entity Framework configurations are discovered from the assembly.

## New routes

- `GET/POST /api/buyer/addresses`
- `GET/PATCH/DELETE /api/buyer/addresses/{addressId}`
- `GET/POST /api/products/{productId}/reviews`
- `PATCH/DELETE /api/products/{productId}/reviews/mine`
- `GET/POST/PATCH /api/seller/store`
- `PATCH /api/seller/store/status`
- `POST /api/seller/store/resubmit`
- `GET/POST/PATCH/DELETE /api/admin/categories`
- `GET/POST/PATCH/DELETE /api/seller/products`
- `GET /api/seller/products/inventory`
- `PUT /api/seller/products/{productId}/info`
- `POST/PATCH/DELETE /api/seller/products/{productId}/images`
- `POST/PATCH/DELETE /api/seller/products/{productId}/variants`
- `PATCH /api/seller/products/{productId}/status`
- `GET /api/products` and `GET /api/products/{productId}`
- `GET /api/categories`
- `GET /api/stores`, `/api/stores/{storeId}`, and Store products
- `POST /api/auth/register`, `/login`, `/change-password`,
  `/forgot-password`, and `/reset-password`
- `GET /api/auth/me`
- `GET/PATCH /api/profile`

## Database safety

The application maps the approved existing 23-table `ECommerceDB_Final`
schema, including `STORE`, `CATEGORY`, `PRODUCT`, `PRODUCT_INFO`,
`PRODUCT_IMAGE`, and `PRODUCT_VARIANT`. It does not create or migrate the
database. Do not run the clean database creation script over populated data.

Run `Database/add-password-reset-token.sql` once before using password reset,
then run `Database/verify-commerce-schema.sql`.

Public projections deliberately exclude `PRODUCT_VARIANT.CostPrice` and
`RowVersion`. Seller responses include those fields so inventory and
concurrency can be managed. Catalogue queries use SQL-side projections,
`AsNoTracking`, stable ordering, and a maximum page size of 100, so a catalogue
of 1,000 products is never rendered in one response.

The public catalogue accepts `search`, `categoryId`, `brand`, `storeId`,
`condition`, `minimumPrice`, `maximumPrice`, `inStockOnly`, `sort`, `page`, and
`pageSize`. Supported sort values are `newest`, `price_asc`, `price_desc`,
`rating_desc`, `name_asc`, and `name_desc`; every order ends with `ProductID`
as a deterministic tie-breaker.

## Testing

Open `Testing/README.md` for the full test order. Automated tests are in
`tests/Shopera.Tests`, and manual requests are grouped under `Testing/Http`.

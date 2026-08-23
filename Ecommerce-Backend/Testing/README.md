# Shopera complete backend testing guide

This folder keeps manual API requests, SQL verification queries, and the
expected-result matrix separate from production source code.

## Using the separate testing ZIP

`Shopera-Testing-Materials.zip` is a companion to the completed backend ZIP.
Extract the completed backend first, then copy the companion ZIP's `Testing`
and `tests` folders into the extracted `Ecommerce-Backend` project root. Keep
the test project at `tests/Shopera.Tests` because its project reference expects
`Shopera.csproj` two levels above it.

## Important setup

1. Open `Shopera.slnx` in Visual Studio 2022 with the .NET 10 SDK.
2. Keep the existing `ECommerceDB_Final` database. Do not create a new
   migration or run the clean creation script over populated data.
3. Set `ConnectionStrings:DefaultConnection` with User Secrets or a local
   development setting that is not committed.
4. Run the API in the `Development` environment at
   `http://localhost:5208`.
5. Replace the sample IDs and latest variant `rowVersion` in each `.http`
   file with rows that exist in the local database. For review creation,
   select an ACTIVE Buyer with a
   `DELIVERED` order whose `ORDER_ITEM` variant belongs to the selected
   product.

## Automated tests

Run the complete suite from Visual Studio Test Explorer, or use:

```powershell
dotnet test .\Shopera.slnx
```

The 29 automated service tests cover:

- buyer address ownership, duplicate prevention, and default-address rules;
- delivered-purchase review eligibility, one review per buyer/product,
  ownership, and average rating;
- one store per seller, pending submission, Admin notifications, and
  rejected-store resubmission;
- Admin-only category creation, hierarchy-cycle protection, and safe deletion;
- complete Seller product aggregate creation, store readiness, publication
  rules, cost/inventory updates, ProductID/VariantID-safe paged inventory,
  availability synchronization, and soft delete;
- public visibility boundaries, complete buyer-safe detail, invalid filtering,
  related products, dynamic brands, and deterministic paging over 1,000
  products.

## Manual test order

1. Run `Http/BuyerAddresses.http`.
2. Run `Http/Reviews.http`.
3. Run `Http/SellerStores.http`.
4. Run `Http/AdminNotifications.http` to approve or reject the submitted
   store.
5. Run `Http/AdminCategories.http` to create/select the category hierarchy.
6. Run `Http/SellerProducts.http` to create the product aggregate and publish
   it.
7. Run `Http/PublicCatalogue.http` to verify buyer-safe product/store views
   and paging.
8. Run `Sql/VerifyAddressReviewStore.sql` and
   `Sql/VerifyCatalogue.sql` in SQL Server Management Studio.
9. Compare results with `Test-Matrix.md`.

For a beginner-friendly backend/frontend walkthrough, including exact request
order and browser verification, open
`Step-by-Step-Product-Store-API.md`.

## Frontend development CORS

`appsettings.Development.json` allows the Vite frontend origins
`http://localhost:5173` and `https://localhost:5173`. Keep production origins
explicit in `Cors:AllowedOrigins`; an empty list disables the policy instead
of allowing arbitrary websites.

## Authentication

The identity headers shown in some older manual `.http` examples are obsolete.
Register or sign in through `/api/auth/register` or `/api/auth/login`, then use
`Authorization: Bearer <token>` for protected Buyer, Seller, and Admin routes.
The API derives the user ID and role from the validated JWT.

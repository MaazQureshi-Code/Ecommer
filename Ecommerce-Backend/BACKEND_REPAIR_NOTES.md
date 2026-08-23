# Shopera Backend Repair Notes

This package repairs the incomplete Copilot binary-image conversion while preserving the existing Address, Review, Store, Admin, Notification, Product, Catalogue, Category, and Variant behavior.

## Repaired failures

- Removed stale `ProductImage.ImageUrl` and request `ImageUrl` references from executable C# code.
- Fixed the catalogue projection syntax error and generated image URLs after query materialization.
- Completed `ISellerProductService.GetImageContentAsync`.
- Connected Seller image create/update operations to multipart binary validation and SQL Server `VARBINARY(MAX)` storage.
- Kept catalogue and Product-detail metadata queries from selecting `ImageData`.
- Added public and Seller image-content responses with appropriate caching behavior.
- Fixed the image validator stream handling and accepted both `.jpg` and `.jpeg`.
- Updated old tests and replaced invalid generated tests with database-aligned tests.
- Added tiny test JPEG/PNG assets for the `.http` image requests.
- Removed machine-generated `.vs`, `bin`, `obj`, and `.csproj.user` content from the handoff package.

## Required database columns

`dbo.PRODUCT_IMAGE` must contain:

- `ImageData VARBINARY(MAX) NOT NULL`
- `ContentType NVARCHAR(50) NOT NULL`
- `OriginalFileName NVARCHAR(255) NULL`

It must not contain the old `ImageURL` column.

## Local verification

Open `Shopera.slnx` in Visual Studio with the .NET 10 SDK, then run:

```powershell
dotnet restore
dotnet build
dotnet test
```

Then execute `Testing/Sql/VerifyProductImages.sql` and use `Testing/Http/SellerProductImages.http` with real Seller, Product, and Image IDs.

## Environment limitation

The repair workspace does not include the .NET SDK, so compilation and xUnit execution could not be run here. XML/JSON parsing, source consistency checks, removed-column searches, delimiter checks, and whitespace checks were completed.

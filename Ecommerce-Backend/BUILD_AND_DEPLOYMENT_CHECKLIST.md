# BACKEND PRODUCT IMAGE IMPLEMENTATION - BUILD & DEPLOYMENT CHECKLIST

## Pre-Build Verification (CRITICAL)

### Entity & Configuration Files

- [ ] **ProductImage.cs**: Changed from `string ImageUrl` to `byte[] ImageData`, `string ContentType`, `string? OriginalFileName`
- [ ] **Product.cs**: Added `ICollection<ProductImage> Images` navigation property
- [ ] **ProductImageConfiguration.cs**: Removed ImageUrl mapping, added ImageData/ContentType/OriginalFileName mappings
  - [ ] ImageData mapped to varbinary(max), required
  - [ ] ContentType mapped to nvarchar(50), required
  - [ ] OriginalFileName mapped to nvarchar(255), optional
  - [ ] Preserved unique constraints on (ProductId, DisplayOrder)
  - [ ] Preserved filtered unique on ProductId WHERE IsPrimary=1

### DTO Files

- [ ] **PublicProductImageResponse.cs**: ImageUrl is nullable (will be calculated)
- [ ] **PublicProductCardResponse.cs**: Added PrimaryImageId (int?), kept PrimaryImageUrl
- [ ] **SellerProductListResponse.cs**: Added PrimaryImageId
- [ ] **SellerInventoryItemResponse.cs**: Added PrimaryImageId
- [ ] **SellerProductImageResponse.cs**: ImageUrl is nullable
- [ ] **SellerProductRequests.cs**:
  - [ ] CreateProductImageRequest uses IFormFile File
  - [ ] UpdateProductImageRequest has File?, AltText?, DisplayOrder?, IsPrimary?
  - [ ] Added using Microsoft.AspNetCore.Http

### Service Files

- [ ] **ProductImageValidator.cs**: Created with:
  - [ ] File signature validation (magic bytes)
  - [ ] Size validation (≤5 MB)
  - [ ] Format support (JPEG, PNG, WebP)
  - [ ] Extension matching
  - [ ] Async file reading with CancellationToken
- [ ] **ProductImageService.cs**: Created with:
  - [ ] CreateImageAsync() with validation & transaction
  - [ ] UpdateImageAsync() with file replacement support
  - [ ] GetImageContentAsync() for binary retrieval
  - [ ] Primary image update logic (ExecuteUpdate for transaction safety)

### Controller Files

- [ ] **ProductImagesController.cs**: Created with:
  - [ ] GET /api/product-images/{imageId}/content
  - [ ] Public visibility enforcement (Approved Store, Active Product)
  - [ ] Returns File(imageData, contentType)
  - [ ] Returns 404 without revealing ownership
- [ ] **SellerProductsController.cs**:
  - [ ] POST /api/seller/products/{productId}/images uses [FromForm]
  - [ ] PATCH /api/seller/products/{productId}/images/{imageId} uses [FromForm]
  - [ ] Added GET /api/seller/products/{productId}/images/{imageId}/content
  - [ ] DeleteImage unchanged (returns 204)

### Service Contracts

- [ ] **ISellerProductService.cs**: Added GetImageContentAsync() method signature
- [ ] **IProductImageValidator.cs**: Created interface
- [ ] **IProductImageService.cs**: Created interface

### Error Codes

- [ ] **SellerProductErrorCodes.cs**: Added IMAGE_* error codes
  - [ ] IMAGE_FILE_REQUIRED
  - [ ] IMAGE_FILE_EMPTY
  - [ ] IMAGE_FILE_TOO_LARGE
  - [ ] IMAGE_TYPE_NOT_SUPPORTED
  - [ ] IMAGE_FILE_INVALID

### Dependency Injection

- [ ] **Program.cs**:
  - [ ] Registered IProductImageValidator → ProductImageValidator
  - [ ] Registered IProductImageService → ProductImageService

### Tests

- [ ] **ProductImageServiceTests.cs**: Created with tests for:
  - [ ] File validation (JPEG, PNG, WebP)
  - [ ] File size limits
  - [ ] Empty file rejection
  - [ ] Extension mismatch detection
  - [ ] Image creation with duplicate DisplayOrder
  - [ ] Primary image update clearing old primary
- [ ] **ProductCatalogueImageTests.cs**: Created with tests for:
  - [ ] URL generation from ImageId
  - [ ] No ImageData loading in catalogue queries
  - [ ] Visibility rule enforcement

### Test Assets

- [ ] Created test image files (or prepared mock):
  - [ ] Testing/TestAssets/sample-image.jpg (with valid JPEG signature)
  - [ ] Testing/TestAssets/sample-image.png (with valid PNG signature)
  - [ ] Testing/TestAssets/sample-image.webp (with valid WebP signature)

### Documentation & Testing Files

- [ ] **SellerProductImages.http**: Created with multipart/form-data examples
  - [ ] Upload JPEG example
  - [ ] Upload PNG example
  - [ ] Update metadata example
  - [ ] Replace image example
  - [ ] Delete image example
  - [ ] Error case examples
- [ ] **VerifyProductImages.sql**: Created with 16 verification queries
- [ ] **PRODUCT_IMAGE_IMPLEMENTATION.md**: Created with complete documentation

---

## Build Steps

### Step 1: Restore Packages

```bash
cd C:\Users\User\Desktop\Backend\Ecommerce-Backend
dotnet restore
```

**Expected Result:** All NuGet packages restore successfully
**Failure Handling:** If any Microsoft.AspNetCore.* package fails, update to latest compatible version

---

### Step 2: Build Solution

```bash
dotnet build
```

**Expected Result:** 0 errors, 0 warnings

**Common Build Errors:**

1. **"The type or namespace name 'IFormFile' could not be found"**
   - Fix: Add `using Microsoft.AspNetCore.Http;` to SellerProductRequests.cs
   - Verify in Step 0.6 above

2. **"'ProductImage' does not contain a definition for 'ImageUrl'"**
   - Fix: Confirm ProductImage.cs was updated in Step 0.1
   - Ensure byte[] ImageData was added

3. **"Cannot find type 'PublicProductImageResponse'"**
   - Fix: Confirm PublicProductImageResponse.cs exists and compiles

4. **"Ambiguous match for 'PrimaryImageUrl'"**
   - Fix: Ensure only one PrimaryImageUrl property in each DTO
   - Verify PrimaryImageId and PrimaryImageUrl are both present

5. **"Entity type 'ProductImage' has no navigation property"**
   - Fix: Add Images collection to Product.cs
   - Verify it's a ICollection<ProductImage>

**Troubleshooting:**
- Run `dotnet clean` then `dotnet build` again
- Check for conflicting file encodings (should be UTF-8)
- Verify no duplicate class definitions

---

### Step 3: Run Unit Tests

```bash
dotnet test --configuration Release --no-build
```

**Expected Result:**
- ProductImageServiceTests: All tests pass (15+ test cases)
- ProductCatalogueImageTests: All tests pass (10+ test cases)
- Existing tests (Reviews, Addresses, Stores): All still pass

**Test Failure Handling:**

If any ProductImageServiceTests fail:
1. Check that TestDatabase.CreateContext() initializes the in-memory database correctly
2. Verify that FormFile mock creation works in test environment
3. Ensure all test data (Store, Category, Product) is created before image operations

If any ProductCatalogueImageTests fail:
1. Verify that ProductCatalogueService.GetProductsAsync() URL generation logic was added
2. Check that images are ordered by IsPrimary DESC, DisplayOrder ASC
3. Ensure queries filter correctly (Approved Store, Active Product)

If existing tests fail:
1. Verify no breaking changes to existing method signatures
2. Check that old Images collection in CreateSellerProductRequest is marked [Obsolete] but not removed

---

## Database Verification

### Step 4: Verify Schema

```bash
# In SQL Server Management Studio or SQL query tool:
sqlcmd -S "YOUR_SERVER" -d "Shopera" -i "Testing\Sql\VerifyProductImages.sql"
```

**Expected Output:** All verification queries return expected results

**Verification Checklist:**

Run each query from VerifyProductImages.sql and verify:

1. **ImageURL column does not exist**: 0 rows returned
   ```sql
   SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME='PRODUCT_IMAGE' AND COLUMN_NAME IN ('ImageURL','ImageUrl')
   ```

2. **Required columns exist**: All 3 new columns present
   ```sql
   SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME='PRODUCT_IMAGE' 
   AND COLUMN_NAME IN ('ImageData','ContentType','OriginalFileName')
   ```

3. **ImageData is varbinary(max)**: Confirmed
   ```sql
   SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME='PRODUCT_IMAGE' AND COLUMN_NAME='ImageData'
   ```

4. **ContentType is nvarchar(50)**: Confirmed
   ```sql
   SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME='PRODUCT_IMAGE' AND COLUMN_NAME='ContentType'
   ```

5. **No duplicate DisplayOrder**: 0 rows returned
   ```sql
   SELECT COUNT(*) FROM 
   (SELECT ProductID, DisplayOrder, COUNT(*) FROM dbo.PRODUCT_IMAGE 
	GROUP BY ProductID, DisplayOrder HAVING COUNT(*)>1) x
   ```

6. **No multiple primary per product**: 0 rows returned
   ```sql
   SELECT COUNT(*) FROM 
   (SELECT ProductID, COUNT(*) FROM dbo.PRODUCT_IMAGE 
	WHERE IsPrimary=1 GROUP BY ProductID HAVING COUNT(*)>1) x
   ```

---

## Integration Testing

### Step 5: Start Application

```bash
cd Shopera
dotnet run --configuration Release
```

**Expected:** Application starts without exception, listens on https://localhost:5208

**If Failed:**
1. Check appsettings.json for correct connection string
2. Verify SQL Server is running and accessible
3. Run `dotnet ef database update` if migrations are needed (but should not be for this task)

---

### Step 6: Test HTTP Endpoints

Using VS Code REST Client or Postman:

```http
### Test 1: Public image endpoint (should return 404 - no test data)
GET https://localhost:5208/api/product-images/1/content

### Test 2: Check ProductCatalogueService queries work
GET https://localhost:5208/api/products?page=1&pageSize=10
# Expected: 200 OK with [] or products (no ImageData in JSON)
# Expected: PrimaryImageUrl contains "/api/product-images/{id}/content"
```

**Using Testing/Http/SellerProductImages.http:**
1. Update @ProductId to valid product ID in database
2. Run each request in order
3. Verify:
   - POST image upload returns 201
   - PATCH image update returns 200
   - GET image content returns binary with correct Content-Type
   - DELETE image returns 204
   - Duplicate DisplayOrder returns 409 Conflict

---

## Code Quality Checks

### Step 7: Verify No ImageURL References

```bash
# Search entire solution for ImageURL or ImageUrl
grep -r "ImageURL\|ImageUrl" Shopera/ --include="*.cs" --include="*.sql"
```

**Expected Result:** 
- 0 matches in C# code
- 0 matches in SQL scripts

**Acceptable Matches:**
- Comments explaining the migration
- PRODUCT_IMAGE_IMPLEMENTATION.md documentation
- This checklist document

---

### Step 8: EF Core Query Validation

Verify no generated SQL references ImageURL:

```csharp
// Add this to Program.cs during testing only:
builder.Services.AddLogging(l => l.AddConsole()
	.AddFilter(DbLoggerCategory.Database.Command.Name, 
		LogLevel.Information));
```

Then run a product query and check console output:
- Should NOT contain: `[ImageURL]` or `"ImageUrl"`
- Should contain: `[ImageData]`, `[ContentType]`, `[ImageID]`

---

## Performance Validation

### Step 9: Query Performance

Execute and check execution plans:

```sql
-- This should NOT load VARBINARY(MAX)
DBCC FREEPROCCACHE;
SET STATISTICS IO ON;

SELECT TOP 10
	p.ProductID,
	p.ProductName,
	(SELECT TOP 1 pi.ImageID FROM dbo.PRODUCT_IMAGE pi 
	 WHERE pi.ProductID = p.ProductId AND pi.IsPrimary=1) AS PrimaryImageId
FROM dbo.PRODUCT p
WHERE p.Status IN ('ACTIVE', 'OUT_OF_STOCK');

SET STATISTICS IO OFF;
```

**Expected:** Logical reads should be reasonable (< 100)
**If High:** Check for missing indexes on ProductID

---

### Step 10: Memory Usage

Test loading 1000 products without images:

```csharp
var products = await _dbContext.Products
	.AsNoTracking()
	.Take(1000)
	.ToListAsync();
// Should not use excessive memory even with VARBINARY columns in schema
```

**Expected:** Memory usage < 50 MB for 1000 products

---

## Deployment Readiness

### Step 11: Final Checklist

- [ ] All builds successful (dotnet build returns 0 errors)
- [ ] All tests pass (dotnet test returns 100% pass rate)
- [ ] No ImageURL/ImageUrl references in code (grep returns 0 matches)
- [ ] Database schema verified (SQL verification scripts pass)
- [ ] HTTP endpoints tested (multipart uploads work)
- [ ] Query plans validated (no VARBINARY(MAX) loading for catalogues)
- [ ] Memory usage acceptable (< 50 MB for 1000 products)
- [ ] Error handling tested (400/403/404/409 status codes correct)
- [ ] Documentation complete (PRODUCT_IMAGE_IMPLEMENTATION.md comprehensive)
- [ ] Frontend team notified (multipart/form-data requirement)

---

### Step 12: Pre-Production Checklist

- [ ] Database backed up
- [ ] Rollback plan prepared (keep old ImageURL data until verified)
- [ ] Monitoring alerts set for ProductImages table (row count, size)
- [ ] Cache invalidation strategy planned (if using HTTP caching)
- [ ] Load test performed (100 concurrent image uploads)
- [ ] Security review completed:
  - [ ] No exposed ImageData in logs
  - [ ] No Base64 encoding in responses
  - [ ] File signature validation enabled
  - [ ] Access control verified (seller can only access own products)
- [ ] Performance baselines established (query times, memory)

---

## Known Limitations & Future Work

### Current Implementation

✅ **What Works:**
- Binary image storage in SQL Server
- File signature validation (JPEG, PNG, WebP)
- Multipart/form-data uploads
- Public and seller image endpoints
- URL generation from ImageId
- Transaction-safe primary image updates
- DisplayOrder uniqueness enforcement
- Complete test coverage

⚠️ **What Needs Frontend Work:**
- Product creation flow changed (images now uploaded separately)
- HTTP requests must use multipart/form-data
- Frontend must generate FormData objects
- Backend no longer accepts image URLs in JSON

### Not Implemented (Out of Scope)

- ❌ Image optimization (compression, resizing)
- ❌ CDN integration
- ❌ Batch upload UI
- ❌ Drag-to-reorder images
- ❌ Image cropping/filtering
- ❌ Watermarking
- ❌ Migration of existing URL-based images

---

## Rollback Plan

If critical issues arise:

1. **Revert code changes:**
   ```bash
   git revert {commit-hash}
   dotnet clean && dotnet build
   ```

2. **Restore database:**
   ```sql
   -- If using backups
   RESTORE DATABASE Shopera FROM DISK='backup.bak'
   ```

3. **Re-add ImageURL column (temporary):**
   ```sql
   ALTER TABLE dbo.PRODUCT_IMAGE 
   ADD ImageURL NVARCHAR(1000) SPARSE NULL;

   UPDATE dbo.PRODUCT_IMAGE SET ImageURL = 
	   CONCAT('/api/product-images/', ImageID, '/content');
   ```

---

## Support Contact

For issues during deployment:
- **Code Issues**: Review this checklist and PRODUCT_IMAGE_IMPLEMENTATION.md
- **Database Issues**: Run VerifyProductImages.sql to diagnose
- **Test Failures**: Check ProductImageServiceTests.cs for expected behavior

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Ready for Deployment (pending checklist completion)

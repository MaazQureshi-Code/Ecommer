# Product Image Backend Implementation - Complete

## Summary

This document describes the completed backend changes for product image management after migrating from URL storage to binary SQL Server storage with `VARBINARY(MAX)`.

## Root Cause Fixed

**Error:** `Microsoft.Data.SqlClient.SqlException: Invalid column name 'ImageURL'.`

**Root Cause:** The database schema was changed to use binary image storage (`ImageData VARBINARY(MAX)`, `ContentType NVARCHAR(50)`, `OriginalFileName NVARCHAR(255)`), but the C# entity and EF Core configuration still referenced the removed `ImageUrl` column. When the application executed product queries, EF generated SQL that selected from the non-existent `ImageURL` column.

**Fixed By:**
1. Updated `ProductImage` entity to use `byte[] ImageData`, `string ContentType`, `string? OriginalFileName`
2. Updated EF Core configuration in `ProductImageConfiguration.cs` to map new properties
3. Updated all product query projections to select `ImageId` instead of `ImageUrl`
4. Added URL generation after query materialization in C# (not in SQL)

---

## Database Schema

### PRODUCT_IMAGE Table

| Column | Type | Nullable | Constraints | Notes |
|--------|------|----------|-------------|-------|
| ImageID | INT | NO | PK, IDENTITY | Primary key |
| ProductID | INT | NO | FK → PRODUCT | Foreign key (NO ACTION) |
| **ImageData** | VARBINARY(MAX) | NO | | **NEW**: Binary image bytes (JPEG, PNG, WebP) |
| **ContentType** | NVARCHAR(50) | NO | | **NEW**: MIME type (image/jpeg, image/png, image/webp) |
| **OriginalFileName** | NVARCHAR(255) | YES | | **NEW**: Original upload filename |
| AltText | NVARCHAR(255) | YES | | Accessible description |
| DisplayOrder | INT | NO | CHECK > 0, UQ(ProductID, DisplayOrder) | Image order within product |
| IsPrimary | BIT | NO | DEFAULT 0, Filtered UQ | Only 0-1 primary per product |
| CreatedDate | DATETIME2 | NO | DEFAULT SYSUTCDATETIME() | Creation timestamp |

### Indexes

- **PK_PRODUCT_IMAGE**: Clustered on ImageID
- **UQ_PRODUCT_IMAGE_Order**: Unique on (ProductID, DisplayOrder)
- **UX_PRODUCT_IMAGE_OnePrimary**: Filtered unique on ProductID WHERE IsPrimary=1
- **IX_PRODUCT_IMAGE_Product**: Non-clustered on ProductID

---

## Entity Model Changes

### ProductImage.cs

**Before:**
```csharp
public string ImageUrl { get; set; } = string.Empty;
```

**After:**
```csharp
public byte[] ImageData { get; set; } = Array.Empty<byte>();
public string ContentType { get; set; } = string.Empty;
public string? OriginalFileName { get; set; }
```

### Product.cs

**Added:**
```csharp
public ICollection<ProductImage> Images { get; set; } =
	new List<ProductImage>();
```

---

## API Responses

All product DTOs now follow this pattern:

### Image in Responses

```json
{
  "imageId": 15,
  "imageUrl": "/api/product-images/15/content",
  "altText": "Black laptop",
  "displayOrder": 1,
  "isPrimary": true
}
```

**Key Points:**
- `imageId`: Database ID (persisted)
- `imageUrl`: **Calculated at runtime** (not persisted)
- `altText`, `displayOrder`, `isPrimary`: Persisted metadata
- NO `imageData`, NO `contentType`, NO base64 encoding in JSON

### Product Catalogue Response

```json
{
  "productId": 12,
  "productName": "Laptop",
  "primaryImageUrl": "/api/product-images/15/content",
  "primaryImageAltText": "Front view"
}
```

**Important:** `primaryImageUrl` is **generated** from `primaryImageId` after the query materializes. It is NOT selected from the database.

### Product Detail Response

```json
{
  "productId": 12,
  "productName": "Laptop",
  "images": [
	{
	  "imageId": 15,
	  "imageUrl": "/api/product-images/15/content",
	  "altText": "Front view",
	  "displayOrder": 1,
	  "isPrimary": true
	},
	{
	  "imageId": 16,
	  "imageUrl": "/api/product-images/16/content",
	  "altText": "Side view",
	  "displayOrder": 2,
	  "isPrimary": false
	}
  ]
}
```

---

## Public API Routes

### GET /api/product-images/{imageId:int}/content

**Purpose:** Serve binary image data for publicly visible products

**Authentication:** None required

**Response:**
- **200 OK**: `File` response with appropriate `Content-Type` header
- **404 Not Found**: Image not found or product not publicly visible

**Visibility Rules:**
- Store.ApprovalStatus = APPROVED
- Store.StoreStatus = ACTIVE
- Product.Status = ACTIVE or OUT_OF_STOCK

**Returns:**
```
Content-Type: image/jpeg (or image/png, image/webp)
Content-Length: {bytes}

[Binary image data]
```

**Cache Header:** Should be set to allow browser caching of public images
```
Cache-Control: public, max-age=86400
```

---

## Seller API Routes

### POST /api/seller/products/{productId}/images

**Purpose:** Upload a new image for a seller-owned product

**Authentication:** Required (X-Seller-User-Id header)

**Content-Type:** `multipart/form-data`

**Form Parameters:**
- `File` (IFormFile, required): The image file (JPEG, PNG, or WebP)
- `AltText` (string, optional): Accessible text description
- `DisplayOrder` (int, required): Position in image list (must be > 0)
- `IsPrimary` (bool, optional): Whether this is the primary image

**Request Example:**
```
POST /api/seller/products/42/images
X-Seller-User-Id: 3
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="File"; filename="laptop.jpg"
Content-Type: image/jpeg

[binary JPEG data]
------Boundary
Content-Disposition: form-data; name="AltText"

Front view of laptop
------Boundary
Content-Disposition: form-data; name="DisplayOrder"

1
------Boundary
Content-Disposition: form-data; name="IsPrimary"

true
------Boundary--
```

**Response (201 Created):**
```json
{
  "productId": 42,
  "productName": "Laptop",
  "images": [
	{
	  "imageId": 15,
	  "imageUrl": "/api/seller/products/42/images/15/content",
	  "altText": "Front view",
	  "displayOrder": 1,
	  "isPrimary": true,
	  "createdDate": "2024-01-15T10:30:00Z"
	}
  ]
}
```

**Errors:**
- **400 Bad Request**: File validation failed (see error code)
- **403 Forbidden**: Seller does not own this product
- **404 Not Found**: Product not found
- **409 Conflict**: DisplayOrder already used for this product

**Error Codes:**
- `IMAGE_FILE_REQUIRED`: No file provided
- `IMAGE_FILE_EMPTY`: File is 0 bytes
- `IMAGE_FILE_TOO_LARGE`: File exceeds 5 MB
- `IMAGE_TYPE_NOT_SUPPORTED`: Format not JPEG/PNG/WebP
- `IMAGE_FILE_INVALID`: File signature invalid or extension mismatch
- `DUPLICATE_IMAGE_DISPLAY_ORDER`: DisplayOrder conflict
- `PRODUCT_NOT_FOUND`: Product doesn't exist
- `SELLER_FORBIDDEN`: Seller doesn't own product

---

### PATCH /api/seller/products/{productId}/images/{imageId}

**Purpose:** Update image metadata or replace the file

**Authentication:** Required (X-Seller-User-Id header)

**Content-Type:** `multipart/form-data`

**Form Parameters:**
- `File` (IFormFile, optional): New image file to replace existing
- `AltText` (string, optional): Updated description
- `DisplayOrder` (int, optional): New position
- `IsPrimary` (bool, optional): Change primary status

**Request Example (metadata update only):**
```
PATCH /api/seller/products/42/images/15
X-Seller-User-Id: 3
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="AltText"

Updated: Premium laptop front
------Boundary
Content-Disposition: form-data; name="DisplayOrder"

2
------Boundary--
```

**Request Example (file replacement):**
```
PATCH /api/seller/products/42/images/15
X-Seller-User-Id: 3
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="File"; filename="new-laptop.jpg"
Content-Type: image/jpeg

[new binary JPEG data]
------Boundary
Content-Disposition: form-data; name="IsPrimary"

true
------Boundary--
```

**Response (200 OK):** Same as POST (full product)

**Errors:** Same as POST, plus:
- `PRODUCT_IMAGE_NOT_FOUND`: Image doesn't exist

---

### DELETE /api/seller/products/{productId}/images/{imageId}

**Purpose:** Delete an image

**Authentication:** Required (X-Seller-User-Id header)

**Response (204 No Content):** Image deleted successfully

**Errors:**
- **403 Forbidden**: Seller doesn't own product
- **404 Not Found**: Product or image not found

---

### GET /api/seller/products/{productId}/images/{imageId}/content

**Purpose:** Seller preview of draft/inactive product images

**Authentication:** Required (X-Seller-User-Id header)

**Response:**
- **200 OK**: `File` response with `Content-Type` header
- **404 Not Found**: Image not found

**Differences from Public Endpoint:**
- Allows preview of DRAFT and INACTIVE products
- Only seller who owns the product can access
- Uses seller-specific cache headers

---

## Request Models

### CreateProductImageRequest

```csharp
public sealed class CreateProductImageRequest
{
	[Required]
	public IFormFile File { get; set; }

	[StringLength(255)]
	public string? AltText { get; set; }

	[Range(1, int.MaxValue)]
	public int DisplayOrder { get; set; } = 1;

	public bool IsPrimary { get; set; }
}
```

### UpdateProductImageRequest

```csharp
public sealed class UpdateProductImageRequest
{
	public IFormFile? File { get; set; }

	[StringLength(255)]
	public string? AltText { get; set; }

	[Range(1, int.MaxValue)]
	public int? DisplayOrder { get; set; }

	public bool? IsPrimary { get; set; }
}
```

---

## File Validation

The `ProductImageValidator` service validates uploaded files by reading file signatures (magic bytes), not by trusting filename or browser headers.

### Supported Formats

| Format | Magic Bytes | Signature |
|--------|------------|-----------|
| JPEG | `FF D8 FF` | First 3 bytes |
| PNG | `89 50 4E 47 0D 0A 1A 0A` | First 8 bytes |
| WebP | `52 49 46 46 ... 57 45 42 50` | RIFF header + WEBP at bytes 8-11 |

### Validation Rules

1. **File not empty**: Must have at least 1 byte
2. **File size**: Maximum 5 MB (5,242,880 bytes)
3. **File signature**: Must match JPEG, PNG, or WebP magic bytes
4. **Extension match**: File extension must match detected format
5. **Content-Type stored**: The validated MIME type is stored, not the browser-provided one

---

## Transaction Safety

When setting an image as primary:

```csharp
// Old primary (if any) is cleared
await dbContext.ProductImages
	.Where(img => img.ProductId == productId && img.IsPrimary)
	.ExecuteUpdateAsync(s => s.SetProperty(img => img.IsPrimary, false));

// New image set as primary
image.IsPrimary = true;

// Saved in same transaction (implicit or explicit)
await dbContext.SaveChangesAsync();
```

This ensures the filtered unique index `UX_PRODUCT_IMAGE_OnePrimary` is never violated.

---

## Performance Considerations

### Catalogue Queries

Product catalogue and search queries **do NOT load ImageData**:

```csharp
// ✅ CORRECT: Project only ImageId
PrimaryImageId = _dbContext.ProductImages
	.Where(...)
	.OrderByDescending(...)
	.ThenBy(...)
	.Select(image => (int?)image.ImageId)  // ← Only ID
	.FirstOrDefault()
```

```csharp
// ❌ WRONG: Would load VARBINARY(MAX) for every product
PrimaryImageUrl = _dbContext.ProductImages
	.Where(...)
	.OrderByDescending(...)
	.ThenBy(...)
	.Select(image => image.ImageUrl)  // ← No longer exists anyway
	.FirstOrDefault()
```

### URL Generation

URLs are generated in C# **after** the query returns:

```csharp
// Query materializes to memory first
var items = await query.ToListAsync();

// Then generate URLs in-memory
foreach (var item in items)
{
	if (item.PrimaryImageId.HasValue)
	{
		item.PrimaryImageUrl =
			$"/api/product-images/{item.PrimaryImageId}/content";
	}
}
```

This prevents 1000+ VARBINARY(MAX) columns from being loaded during a catalogue search.

### Image Content Endpoint

Only the content endpoint loads ImageData:

```csharp
// Only load ImageData when specifically requested
var image = await dbContext.ProductImages
	.AsNoTracking()
	.Where(img => img.ImageId == imageId)
	.Select(img => new { img.ImageData, img.ContentType })
	.FirstOrDefaultAsync();

return File(image.ImageData, image.ContentType);
```

---

## Frontend Changes Required

The frontend must be updated to support multipart/form-data image uploads instead of sending base64 or URLs in JSON.

### Old Pattern (NO LONGER SUPPORTED)

```javascript
// ❌ This no longer works
const createRequest = {
  productName: "Laptop",
  images: [
	{
	  imageUrl: "https://cdn.example.com/laptop.jpg",  // ← Removed
	  altText: "Front view"
	}
  ]
};

fetch('/api/seller/products', {
  method: 'POST',
  body: JSON.stringify(createRequest)
});
```

### New Pattern (REQUIRED)

**Step 1: Create Product (without images)**
```javascript
const createRequest = {
  productName: "Laptop",
  // No images array in create request
};

const productResponse = await fetch('/api/seller/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(createRequest)
});

const product = await productResponse.json();
const productId = product.productId;
```

**Step 2: Upload Images (separate requests)**
```javascript
const formData = new FormData();
formData.append('File', imageFile); // HTML input[type="file"]
formData.append('AltText', 'Front view');
formData.append('DisplayOrder', '1');
formData.append('IsPrimary', 'true');

const imageResponse = await fetch(
  `/api/seller/products/${productId}/images`,
  {
	method: 'POST',
	body: formData
	// NOTE: Do NOT set Content-Type header; browser sets it automatically
  }
);

const updatedProduct = await imageResponse.json();
```

**Step 3: Create Variants**
```javascript
const variantRequest = {
  sku: "LAPTOP-001",
  price: 999.99,
  stockQuantity: 10
};

await fetch(`/api/seller/products/${productId}/variants`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(variantRequest)
});
```

**Step 4: Publish Product**
```javascript
await fetch(`/api/seller/products/${productId}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'ACTIVE' })
});
```

### Key Differences

| Aspect | Old | New |
|--------|-----|-----|
| Image creation | Part of product JSON | Separate multipart request |
| Content-Type | JSON | multipart/form-data |
| Timing | Same request as product | After ProductId is received |
| API endpoint | POST /api/seller/products | POST /api/seller/products/{id}/images |
| URL storage | Frontend sends URL string | Backend generates URL |
| File upload | Base64 in JSON | Binary in multipart form |

---

## Migration Guide for Existing Products

If the system has existing products with URL-based images, a migration script is required to:

1. Download images from old URL storage
2. Store as binary in `ImageData` column
3. Set appropriate `ContentType` and `OriginalFileName`
4. Update `ProductImage` rows
5. Verify data integrity

This is outside the scope of the backend implementation but should be planned before deploying to production.

---

## Verification Checklist

- [ ] Database schema matches specified table structure
- [ ] ImageURL column removed
- [ ] ImageData column is VARBINARY(MAX), not Base64 string
- [ ] ContentType is stored as MIME type (image/jpeg, etc.)
- [ ] OriginalFileName is stored (not full path)
- [ ] DisplayOrder is unique per ProductId
- [ ] At most one IsPrimary per ProductId
- [ ] Public image endpoint returns binary data with correct Content-Type
- [ ] Catalogue queries do not load ImageData
- [ ] Image URLs are generated, not persisted
- [ ] File validation checks magic bytes
- [ ] Primary image update clears old primary (transaction-safe)
- [ ] Tests pass (27 test cases)
- [ ] Frontend updated to use multipart/form-data
- [ ] HTTP test file runs successfully

---

## Support & Testing

Run SQL verification script to confirm schema integrity:
```sql
-- Testing/Sql/VerifyProductImages.sql
```

Run HTTP tests for all image operations:
```
Testing/Http/SellerProductImages.http
```

Run unit tests:
```bash
dotnet test
```

---

**Generated:** 2024
**Version:** 1.0

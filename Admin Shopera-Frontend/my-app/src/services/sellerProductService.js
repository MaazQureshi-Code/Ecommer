import {
  operationalProductImages,
  operationalProductInfo,
  operationalProducts,
  operationalProductVariants,
  advanceRowVersion,
} from "../data/operationalProductStore";
import { requireAuthenticatedSeller } from "../auth/authSession";
import {
  getAdminCategories,
} from "../api/adminCategoryService";
import {
  getAdminStoreBySellerUserId,
} from "../api/adminStoreService";

const PRODUCT_CONDITIONS = [
  "NEW",
  "USED_LIKE_NEW",
  "USED_GOOD",
  "USED_FAIR",
  "REFURBISHED",
];
const PRODUCT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "OUT_OF_STOCK",
  "DELETED",
];
const VARIANT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "OUT_OF_STOCK",
  "DELETED",
];

const products = operationalProducts;
const variants = operationalProductVariants;
const images = operationalProductImages;
const productInfo = operationalProductInfo;
const replaceRecords = (records, nextRecords) => {
  records.splice(0, records.length, ...nextRecords);
};

const normalizeEnum = (value) =>
  String(value || "").trim().replaceAll("-", "_").replaceAll(" ", "_").toUpperCase();
const clone = (value) => structuredClone(value);

const requireSellerStore = async () => {
  const seller = requireAuthenticatedSeller();
  const store = await getAdminStoreBySellerUserId(seller.userId);
  if (!store) throw new Error("The authenticated seller has no Brand Store.");
  return { seller, store };
};

const requireOwnedProduct = async (productId) => {
  const { seller, store } = await requireSellerStore();
  const product = products.find(
    (record) =>
      Number(record.productId) === Number(productId) &&
      Number(record.storeId) === Number(store.storeId),
  );
  if (!product) throw new Error("Product was not found in your Brand Store.");
  return { seller, store, product };
};

const nextId = (records, key) =>
  records.length ? Math.max(...records.map((record) => Number(record[key]) || 0)) + 1 : 1;

const validateProduct = async (values, current = {}) => {
  const productName = String(values.productName ?? current.productName ?? "").trim();
  if (!productName) throw new Error("Product name is required.");

  const categoryId = Number(values.categoryId ?? current.categoryId);
  const categories = await getAdminCategories();
  if (!categories.some((category) => Number(category.categoryId) === categoryId)) {
    throw new Error("A valid existing category is required.");
  }

  const productCondition = normalizeEnum(
    values.productCondition ?? current.productCondition ?? "NEW",
  );
  if (!PRODUCT_CONDITIONS.includes(productCondition)) {
    throw new Error("Invalid product condition.");
  }

  const conditionDescription = String(
    values.conditionDescription ?? current.conditionDescription ?? "",
  ).trim() || null;
  if (productCondition !== "NEW" && !conditionDescription) {
    throw new Error("A condition description is required for non-new products.");
  }

  const status = normalizeEnum(values.status ?? current.status ?? "DRAFT");
  if (!PRODUCT_STATUSES.includes(status)) throw new Error("Invalid product status.");

  return {
    productName,
    shortDescription: String(values.shortDescription ?? current.shortDescription ?? "").trim(),
    description: String(values.description ?? current.description ?? "").trim(),
    brand: String(values.brand ?? current.brand ?? "").trim(),
    modelNumber: String(values.modelNumber ?? current.modelNumber ?? "").trim(),
    categoryId,
    productCondition,
    conditionDescription,
    status,
  };
};

const validateVariant = (values, current = {}, excludedVariantId = null) => {
  const sku = String(values.sku ?? current.sku ?? "").trim().toUpperCase();
  if (!sku) throw new Error("SKU is required.");
  if (
    variants.some(
      (variant) =>
        Number(variant.variantId) !== Number(excludedVariantId) &&
        String(variant.sku).toUpperCase() === sku,
    )
  ) {
    throw new Error("SKU must be unique.");
  }

  const price = Number(values.price ?? current.price ?? 0);
  const costPrice = Number(values.costPrice ?? current.costPrice ?? 0);
  const stockQuantity = Number(values.stockQuantity ?? current.stockQuantity ?? 0);
  const status = normalizeEnum(values.status ?? current.status ?? "ACTIVE");
  if (!Number.isFinite(price) || price < 0) throw new Error("Price cannot be negative.");
  if (!Number.isFinite(costPrice) || costPrice < 0) throw new Error("Cost price cannot be negative.");
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Stock must be a non-negative whole number.");
  }
  if (!VARIANT_STATUSES.includes(status)) throw new Error("Invalid variant status.");

  return {
    sku,
    variantName: String(values.variantName ?? current.variantName ?? "").trim() || null,
    size: String(values.size ?? current.size ?? "").trim() || null,
    color: String(values.color ?? current.color ?? "").trim() || null,
    storageCapacity:
      String(values.storageCapacity ?? current.storageCapacity ?? "").trim() || null,
    price,
    costPrice,
    stockQuantity,
    status,
  };
};

const createSellerView = async (product) => {
  const { store } = await requireSellerStore();
  const productVariants = variants.filter(
    (variant) => Number(variant.productId) === Number(product.productId),
  );
  const storeOperational =
    store.approvalStatus === "APPROVED" && store.storeStatus === "ACTIVE";
  return {
    ...clone(product),
    store: clone(store),
    variants: clone(productVariants),
    images: clone(
      images
        .filter((image) => Number(image.productId) === Number(product.productId))
        .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder)),
    ),
    productInfo:
      clone(productInfo.find((info) => Number(info.productId) === Number(product.productId))) ||
      null,
    totalStock: productVariants.reduce(
      (total, variant) => total + Number(variant.stockQuantity || 0),
      0,
    ),
    isSaleEnabled:
      product.status === "ACTIVE" &&
      storeOperational &&
      productVariants.some(
        (variant) => variant.status === "ACTIVE" && Number(variant.stockQuantity) > 0,
      ),
    storeOperational,
  };
};

export const getSellerStore = async () => clone((await requireSellerStore()).store);
export const getSellerCategories = async () => clone(await getAdminCategories());

export const getSellerProducts = async () => {
  const { store } = await requireSellerStore();
  return Promise.all(
    products
      .filter((product) => Number(product.storeId) === Number(store.storeId))
      .map(createSellerView),
  );
};

export const getSellerProductById = async (productId) =>
  createSellerView((await requireOwnedProduct(productId)).product);

export const createSellerProduct = async (values) => {
  const { store } = await requireSellerStore();
  const normalized = await validateProduct({ ...values, status: values.status || "DRAFT" });
  const record = {
    productId: nextId(products, "productId"),
    ...normalized,
    storeId: store.storeId,
    createdDate: new Date().toISOString(),
  };
  products.push(record);
  return createSellerView(record);
};

export const updateSellerProduct = async (productId, values) => {
  const { product } = await requireOwnedProduct(productId);
  const normalized = await validateProduct(values, product);
  replaceRecords(
    products,
    products.map((record) =>
      record.productId === product.productId ? { ...record, ...normalized } : record,
    ),
  );
  return getSellerProductById(productId);
};

export const updateSellerProductStatus = async (productId, status) =>
  updateSellerProduct(productId, { status });

export const createSellerVariant = async (productId, values) => {
  await requireOwnedProduct(productId);
  const normalized = validateVariant(values);
  const record = {
    variantId: nextId(variants, "variantId"),
    productId: Number(productId),
    ...normalized,
    createdDate: new Date().toISOString(),
    rowVersion: advanceRowVersion(null),
  };
  variants.push(record);
  return clone(record);
};

export const updateSellerVariant = async (productId, variantId, values) => {
  await requireOwnedProduct(productId);
  const current = variants.find(
    (variant) =>
      Number(variant.variantId) === Number(variantId) &&
      Number(variant.productId) === Number(productId),
  );
  if (!current) throw new Error("Variant was not found for this product.");
  const normalized = validateVariant(values, current, variantId);
  replaceRecords(
    variants,
    variants.map((variant) =>
      variant.variantId === current.variantId
        ? { ...variant, ...normalized, rowVersion: advanceRowVersion(variant.rowVersion) }
        : variant,
    ),
  );
  return clone(variants.find((variant) => variant.variantId === current.variantId));
};

export const updateSellerVariantStock = (productId, variantId, stockQuantity) =>
  updateSellerVariant(productId, variantId, { stockQuantity });
export const updateSellerVariantStatus = (productId, variantId, status) =>
  updateSellerVariant(productId, variantId, { status });

export const addSellerProductImage = async (productId, values) => {
  await requireOwnedProduct(productId);
  const imageUrl = String(values.imageUrl || "").trim();
  if (!imageUrl) throw new Error("Image URL is required.");
  const isPrimary = values.isPrimary === true;
  if (isPrimary) {
    replaceRecords(
      images,
      images.map((image) =>
        Number(image.productId) === Number(productId)
          ? { ...image, isPrimary: false }
          : image,
      ),
    );
  }
  const record = {
    imageId: nextId(images, "imageId"),
    productId: Number(productId),
    imageUrl,
    altText: String(values.altText || "").trim() || null,
    displayOrder: Number(values.displayOrder || 0),
    isPrimary,
    createdDate: new Date().toISOString(),
  };
  images.push(record);
  return clone(record);
};

export const updateSellerProductImage = async (productId, imageId, values) => {
  await requireOwnedProduct(productId);
  const current = images.find(
    (image) =>
      Number(image.imageId) === Number(imageId) &&
      Number(image.productId) === Number(productId),
  );
  if (!current) throw new Error("Product image was not found.");
  const imageUrl = String(values.imageUrl ?? current.imageUrl).trim();
  if (!imageUrl) throw new Error("Image URL is required.");
  const isPrimary = values.isPrimary ?? current.isPrimary;
  replaceRecords(images, images.map((image) => {
    if (Number(image.productId) !== Number(productId)) return image;
    if (isPrimary && image.imageId !== current.imageId) return { ...image, isPrimary: false };
    return image.imageId === current.imageId
      ? {
          ...image,
          imageUrl,
          altText: String(values.altText ?? current.altText ?? "").trim() || null,
          displayOrder: Number(values.displayOrder ?? current.displayOrder ?? 0),
          isPrimary: Boolean(isPrimary),
        }
      : image;
  }));
  return clone(images.find((image) => image.imageId === current.imageId));
};

export const removeSellerProductImage = async (productId, imageId) => {
  await requireOwnedProduct(productId);
  const current = images.find(
    (image) =>
      Number(image.imageId) === Number(imageId) &&
      Number(image.productId) === Number(productId),
  );
  if (!current) throw new Error("Product image was not found.");
  replaceRecords(images, images.filter((image) => image.imageId !== current.imageId));
  if (current.isPrimary) {
    const replacement = images
      .filter((image) => Number(image.productId) === Number(productId))
      .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))[0];
    if (replacement) {
      replaceRecords(
        images,
        images.map((image) =>
          image.imageId === replacement.imageId ? { ...image, isPrimary: true } : image,
        ),
      );
    }
  }
  return { removedImageId: current.imageId };
};

export const updateSellerProductInfo = async (productId, values) => {
  await requireOwnedProduct(productId);
  const index = productInfo.findIndex((info) => Number(info.productId) === Number(productId));
  const current = index >= 0 ? productInfo[index] : {};
  const record = {
    ...current,
    productInfoId: current.productInfoId || nextId(productInfo, "productInfoId"),
    productId: Number(productId),
    ...clone(values),
    updatedDate: new Date().toISOString(),
  };
  replaceRecords(
    productInfo,
    index >= 0
      ? productInfo.map((info, recordIndex) => (recordIndex === index ? record : info))
      : [...productInfo, record],
  );
  return clone(record);
};

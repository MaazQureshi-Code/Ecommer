import { operationalStores } from "../data/operationalStoreStore";
import {
  operationalProductImages,
  operationalProducts,
  operationalProductVariants,
} from "../data/operationalProductStore";

const clone = (value) => structuredClone(value);

export const getBuyerEligibleVariant = (variantId) => {
  const variant = operationalProductVariants.find(
    (record) => Number(record.variantId) === Number(variantId),
  );
  const product = variant
    ? operationalProducts.find(
        (record) => Number(record.productId) === Number(variant.productId),
      )
    : null;
  const store = product
    ? operationalStores.find(
        (record) => Number(record.storeId) === Number(product.storeId),
      )
    : null;
  const eligible =
    product?.status === "ACTIVE" &&
    variant?.status === "ACTIVE" &&
    Number(variant?.stockQuantity) > 0 &&
    store?.approvalStatus === "APPROVED" &&
    store?.storeStatus === "ACTIVE";

  if (!eligible) {
    throw new Error("This product variant is not currently available for sale.");
  }

  const image =
    operationalProductImages
      .filter((record) => Number(record.productId) === Number(product.productId))
      .sort(
        (first, second) =>
          Number(second.isPrimary) - Number(first.isPrimary) ||
          Number(first.displayOrder) - Number(second.displayOrder),
      )[0] || null;

  return clone({
    productId: product.productId,
    variantId: variant.variantId,
    storeId: product.storeId,
    productName: product.productName,
    productCondition: product.productCondition,
    variantName: variant.variantName,
    sku: variant.sku,
    price: Number(variant.price),
    stockQuantity: Number(variant.stockQuantity),
    imageUrl: image?.imageUrl || null,
    storeName: store.storeName,
  });
};

export const getBuyerCatalogProduct = (productId) => {
  const product = operationalProducts.find(
    (record) => Number(record.productId) === Number(productId),
  );
  if (!product) throw new Error("Product was not found.");
  const variants = operationalProductVariants
    .filter((record) => Number(record.productId) === Number(productId))
    .map((record) => {
      try {
        return getBuyerEligibleVariant(record.variantId);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  if (!variants.length) throw new Error("This product is not currently available.");
  return { ...clone(product), variants };
};

export const getBuyerCatalogProducts = () =>
  operationalProducts
    .map((product) => {
      try {
        return getBuyerCatalogProduct(product.productId);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

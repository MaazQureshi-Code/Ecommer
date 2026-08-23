import {
  getBuyerCatalogProduct,
  getBuyerCatalogProducts,
} from "./buyerCatalogService";
import { operationalProductImages } from "../data/operationalProductStore";

const toCard = (product) => {
  const firstVariant = product.variants[0];
  const image = operationalProductImages
    .filter((record) => Number(record.productId) === Number(product.productId))
    .sort(
      (first, second) =>
        Number(second.isPrimary) - Number(first.isPrimary) ||
        Number(first.displayOrder) - Number(second.displayOrder),
    )[0];
  return {
    id: product.productId,
    productId: product.productId,
    variantId: firstVariant.variantId,
    name: product.productName,
    price: firstVariant.price,
    image: image?.imageUrl || null,
    sellerName: firstVariant.storeName,
    rating: "New",
    badge: product.productCondition === "NEW" ? null : product.productCondition,
  };
};

export const getProductById = async (productId) => {
  try {
    const product = getBuyerCatalogProduct(productId);
    const card = toCard(product);
    const images = operationalProductImages
      .filter((record) => Number(record.productId) === Number(product.productId))
      .sort((first, second) => Number(first.displayOrder) - Number(second.displayOrder))
      .map((record) => record.imageUrl);
    return {
      ...card,
      brand: product.brand,
      shortDescription: product.shortDescription,
      description: product.description,
      condition: product.productCondition,
      variants: product.variants,
      images,
      colors: product.variants
        .filter((variant) => variant.variantName)
        .map((variant) => ({
          id: variant.variantId,
          name: variant.variantName,
          value: "#777777",
        })),
      sizes: [{ id: 1, label: "Available variants" }],
      details: [product.description, product.shortDescription].filter(Boolean),
      specifications: [
        { label: "Brand", value: product.brand || "Not specified" },
        { label: "Condition", value: product.productCondition },
      ],
      boxItems: [],
    };
  } catch {
    return null;
  }
};

export const getRelatedProducts = async (productId) =>
  getBuyerCatalogProducts()
    .filter((product) => Number(product.productId) !== Number(productId))
    .slice(0, 4)
    .map(toCard);

export const getHomeProductSections = async () => [
  {
    id: "available-products",
    title: "Available products",
    subtitle: "Products currently available from operational Brand Stores.",
    products: getBuyerCatalogProducts().map(toCard),
  },
];

export const getProductDeliveryInfo = async () => [];
export const getProductTrustInfo = async () => [];

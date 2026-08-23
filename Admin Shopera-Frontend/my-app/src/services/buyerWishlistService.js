import { requireAuthenticatedBuyer } from "../auth/authSession";
import {
  buyerWishlistItemsData,
  buyerWishlistsData,
} from "../data/buyerWorkspaceData";
import { operationalProducts } from "../data/operationalProductStore";
import { addBuyerCartItem } from "./buyerCartService";

const clone = (value) => structuredClone(value);
const nextId = (records, key) =>
  records.length ? Math.max(...records.map((record) => Number(record[key]))) + 1 : 1;

const requireWishlist = () => {
  const buyer = requireAuthenticatedBuyer();
  let wishlist = buyerWishlistsData.find(
    (record) => Number(record.buyerUserId) === Number(buyer.userId),
  );
  if (!wishlist) {
    wishlist = {
      wishlistId: nextId(buyerWishlistsData, "wishlistId"),
      buyerUserId: buyer.userId,
    };
    buyerWishlistsData.push(wishlist);
  }
  return wishlist;
};

export const getBuyerWishlist = async () => {
  const wishlist = requireWishlist();
  return clone(
    buyerWishlistItemsData
      .filter((record) => record.wishlistId === wishlist.wishlistId)
      .map((record) => ({
        ...record,
        product: operationalProducts.find(
          (product) => product.productId === record.productId,
        ),
      })),
  );
};

export const addBuyerWishlistItem = async (productId, variantId = null) => {
  const wishlist = requireWishlist();
  const product = operationalProducts.find(
    (record) => Number(record.productId) === Number(productId),
  );
  if (!product) throw new Error("Product was not found.");
  const duplicate = buyerWishlistItemsData.some(
    (record) =>
      record.wishlistId === wishlist.wishlistId &&
      Number(record.productId) === Number(productId) &&
      Number(record.variantId || 0) === Number(variantId || 0),
  );
  if (!duplicate) {
    buyerWishlistItemsData.push({
      wishlistItemId: nextId(buyerWishlistItemsData, "wishlistItemId"),
      wishlistId: wishlist.wishlistId,
      productId: Number(productId),
      variantId: variantId === null ? null : Number(variantId),
    });
  }
  return getBuyerWishlist();
};

export const removeBuyerWishlistItem = async (wishlistItemId) => {
  const wishlist = requireWishlist();
  const index = buyerWishlistItemsData.findIndex(
    (record) =>
      Number(record.wishlistItemId) === Number(wishlistItemId) &&
      record.wishlistId === wishlist.wishlistId,
  );
  if (index < 0) throw new Error("Wishlist item was not found.");
  buyerWishlistItemsData.splice(index, 1);
  return getBuyerWishlist();
};

export const moveBuyerWishlistItemToCart = async (wishlistItemId) => {
  const wishlist = requireWishlist();
  const item = buyerWishlistItemsData.find(
    (record) =>
      Number(record.wishlistItemId) === Number(wishlistItemId) &&
      record.wishlistId === wishlist.wishlistId,
  );
  if (!item?.variantId) throw new Error("Choose an available variant first.");
  await addBuyerCartItem(item.variantId, 1);
  await removeBuyerWishlistItem(item.wishlistItemId);
};

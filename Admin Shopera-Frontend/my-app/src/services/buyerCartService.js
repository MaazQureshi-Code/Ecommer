import { requireAuthenticatedBuyer } from "../auth/authSession";
import {
  buyerCartItemsData,
  buyerCartsData,
} from "../data/buyerWorkspaceData";
import { getBuyerEligibleVariant } from "./buyerCatalogService";

const clone = (value) => structuredClone(value);
const nextId = (records, key) =>
  records.length ? Math.max(...records.map((record) => Number(record[key]))) + 1 : 1;

const requireActiveCart = () => {
  const buyer = requireAuthenticatedBuyer();
  let cart = buyerCartsData.find(
    (record) =>
      Number(record.buyerUserId) === Number(buyer.userId) &&
      record.status === "ACTIVE",
  );
  if (!cart) {
    cart = {
      cartId: nextId(buyerCartsData, "cartId"),
      buyerUserId: buyer.userId,
      status: "ACTIVE",
    };
    buyerCartsData.push(cart);
  }
  return { buyer, cart };
};

const validateQuantity = (quantity, stockQuantity) => {
  const normalized = Number(quantity);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new Error("Quantity must be a positive whole number.");
  }
  if (normalized > stockQuantity) {
    throw new Error(`Only ${stockQuantity} item(s) are currently available.`);
  }
  return normalized;
};

export const getBuyerCart = async () => {
  const { cart } = requireActiveCart();
  const items = buyerCartItemsData
    .filter((record) => Number(record.cartId) === Number(cart.cartId))
    .map((record) => {
      const product = getBuyerEligibleVariant(record.variantId);
      return {
        cartItemId: record.cartItemId,
        cartId: record.cartId,
        variantId: record.variantId,
        quantity: record.quantity,
        ...product,
        lineTotal: Number((product.price * record.quantity).toFixed(2)),
      };
    });
  return clone({
    ...cart,
    items,
    subtotal: Number(
      items.reduce((total, item) => total + item.lineTotal, 0).toFixed(2),
    ),
  });
};

export const addBuyerCartItem = async (variantId, quantity = 1) => {
  const { cart } = requireActiveCart();
  const product = getBuyerEligibleVariant(variantId);
  const existing = buyerCartItemsData.find(
    (record) =>
      Number(record.cartId) === Number(cart.cartId) &&
      Number(record.variantId) === Number(variantId),
  );
  const nextQuantity = validateQuantity(
    Number(quantity) + Number(existing?.quantity || 0),
    product.stockQuantity,
  );
  if (existing) existing.quantity = nextQuantity;
  else {
    buyerCartItemsData.push({
      cartItemId: nextId(buyerCartItemsData, "cartItemId"),
      cartId: cart.cartId,
      variantId: Number(variantId),
      quantity: nextQuantity,
    });
  }
  return getBuyerCart();
};

export const updateBuyerCartItem = async (cartItemId, quantity) => {
  const { cart } = requireActiveCart();
  const item = buyerCartItemsData.find(
    (record) =>
      Number(record.cartItemId) === Number(cartItemId) &&
      Number(record.cartId) === Number(cart.cartId),
  );
  if (!item) throw new Error("Cart item was not found.");
  const product = getBuyerEligibleVariant(item.variantId);
  item.quantity = validateQuantity(quantity, product.stockQuantity);
  return getBuyerCart();
};

export const removeBuyerCartItem = async (cartItemId) => {
  const { cart } = requireActiveCart();
  const index = buyerCartItemsData.findIndex(
    (record) =>
      Number(record.cartItemId) === Number(cartItemId) &&
      Number(record.cartId) === Number(cart.cartId),
  );
  if (index < 0) throw new Error("Cart item was not found.");
  buyerCartItemsData.splice(index, 1);
  return getBuyerCart();
};

export const clearBuyerCart = async () => {
  const { cart } = requireActiveCart();
  for (let index = buyerCartItemsData.length - 1; index >= 0; index -= 1) {
    if (Number(buyerCartItemsData[index].cartId) === Number(cart.cartId)) {
      buyerCartItemsData.splice(index, 1);
    }
  }
  return getBuyerCart();
};

export const convertBuyerCart = () => {
  const { cart } = requireActiveCart();
  cart.status = "CONVERTED";
  return cart.cartId;
};

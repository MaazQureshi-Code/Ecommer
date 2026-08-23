import { useCallback, useEffect, useMemo, useState } from "react";

import { CartContext } from "./cartContext";
import { getCouponByCode } from "../api/adminCouponService";
import {
  addBuyerCartItem,
  clearBuyerCart,
  getBuyerCart,
  removeBuyerCartItem,
  updateBuyerCartItem,
} from "../services/buyerCartService";
import {
  calculateCouponDiscount,
  getEffectiveCouponStatus,
  normalizeCouponCode,
} from "../utils/couponUtils";

function CartContextProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartError, setCartError] = useState("");

  const refreshCart = useCallback(async () => {
    try {
      setCart(await getBuyerCart());
      setCartError("");
    } catch {
      setCart({ items: [], subtotal: 0 });
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const runCartAction = async (action) => {
    try {
      const result = await action();
      setCart(result);
      setCartError("");
      return { success: true };
    } catch (error) {
      setCartError(error.message);
      return { success: false, message: error.message };
    }
  };

  const addToCart = async (product) => {
    const variantId = product.variantId || product.variants?.[0]?.variantId;
    const result = await runCartAction(() =>
      addBuyerCartItem(variantId, product.quantity || 1),
    );
    if (result.success) setIsCartOpen(true);
    return result;
  };
  const removeFromCart = (cartItemId) =>
    runCartAction(() => removeBuyerCartItem(cartItemId));
  const increaseQuantity = (cartItemId) => {
    const item = cart.items.find((record) => record.cartItemId === cartItemId);
    return runCartAction(() =>
      updateBuyerCartItem(cartItemId, Number(item?.quantity || 0) + 1),
    );
  };
  const decreaseQuantity = (cartItemId) => {
    const item = cart.items.find((record) => record.cartItemId === cartItemId);
    return item?.quantity === 1
      ? removeFromCart(cartItemId)
      : runCartAction(() =>
          updateBuyerCartItem(cartItemId, Number(item?.quantity || 0) - 1),
        );
  };

  const subtotal = Number(cart.subtotal || 0);
  const discount = useMemo(
    () =>
      appliedCoupon ? calculateCouponDiscount(appliedCoupon, subtotal) : 0,
    [appliedCoupon, subtotal],
  );

  const applyCoupon = async (couponCode) => {
    const normalizedCode = normalizeCouponCode(couponCode);
    const coupon = normalizedCode ? getCouponByCode(normalizedCode) : null;
    if (!coupon) return { success: false, message: "That promo code is not valid." };
    if (getEffectiveCouponStatus(coupon) !== "ACTIVE") {
      return { success: false, message: "That promo code is expired or disabled." };
    }
    if (subtotal < Number(coupon.minPurchaseAmount || 0)) {
      return { success: false, message: "The minimum purchase amount is not met." };
    }
    setAppliedCoupon(coupon);
    return { success: true, message: `${coupon.couponCode} was applied.` };
  };

  const value = {
    cartItems: cart.items,
    cartCount: cart.items.reduce(
      (total, item) => total + Number(item.quantity),
      0,
    ),
    subtotal,
    tax: 0,
    discount,
    total: Math.max(subtotal - discount, 0),
    appliedCoupon,
    cartError,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    clearCart: () => runCartAction(clearBuyerCart),
    refreshCart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    applyCoupon,
    removeCoupon: () => setAppliedCoupon(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContextProvider;

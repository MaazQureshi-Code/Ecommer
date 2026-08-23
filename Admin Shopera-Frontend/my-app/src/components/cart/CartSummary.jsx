// src/components/cart/CartSummary.jsx

import { useState } from "react";
import { Link } from "react-router-dom";

import useCart from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

function CartSummary({ cartCount }) {
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const {
    subtotal,
    tax,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    closeCart,
  } = useCart();

  const handleCouponSubmit = async (event) => {
    event.preventDefault();

    const result = await applyCoupon(couponCode);
    setCouponMessage(result.message);

    if (result.success) {
      setCouponCode("");
    }
  };

  const handleCouponRemove = () => {
    removeCoupon();
    setCouponMessage("Promo code removed.");
  };

  return (
    <footer className="cart-summary">
      <div className="cart-summary__row">
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>

      <div className="cart-summary__row">
        <span>Shipping</span>
        <strong>{formatCurrency(tax)}</strong>
      </div>

      {discount > 0 && (
        <div className="cart-summary__row cart-summary__row--discount">
          <span>Discount</span>
          <strong>-{formatCurrency(discount)}</strong>
        </div>
      )}

      <form className="cart-summary__promo-form" onSubmit={handleCouponSubmit}>
        <label className="cart-summary__promo-label" htmlFor="promo-code">
          Promo code
        </label>

        <div className="cart-summary__promo-controls">
          <input
            id="promo-code"
            type="text"
            className="cart-summary__promo-input"
            placeholder="SAVE10"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            disabled={Boolean(appliedCoupon)}
          />

          <button
            type="submit"
            className="cart-summary__promo-button"
            disabled={Boolean(appliedCoupon)}
          >
            Apply
          </button>
        </div>
      </form>

      {appliedCoupon ? (
        <div className="cart-summary__promo-status">
          <span>{appliedCoupon.couponCode} active</span>
          <button
            type="button"
            className="cart-summary__promo-remove"
            onClick={handleCouponRemove}
          >
            Remove
          </button>
        </div>
      ) : (
        <p className="cart-summary__promo-hint">
          Enter an active coupon code.
        </p>
      )}

      {couponMessage && (
        <p className="cart-summary__promo-message">{couponMessage}</p>
      )}

      <Link
        to="/checkout"
        className="cart-summary__checkout"
        onClick={closeCart}
      >
        <span>
          <small>{cartCount} items</small>
          <strong>{formatCurrency(total)}</strong>
        </span>

        <span>Proceed &gt;</span>
      </Link>
    </footer>
  );
}

export default CartSummary;

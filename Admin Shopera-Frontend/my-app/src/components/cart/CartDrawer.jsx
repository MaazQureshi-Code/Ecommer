// src/components/cart/CartDrawer.jsx

import { Link } from "react-router-dom";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import useCart from "../../hooks/useCart";

function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    cartCount,
    closeCart,
    clearCart,
  } = useCart();

  return (
    <>
      <div
        className={`cart-drawer-overlay ${
          isCartOpen ? "cart-drawer-overlay--open" : ""
        }`}
        onClick={closeCart}
      />

      <aside className={`cart-drawer ${isCartOpen ? "cart-drawer--open" : ""}`}>
        <header className="cart-drawer__header">
          <div className="cart-drawer__title">
            <span className="cart-drawer__icon">🛒</span>
            <h2>Your Cart</h2>

            {cartItems.length > 0 && (
              <button
                type="button"
                className="cart-drawer__clear"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            )}
          </div>

          <button
            type="button"
            className="cart-drawer__close"
            onClick={closeCart}
          >
            ×
          </button>
        </header>

        {cartItems.length > 0 ? (
          <>
            <div className="cart-drawer__items">
              {cartItems.map((item) => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </div>

            <CartSummary cartCount={cartCount} />
          </>
        ) : (
          <div className="cart-drawer__empty">
            <div className="cart-drawer__empty-illustration">
              🛒
            </div>

            <h3>Your cart is empty!</h3>

            <Link
              to="/"
              className="cart-drawer__shop-button"
              onClick={closeCart}
            >
              Shop Now
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;

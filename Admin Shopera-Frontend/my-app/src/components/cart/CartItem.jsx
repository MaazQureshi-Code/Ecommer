// src/components/cart/CartItem.jsx

import useCart from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

function CartItem({ item }) {
  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (!item) {
    return null;
  }

  return (
    <article className="cart-item">
      <button
        type="button"
        className="cart-item__remove"
        onClick={() => removeFromCart(item.cartItemId)}
      >
        ×
      </button>

      <div className="cart-item__image-box">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} />
        ) : (
          <div className="cart-item__image-placeholder">Product</div>
        )}
      </div>

      <div className="cart-item__content">
        <h3>{item.productName}</h3>
        <small>{item.variantName}</small>

        <div className="cart-item__bottom">
          <div className="cart-item__quantity">
            <button
              type="button"
              onClick={() => decreaseQuantity(item.cartItemId)}
            >
              −
            </button>

            <span>{item.quantity}</span>

            <button
              type="button"
              onClick={() => increaseQuantity(item.cartItemId)}
            >
              +
            </button>
          </div>

          <strong>
            {formatCurrency(item.price * item.quantity)}
          </strong>
        </div>
      </div>
    </article>
  );
}

export default CartItem;

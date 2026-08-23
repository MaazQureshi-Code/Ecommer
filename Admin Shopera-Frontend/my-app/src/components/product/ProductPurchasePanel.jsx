// src/components/product/ProductPurchasePanel.jsx

import { useState } from "react";

import useCart from "../../hooks/useCart";
import { addBuyerWishlistItem } from "../../services/buyerWishlistService";

function ProductPurchasePanel({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { addToCart } = useCart();

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = async () => {
    const result = await addToCart({
      ...product,
      variantId: product.variantId || product.variants?.[0]?.variantId,
      quantity,
    });
    setMessage(result?.message || (result?.success ? "Added to cart." : ""));
  };

  const handleWishlist = async () => {
    try {
      await addBuyerWishlistItem(
        product.productId || product.id,
        product.variantId || product.variants?.[0]?.variantId || null,
      );
      setMessage("Added to wishlist.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <aside className="product-purchase">
      <div className="product-purchase__quantity-header">
        <h3>Quantity</h3>

        <div className="product-purchase__quantity">
          <button type="button" onClick={decreaseQuantity}>
            -
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={increaseQuantity}>
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        className="product-purchase__cart-button"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>

      <button type="button" className="product-purchase__wishlist-button" onClick={handleWishlist}>
        Add to Wishlist
      </button>
      {message && <p>{message}</p>}

      <div className="product-purchase__viewing">
        People are viewing this right now
        <span>32 people are viewing this product</span>
      </div>
    </aside>
  );
}

export default ProductPurchasePanel;

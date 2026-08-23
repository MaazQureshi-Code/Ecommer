// src/components/product/ProductCard.jsx
 
import { Link } from "react-router-dom";

import useCart from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  if (!product) {
    return null;
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__image-link">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__image-placeholder">Product</div>
        )}
      </Link>

      {product.badge && <span className="product-card__badge">{product.badge}</span>}

      <div className="product-card__content">
        <p className="product-card__seller">{product.sellerName}</p>

        <Link to={`/products/${product.id}`} className="product-card__name">
          {product.name}
        </Link>

        <div className="product-card__rating">&#9733; {product.rating}</div>

        <div className="product-card__price-row">
          <span className="product-card__price">{formatCurrency(product.price)}</span>

          {product.oldPrice && (
            <span className="product-card__old-price">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          className="product-card__button"
          onClick={() => addToCart({ ...product, variantId: product.variantId })}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;

// src/components/product/ProductInfo.jsx

import { formatCurrency } from "../../utils/formatCurrency";

function ProductInfo({ product }) {
  if (!product) {
    return null;
  }

  return (
    <section className="product-info-box">
      <div className="product-info-box__badges">
        {product.badges.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>

      <h1>{product.name}</h1>

      <div className="product-info-box__rating">
        <span>*****</span>
        <strong>{product.rating}</strong>
        <small>({product.reviewCount} reviews)</small>
      </div>

      <div className="product-info-box__price-row">
        <strong>{formatCurrency(product.price)}</strong>

        {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}

        {product.discountText && (
          <span className="product-info-box__discount">
            {product.discountText}
          </span>
        )}
      </div>

      <p className="product-info-box__description">
        {product.shortDescription}
      </p>

      <ul className="product-info-box__features">
        {product.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <div className="product-info-box__options">
        <div>
          <h3>Color</h3>

          <div className="product-info-box__colors">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                title={color.name}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>

        <div>
          <h3>Size</h3>

          <div className="product-info-box__sizes">
            {product.sizes.map((size) => (
              <button key={size.id} type="button">
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="product-info-box__stock">
        {product.stockStatus} | {product.shippingText}
      </p>
    </section>
  );
}

export default ProductInfo;

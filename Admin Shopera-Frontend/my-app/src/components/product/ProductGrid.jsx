// src/components/product/ProductGrid.jsx

import ProductCard from "./ProductCard";

function ProductGrid({ products = [] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
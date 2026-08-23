// src/components/product/RelatedProducts.jsx

import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";

function RelatedProducts({ products = [] }) {
  return (
    <section className="related-products">
      <div className="related-products__header">
        <h2>You may also like</h2>

        <Link to="/collections/trending">See All</Link>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}

export default RelatedProducts;
// src/components/home/ProductSection.jsx

import SectionTitle from "./SectionTitle";
import ProductGrid from "../product/ProductGrid";

function ProductSection({ section }) {
  if (!section) {
    return null;
  }

  return (
    <section className="product-section">
      <div className="container">
        <SectionTitle
          title={section.title}
          subtitle={section.subtitle}
          viewAllLink={section.viewAllLink}
        />

        <ProductGrid products={section.products} />
      </div>
    </section>
  );
}

export default ProductSection;
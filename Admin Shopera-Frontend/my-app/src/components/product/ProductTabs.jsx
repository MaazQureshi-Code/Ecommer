// src/components/product/ProductTabs.jsx

import { useState } from "react";

const tabs = [
  {
    id: "details",
    label: "Product Details",
  },
  {
    id: "specifications",
    label: "Specifications",
  },
  {
    id: "box",
    label: "What's in the Box",
  },
  {
    id: "reviews",
    label: "Reviews",
  },
  {
    id: "qa",
    label: "Q&A",
  },
];

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState("details");

  if (!product) {
    return null;
  }

  return (
    <section className="product-tabs">
      <div className="product-tabs__header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "product-tabs__button--active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="product-tabs__content">
        {activeTab === "details" && (
          <ul>
            {product.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {activeTab === "specifications" && (
          <div className="product-tabs__specs">
            {product.specifications.map((item) => (
              <div key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "box" && (
          <ul>
            {product.boxItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {activeTab === "reviews" && (
          <p>Customer reviews will appear here later.</p>
        )}

        {activeTab === "qa" && (
          <p>Questions and answers will appear here later.</p>
        )}
      </div>
    </section>
  );
}

export default ProductTabs;
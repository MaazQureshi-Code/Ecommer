// src/components/product/ProductSideInfo.jsx

function ProductSideInfo({ title, items = [] }) {
  return (
    <aside className="product-side-card">
      <h3>{title}</h3>

      <div className="product-side-card__list">
        {items.map((item) => (
          <div key={item.id} className="product-side-card__item">
            <span>{item.icon}</span>

            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default ProductSideInfo;
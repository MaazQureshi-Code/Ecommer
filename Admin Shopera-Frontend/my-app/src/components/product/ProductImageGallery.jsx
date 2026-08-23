// src/components/product/ProductImageGallery.jsx

import { useState } from "react";

function ProductImageGallery({ images = [], productName = "", videoUrl = "" }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = images[activeImageIndex];

  return (
    <section className="product-gallery">
      <div className="product-gallery__thumbs">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            className={`product-gallery__thumb ${
              activeImageIndex === index ? "product-gallery__thumb--active" : ""
            }`}
            onClick={() => setActiveImageIndex(index)}
          >
            {image ? (
              <img src={image} alt={`${productName} ${index + 1}`} />
            ) : (
              <span>Img</span>
            )}
          </button>
        ))}

        {videoUrl && (
          <button type="button" className="product-gallery__video-button">
            Play
            <span>Watch Video</span>
          </button>
        )}
      </div>

      <div className="product-gallery__main">
        {activeImage ? (
          <img src={activeImage} alt={productName} />
        ) : (
          <div className="product-gallery__placeholder">
            Product Image
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductImageGallery;

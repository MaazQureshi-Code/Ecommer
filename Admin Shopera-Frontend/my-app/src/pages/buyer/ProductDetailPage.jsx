// src/pages/buyer/ProductDetailPage.jsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductInfo from "../../components/product/ProductInfo";
import ProductPurchasePanel from "../../components/product/ProductPurchasePanel";
import ProductSideInfo from "../../components/product/ProductSideInfo";
import ProductTabs from "../../components/product/ProductTabs";
import RelatedProducts from "../../components/product/RelatedProducts";

import { getNavbarLinks } from "../../services/homeService";
import {
  getProductById,
  getRelatedProducts,
  getProductDeliveryInfo,
  getProductTrustInfo,
} from "../../services/productService";

function ProductDetailPage() {
  const { productId } = useParams();

  const [navbarLinks, setNavbarLinks] = useState([]);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState([]);
  const [trustInfo, setTrustInfo] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const loadProductPage = async () => {
      try {
        setIsLoading(true);
        setIsNotFound(false);

        const [
          links,
          productData,
          relatedData,
          deliveryData,
          trustData,
        ] = await Promise.all([
          getNavbarLinks(),
          getProductById(productId),
          getRelatedProducts(productId),
          getProductDeliveryInfo(),
          getProductTrustInfo(),
        ]);

        setNavbarLinks(links);

        if (!productData) {
          setProduct(null);
          setIsNotFound(true);
          return;
        }

        setProduct(productData);
        setRelatedProducts(relatedData);
        setDeliveryInfo(deliveryData);
        setTrustInfo(trustData);
      } catch (error) {
        console.error("Failed to load product detail page:", error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductPage();
  }, [productId]);

  if (isLoading) {
    return <div className="page-loader">Loading...</div>;
  }

  if (isNotFound) {
    return (
      <>
        <Navbar links={navbarLinks} />

        <main className="product-detail-page">
          <div className="container">
            <div className="product-detail-page__empty">
              <h1>Product not found</h1>
              <p>The product you are looking for does not exist.</p>
              <Link to="/" className="product-detail-page__back">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar links={navbarLinks} />

      <main className="product-detail-page">
        <div className="container">
          <section className="product-detail-page__layout">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              videoUrl={product.videoUrl}
            />

            <ProductInfo product={product} />

            <div className="product-detail-page__right">
              <ProductPurchasePanel product={product} />

              <ProductSideInfo
                title="Delivery & Returns"
                items={deliveryInfo}
              />

              <ProductSideInfo
                title="Trusted by Thousands"
                items={trustInfo}
              />
            </div>

            <ProductTabs product={product} />
            <RelatedProducts products={relatedProducts} />
          </section>
        </div>
      </main>
    </>
  );
}

export default ProductDetailPage;

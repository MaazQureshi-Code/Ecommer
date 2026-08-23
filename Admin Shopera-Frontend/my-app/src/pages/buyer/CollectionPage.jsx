// src/pages/buyer/CollectionPage.jsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import ProductGrid from "../../components/product/ProductGrid";

import { getNavbarLinks } from "../../services/homeService";
import {
  getCollectionBySlug,
  getCollectionProducts,
} from "../../services/collectionService";

function CollectionPage() {
  const { collectionSlug } = useParams();

  const [navbarLinks, setNavbarLinks] = useState([]);
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const loadCollectionPage = async () => {
      try {
        setIsLoading(true);
        setIsNotFound(false);

        const [links, collectionData, collectionProductData] =
          await Promise.all([
            getNavbarLinks(),
            getCollectionBySlug(collectionSlug),
            getCollectionProducts(collectionSlug),
          ]);

        setNavbarLinks(links);

        if (!collectionData) {
          setIsNotFound(true);
          setCollection(null);
          setProducts([]);
          return;
        }

        setCollection(collectionData);
        setProducts(collectionProductData);
      } catch (error) {
        console.error("Failed to load collection page:", error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollectionPage();
  }, [collectionSlug]);

  if (isLoading) {
    return <div className="page-loader">Loading...</div>;
  }

  if (isNotFound) {
    return (
      <>
        <Navbar links={navbarLinks} />

        <main className="collection-page">
          <div className="container">
            <div className="collection-page__empty">
              <h1>Collection not found</h1>
              <p>The collection you are looking for does not exist.</p>

              <Link to="/" className="collection-page__back-link">
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

      <main className="collection-page">
        <section className="collection-page__hero">
          <div className="container">
            <span className="collection-page__label">Collection</span>
            <h1>{collection.title}</h1>
            <p>{collection.subtitle}</p>
          </div>
        </section>

        <section className="collection-page__products">
          <div className="container">
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="collection-page__empty">
                <h2>No products yet</h2>
                <p>Products for this collection will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default CollectionPage;

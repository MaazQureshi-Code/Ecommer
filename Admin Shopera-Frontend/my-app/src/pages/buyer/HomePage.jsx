// src/pages/buyer/HomePage.jsx

import { useEffect, useState } from "react";

import Navbar from "../../components/layout/Navbar";
import CategoryNav from "../../components/home/CategoryNav";
import SellerStories from "../../components/home/SellerStories";
import HeroBanner from "../../components/home/HeroBanner";
import TopBrandsOffers from "../../components/home/TopBrandsOffers";
import ProductSection from "../../components/home/ProductSection";

import {
  getHomeOffers,
  getHeroBanners,
  getNavbarLinks,
  getTopBrands,
} from "../../services/homeService";
import { getHomeCategories, getHomeQuickLinks } from "../../services/categoryservices";
import { getSellerStories } from "../../services/sellerService";
import { getHomeProductSections } from "../../services/productService";

function HomePage() {
  const [homeData, setHomeData] = useState({
    navbarLinks: [],
    categories: [],
    quickLinks: [],
    sellerStories: [],
    heroBanners: [],
    topBrands: [],
    homeOffers: [],
    productSections: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        const [
          navbarLinks,
          categories,
          quickLinks,
          sellerStories,
          heroBanners,
          topBrands,
          homeOffers,
          productSections,
        ] = await Promise.all([
          getNavbarLinks(),
          getHomeCategories(),
          getHomeQuickLinks(),
          getSellerStories(),
          getHeroBanners(),
          getTopBrands(),
          getHomeOffers(),
          getHomeProductSections(),
        ]);

        setHomeData({
          navbarLinks,
          categories,
          quickLinks,
          sellerStories,
          heroBanners,
          topBrands,
          homeOffers,
          productSections,
        });
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  if (isLoading) {
    return <div className="page-loader">Loading...</div>;
  }

  return (
    <>
      <Navbar links={homeData.navbarLinks} />

      <main className="buyer-home-page">
        <CategoryNav
          categories={homeData.categories}
          quickLinks={homeData.quickLinks}
        />

        <SellerStories stories={homeData.sellerStories} />

        <HeroBanner banners={homeData.heroBanners} />

        <TopBrandsOffers
          brands={homeData.topBrands}
          offers={homeData.homeOffers}
        />

        {homeData.productSections.map((section) => (
          <ProductSection key={section.id} section={section} />
        ))}
      </main>
    </>
  );
}

export default HomePage;

// src/data/homeData.js

import { COLLECTION_SLUGS } from "../constants/collections";
import { collectionLinks } from "./collectionData";

export const navbarLinks = collectionLinks;

export const homeCategories = [
  {
    id: 1,
    name: "Mobiles",
    slug: COLLECTION_SLUGS.MOBILE,
    path: `/collections/${COLLECTION_SLUGS.MOBILE}`,
    icon: "MO",
    count: "Phones and accessories",
  },
  {
    id: 2,
    name: "Computers",
    slug: COLLECTION_SLUGS.COMPUTER,
    path: `/collections/${COLLECTION_SLUGS.COMPUTER}`,
    icon: "PC",
    count: "Laptops and parts",
  },
  {
    id: 3,
    name: "Fashion",
    slug: "fashion",
    path: `/collections/${COLLECTION_SLUGS.TRENDING}`,
    icon: "FA",
    count: "Clothing and style",
  },
  {
    id: 4,
    name: "Beauty",
    slug: "beauty",
    path: `/collections/${COLLECTION_SLUGS.TRENDING}`,
    icon: "BE",
    count: "Care and cosmetics",
  },
  {
    id: 5,
    name: "Sports",
    slug: "sports",
    path: `/collections/${COLLECTION_SLUGS.TRENDING}`,
    icon: "SP",
    count: "Fitness and outdoors",
  },
  {
    id: 6,
    name: "Home & Living",
    slug: "home-living",
    path: `/collections/${COLLECTION_SLUGS.NEW_ARRIVALS}`,
    icon: "HL",
    count: "Decor and daily needs",
  },
  {
    id: 7,
    name: "Automotive",
    slug: "automotive",
    path: `/collections/${COLLECTION_SLUGS.OFFERS}`,
    icon: "AU",
    count: "Car care and tools",
  },
  {
    id: 8,
    name: "Books",
    slug: "books",
    path: `/collections/${COLLECTION_SLUGS.BEST_SELLERS}`,
    icon: "BK",
    count: "Reads and learning",
  },
  {
    id: 9,
    name: "Toys & Games",
    slug: "toys-games",
    path: `/collections/${COLLECTION_SLUGS.TRENDING}`,
    icon: "TG",
    count: "Play and hobbies",
  },
  {
    id: 10,
    name: "Pet Supplies",
    slug: "pet-supplies",
    path: `/collections/${COLLECTION_SLUGS.OFFERS}`,
    icon: "PS",
    count: "Care and essentials",
  },
];

export const homeQuickLinks = collectionLinks.slice(0, 4);

export const sellerStories = [
  {
    id: 1,
    sellerName: "Tech Store",
    sellerImage: "",
    videoThumbnail: "",
    videoUrl: "",
  },
  {
    id: 2,
    sellerName: "Fashion Hub",
    sellerImage: "",
    videoThumbnail: "",
    videoUrl: "",
  },
  {
    id: 3,
    sellerName: "Beauty Market",
    sellerImage: "",
    videoThumbnail: "",
    videoUrl: "",
  },
  {
    id: 4,
    sellerName: "Home Style",
    sellerImage: "",
    videoThumbnail: "",
    videoUrl: "",
  },
];

export const heroBanners = [
  {
    id: 1,
    title: "Summer Sale is Live!",
    subtitle: "Up to 50% off on thousands of products",
    image: "",
    buttonText: "Shop Now",
    buttonLink: `/collections/${COLLECTION_SLUGS.OFFERS}`,
  },
];

export const topBrands = [
  {
    id: 1,
    name: "Apple",
    mark: "apple",
    path: `/collections/${COLLECTION_SLUGS.TOP_BRANDS}`,
  },
  {
    id: 2,
    name: "Samsung",
    mark: "SAMSUNG",
    path: `/collections/${COLLECTION_SLUGS.TOP_BRANDS}`,
  },
  {
    id: 3,
    name: "Sony",
    mark: "SONY",
    path: `/collections/${COLLECTION_SLUGS.TOP_BRANDS}`,
  },
  {
    id: 4,
    name: "Nike",
    mark: "nike",
    path: `/collections/${COLLECTION_SLUGS.TOP_BRANDS}`,
  },
  {
    id: 5,
    name: "Adidas",
    mark: "adidas",
    path: `/collections/${COLLECTION_SLUGS.TOP_BRANDS}`,
  },
  {
    id: 6,
    name: "Huawei",
    mark: "huawei",
    path: `/collections/${COLLECTION_SLUGS.TOP_BRANDS}`,
  },
];

export const homeOffers = [
  {
    id: 1,
    title: "20% DISCOUNT",
    subtitle: "Selected Products",
    icon: "tag",
    path: `/collections/${COLLECTION_SLUGS.OFFERS}`,
  },
  {
    id: 2,
    title: "FREE SHIPPING",
    subtitle: "$100 and up",
    icon: "truck",
    path: `/collections/${COLLECTION_SLUGS.OFFERS}`,
  },
  {
    id: 3,
    title: "GET 2 BUY 1",
    subtitle: "Don't miss the offer",
    icon: "gift",
    path: `/collections/${COLLECTION_SLUGS.OFFERS}`,
  },
];

export const homeProductSections = [
  {
    id: 1,
    title: "Best Sellers",
    subtitle: "Popular products customers love",
    viewAllLink: `/collections/${COLLECTION_SLUGS.BEST_SELLERS}`,
    products: [
      {
        id: 101,
        name: "Wireless Headphones",
        price: 49.99,
        oldPrice: 69.99,
        image: "",
        rating: 4.8,
        sellerName: "Tech Store",
        badge: "Best Seller",
      },
      {
        id: 102,
        name: "Smart Watch",
        price: 89.99,
        oldPrice: 119.99,
        image: "",
        rating: 4.6,
        sellerName: "Gadget Zone",
        badge: "Hot",
      },
      {
        id: 103,
        name: "Casual Sneakers",
        price: 39.99,
        oldPrice: 55,
        image: "",
        rating: 4.7,
        sellerName: "Fashion Hub",
        badge: "Popular",
      },
      {
        id: 104,
        name: "Backpack",
        price: 24.99,
        oldPrice: 34.99,
        image: "",
        rating: 4.5,
        sellerName: "Daily Store",
        badge: "Deal",
      },
    ],
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Fresh products recently added",
    viewAllLink: `/collections/${COLLECTION_SLUGS.NEW_ARRIVALS}`,
    products: [
      {
        id: 201,
        name: "Modern Desk Lamp",
        price: 29.99,
        oldPrice: null,
        image: "",
        rating: 4.4,
        sellerName: "Home Style",
        badge: "New",
      },
      {
        id: 202,
        name: "Women Handbag",
        price: 59.99,
        oldPrice: 79.99,
        image: "",
        rating: 4.6,
        sellerName: "Fashion Hub",
        badge: "New",
      },
      {
        id: 203,
        name: "Gaming Mouse",
        price: 19.99,
        oldPrice: 29.99,
        image: "",
        rating: 4.9,
        sellerName: "Tech Store",
        badge: "New",
      },
      {
        id: 204,
        name: "Skin Care Set",
        price: 44.99,
        oldPrice: null,
        image: "",
        rating: 4.7,
        sellerName: "Beauty Market",
        badge: "New",
      },
    ],
  },
];

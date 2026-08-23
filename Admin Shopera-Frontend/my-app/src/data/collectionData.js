// src/data/collectionData.js

import { COLLECTION_SLUGS } from "../constants/collections";

export const collectionLinks = [
  {
    id: 1,
    label: "Best Sellers",
    slug: COLLECTION_SLUGS.BEST_SELLERS,
    path: `/collections/${COLLECTION_SLUGS.BEST_SELLERS}`,
  },
  {
    id: 2,
    label: "New Arrivals",
    slug: COLLECTION_SLUGS.NEW_ARRIVALS,
    path: `/collections/${COLLECTION_SLUGS.NEW_ARRIVALS}`,
  },
  {
    id: 3,
    label: "Offers",
    slug: COLLECTION_SLUGS.OFFERS,
    path: `/collections/${COLLECTION_SLUGS.OFFERS}`,
  },
  {
    id: 4,
    label: "Trending",
    slug: COLLECTION_SLUGS.TRENDING,
    path: `/collections/${COLLECTION_SLUGS.TRENDING}`,
  },
  {
    id: 5,
    label: "Top Brands",
    slug: COLLECTION_SLUGS.TOP_BRANDS,
    path: `/collections/${COLLECTION_SLUGS.TOP_BRANDS}`,
  },
  {
    id: 6,
    label: "Mobile",
    slug: COLLECTION_SLUGS.MOBILE,
    path: `/collections/${COLLECTION_SLUGS.MOBILE}`,
  },
  {
    id: 7,
    label: "Computer",
    slug: COLLECTION_SLUGS.COMPUTER,
    path: `/collections/${COLLECTION_SLUGS.COMPUTER}`,
  },
];

export const collectionDetails = [
  {
    slug: COLLECTION_SLUGS.BEST_SELLERS,
    title: "Best Sellers",
    subtitle: "Most popular products loved by customers.",
  },
  {
    slug: COLLECTION_SLUGS.NEW_ARRIVALS,
    title: "New Arrivals",
    subtitle: "Fresh products recently added by sellers.",
  },
  {
    slug: COLLECTION_SLUGS.OFFERS,
    title: "Offers",
    subtitle: "Discounts, deals, and limited-time promotions.",
  },
  {
    slug: COLLECTION_SLUGS.TRENDING,
    title: "Trending",
    subtitle: "Products currently getting high attention.",
  },
  {
    slug: COLLECTION_SLUGS.TOP_BRANDS,
    title: "Top Brands",
    subtitle: "Products from trusted and popular brands.",
  },
  {
    slug: COLLECTION_SLUGS.MOBILE,
    title: "Mobile",
    subtitle: "Phones, accessories, and mobile-related products.",
  },
  {
    slug: COLLECTION_SLUGS.COMPUTER,
    title: "Computer",
    subtitle: "Laptops, desktops, parts, and accessories.",
  },
];

export const collectionProducts = {
  [COLLECTION_SLUGS.BEST_SELLERS]: [
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
  ],

  [COLLECTION_SLUGS.NEW_ARRIVALS]: [
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
  ],

  [COLLECTION_SLUGS.OFFERS]: [
    {
      id: 301,
      name: "Gaming Mouse",
      price: 19.99,
      oldPrice: 29.99,
      image: "",
      rating: 4.9,
      sellerName: "Tech Store",
      badge: "Offer",
    },
    {
      id: 302,
      name: "Backpack",
      price: 24.99,
      oldPrice: 34.99,
      image: "",
      rating: 4.5,
      sellerName: "Daily Store",
      badge: "Deal",
    },
  ],

  [COLLECTION_SLUGS.TRENDING]: [
    {
      id: 401,
      name: "Skin Care Set",
      price: 44.99,
      oldPrice: null,
      image: "",
      rating: 4.7,
      sellerName: "Beauty Market",
      badge: "Trending",
    },
  ],

  [COLLECTION_SLUGS.TOP_BRANDS]: [
    {
      id: 501,
      name: "Premium Laptop",
      price: 899.99,
      oldPrice: 1099.99,
      image: "",
      rating: 4.8,
      sellerName: "Top Brand Store",
      badge: "Top Brand",
    },
  ],

  [COLLECTION_SLUGS.MOBILE]: [
    {
      id: 601,
      name: "Smartphone",
      price: 399.99,
      oldPrice: 459.99,
      image: "",
      rating: 4.6,
      sellerName: "Mobile Center",
      badge: "Mobile",
    },
  ],

  [COLLECTION_SLUGS.COMPUTER]: [
    {
      id: 701,
      name: "Computer Keyboard",
      price: 34.99,
      oldPrice: 49.99,
      image: "",
      rating: 4.5,
      sellerName: "Computer World",
      badge: "Computer",
    },
  ],
};
// src/data/productDetailData.js

export const productDetails = [
  {
    id: 101,
    name: "Smart Watch Series 9",
    brand: "Shopera",
    price: 99.99,
    oldPrice: 199.99,
    discountText: "-20%",
    rating: 4.8,
    reviewCount: 97,
    badges: ["Bestseller", "20% OFF"],
    shortDescription:
      "The most powerful chip in a smartwatch. A magical new way to interact with your watch without touching the screen.",
    stockStatus: "In Stock",
    shippingText: "Ships in 1-2 business days",
    images: ["", "", "", "", ""],
    videoUrl: "",
    features: [
      "GPS + Cellular",
      "40 mm Aluminum Case",
      "Always-On Retina Display",
      "Water Resistant 50m",
      "Sport Band",
    ],
    colors: [
      { id: 1, name: "Midnight", value: "#1e2a5a" },
      { id: 2, name: "Cream", value: "#ead7bf" },
      { id: 3, name: "Silver", value: "#c9c9c9" },
      { id: 4, name: "Black", value: "#000000" },
      { id: 5, name: "Red", value: "#f26457" },
    ],
    sizes: [
      { id: 1, label: "40 mm" },
      { id: 2, label: "44 mm" },
    ],
    details: [
      "Advanced health features, a powerful chip and a magical new way to interact with your watch.",
      "Double tap gesture to do with one hand.",
      "Advanced health sensors for ECG, Blood Oxygen and Heart Rate.",
      "Sleep tracking and sleep stages.",
      "Crash Detection and Fall Detection.",
      "Works with most smart features.",
      "Works with iPhone.",
    ],
    specifications: [
      { label: "Display", value: "Always-On Retina Display" },
      { label: "Case Size", value: "40 mm / 44 mm" },
      { label: "Connectivity", value: "GPS + Cellular" },
      { label: "Water Resistance", value: "50m" },
    ],
    boxItems: [
      "Smart Watch Series 9",
      "Sport Band",
      "Magnetic charging cable",
      "User guide",
    ],
  },
];

export const relatedProducts = [
  {
    id: 102,
    name: "iPhone 15 Pro",
    price: 799.99,
    oldPrice: 899.99,
    image: "",
    rating: 4.9,
    sellerName: "Tech Store",
    badge: "New",
  },
  {
    id: 103,
    name: "AirPods Max",
    price: 179.99,
    oldPrice: 199.99,
    image: "",
    rating: 4.7,
    sellerName: "Audio Store",
    badge: "Hot",
  },
  {
    id: 104,
    name: "Canon EOS R50",
    price: 750.99,
    oldPrice: 899.99,
    image: "",
    rating: 4.6,
    sellerName: "Camera Store",
    badge: "Deal",
  },
  {
    id: 105,
    name: "Samsung Tab 6",
    price: 299.99,
    oldPrice: 399.99,
    image: "",
    rating: 4.5,
    sellerName: "Gadget Zone",
    badge: "Popular",
  },
];

export const productDeliveryInfo = [
  {
    id: 1,
    title: "Free Shipping",
    description: "On orders over $50",
    icon: "Ship",
  },
  {
    id: 2,
    title: "Estimated Delivery",
    description: "May 18 - May 19",
    icon: "Box",
  },
  {
    id: 3,
    title: "Easy returns & refunds",
    description: "30-Day Returns",
    icon: "Back",
  },
];

export const productTrustInfo = [
  {
    id: 1,
    title: "10.000+",
    description: "Happy Customers",
    icon: "Fans",
  },
  {
    id: 2,
    title: "4.8/5",
    description: "Average Rating",
    icon: "Star",
  },
  {
    id: 3,
    title: "30 Days",
    description: "Easy Returns",
    icon: "Back",
  },
  {
    id: 4,
    title: "100%",
    description: "Secure Payments",
    icon: "Safe",
  },
];

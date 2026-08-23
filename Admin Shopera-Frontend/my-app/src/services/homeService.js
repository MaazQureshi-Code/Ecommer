// src/api/homeService.js

import { heroBanners, homeOffers, navbarLinks, topBrands } from "../data/homeData";

export const getNavbarLinks = async () => {
  return navbarLinks;
};

export const getHeroBanners = async () => {
  return heroBanners;
};

export const getTopBrands = async () => {
  return topBrands;
};

export const getHomeOffers = async () => {
  return homeOffers;
};

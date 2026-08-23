// src/api/categoryService.js

import { homeCategories, homeQuickLinks } from "../data/homeData";

export const getHomeCategories = async () => {
  return homeCategories;
};

export const getHomeQuickLinks = async () => {
  return homeQuickLinks;
};
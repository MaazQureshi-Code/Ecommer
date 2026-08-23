// src/api/collectionService.js

import {
  collectionDetails,
  collectionProducts,
} from "../data/collectionData";

export const getCollectionBySlug = async (collectionSlug) => {
  const collection = collectionDetails.find(
    (item) => item.slug === collectionSlug
  );

  return collection || null;
};

export const getCollectionProducts = async (collectionSlug) => {
  return collectionProducts[collectionSlug] || [];
};
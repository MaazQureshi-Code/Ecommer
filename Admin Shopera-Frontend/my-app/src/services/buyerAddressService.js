import { requireAuthenticatedBuyer } from "../auth/authSession";
import { buyerAddressesData } from "../data/buyerWorkspaceData";

const clone = (value) => structuredClone(value);
const nextId = () =>
  buyerAddressesData.length
    ? Math.max(...buyerAddressesData.map((record) => record.buyerAddressId)) + 1
    : 1;

export const validateBuyerAddress = (values) => {
  const fields = [
    "recipientName",
    "recipientPhone",
    "streetAddress",
    "city",
    "stateProvince",
    "postalCode",
    "country",
  ];
  const result = Object.fromEntries(
    fields.map((field) => [field, String(values[field] || "").trim()]),
  );
  if (fields.some((field) => !result[field])) {
    throw new Error("All address fields are required.");
  }
  return result;
};

export const getBuyerAddresses = async () => {
  const buyer = requireAuthenticatedBuyer();
  return clone(
    buyerAddressesData.filter(
      (record) => Number(record.buyerUserId) === Number(buyer.userId),
    ),
  );
};

export const getBuyerAddressById = async (buyerAddressId) => {
  const buyer = requireAuthenticatedBuyer();
  const address = buyerAddressesData.find(
    (record) =>
      Number(record.buyerAddressId) === Number(buyerAddressId) &&
      Number(record.buyerUserId) === Number(buyer.userId),
  );
  if (!address) throw new Error("Address was not found.");
  return clone(address);
};

export const createBuyerAddress = async (values) => {
  const buyer = requireAuthenticatedBuyer();
  const record = {
    buyerAddressId: nextId(),
    buyerUserId: buyer.userId,
    ...validateBuyerAddress(values),
  };
  buyerAddressesData.push(record);
  return clone(record);
};

export const updateBuyerAddress = async (buyerAddressId, values) => {
  const current = await getBuyerAddressById(buyerAddressId);
  const index = buyerAddressesData.findIndex(
    (record) => record.buyerAddressId === current.buyerAddressId,
  );
  buyerAddressesData[index] = {
    ...current,
    ...validateBuyerAddress(values),
  };
  return clone(buyerAddressesData[index]);
};

export const removeBuyerAddress = async (buyerAddressId) => {
  const current = await getBuyerAddressById(buyerAddressId);
  const index = buyerAddressesData.findIndex(
    (record) => record.buyerAddressId === current.buyerAddressId,
  );
  buyerAddressesData.splice(index, 1);
};

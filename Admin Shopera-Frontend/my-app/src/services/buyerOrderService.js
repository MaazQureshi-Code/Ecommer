import { requireAuthenticatedBuyer } from "../auth/authSession";
import { operationalStores } from "../data/operationalStoreStore";
import {
  operationalOrderAddresses,
  operationalOrderItems,
  operationalOrders,
  operationalOrderStatusHistory,
  operationalPayments,
  operationalShipments,
} from "../data/operationalOrderStore";

const clone = (value) => structuredClone(value);
const byDate = (first, second) =>
  (Date.parse(second.orderDate) || 0) - (Date.parse(first.orderDate) || 0);

const requireOwnedOrder = (orderId) => {
  const buyer = requireAuthenticatedBuyer();
  const order = operationalOrders.find(
    (record) =>
      Number(record.orderId) === Number(orderId) &&
      Number(record.buyerUserId) === Number(buyer.userId),
  );
  if (!order) throw new Error("Order was not found.");
  return order;
};

const summary = (order) => {
  const store = operationalStores.find(
    (record) => Number(record.storeId) === Number(order.storeId),
  );
  const payments = operationalPayments.filter(
    (record) => Number(record.orderId) === Number(order.orderId),
  );
  const shipments = operationalShipments.filter(
    (record) => Number(record.orderId) === Number(order.orderId),
  );
  return {
    ...clone(order),
    storeName: store?.storeName || `Store #${order.storeId}`,
    paymentStatus: payments.at(-1)?.paymentStatus || "NO_PAYMENT",
    shipmentStatus: shipments.at(-1)?.shipmentStatus || "NO_SHIPMENT",
    itemCount: operationalOrderItems
      .filter((record) => Number(record.orderId) === Number(order.orderId))
      .reduce((total, item) => total + Number(item.quantity), 0),
  };
};

export const getBuyerOrders = async () => {
  const buyer = requireAuthenticatedBuyer();
  return operationalOrders
    .filter((record) => Number(record.buyerUserId) === Number(buyer.userId))
    .map(summary)
    .sort(byDate);
};

export const getBuyerOrderById = async (orderId) => {
  const order = requireOwnedOrder(orderId);
  const owned = (records) =>
    clone(
      records.filter(
        (record) => Number(record.orderId) === Number(order.orderId),
      ),
    );
  return {
    ...summary(order),
    items: owned(operationalOrderItems).map(
      ({
        unitCostAtPurchase: _unitCostAtPurchase,
        ...buyerSafeItem
      }) => buyerSafeItem,
    ),
    addresses: owned(operationalOrderAddresses),
    payments: owned(operationalPayments),
    shipments: owned(operationalShipments),
    statusHistory: owned(operationalOrderStatusHistory).sort(
      (first, second) =>
        (Date.parse(first.changedDate) || 0) -
        (Date.parse(second.changedDate) || 0),
    ),
  };
};

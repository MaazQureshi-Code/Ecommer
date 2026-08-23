import { requireAuthenticatedSeller } from "../auth/authSession";
import { getAdminStoreBySellerUserId } from "../api/adminStoreService";
import {
  getOperationalOrders,
  getOperationalOrderById,
} from "../api/adminOrderService";
import { createNotification } from "../api/adminNotificationService";
import {
  nextOperationalId,
  operationalOrders,
  operationalOrderStatusHistory,
  operationalShipments,
} from "../data/operationalOrderStore";

const ORDER_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

const SHIPMENT_TRANSITIONS = {
  PENDING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["IN_TRANSIT", "DELIVERED", "RETURNED"],
  IN_TRANSIT: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

const clone = (value) => structuredClone(value);

const requireSellerStore = async () => {
  const seller = requireAuthenticatedSeller();
  const store = await getAdminStoreBySellerUserId(seller.userId);
  if (!store) throw new Error("The authenticated seller has no Brand Store.");
  return { seller, store };
};

const applyOverrides = (order) => {
  return clone(order);
};

const requireOwnedOrder = async (orderId) => {
  const { seller, store } = await requireSellerStore();
  const order = await getOperationalOrderById(orderId);
  if (Number(order.storeId) !== Number(store.storeId)) {
    throw new Error("Order was not found for your Brand Store.");
  }
  return { seller, store, order: applyOverrides(order) };
};

const notifyBuyer = async (order, seller, notificationType, message) => {
  await createNotification({
    recipientUserId: order.buyerUserId,
    actorUserId: seller.userId,
    notificationType,
    title: "Order Update",
    message,
    relatedEntityType: "ORDER",
    relatedEntityId: order.orderId,
  });
};

export const getSellerOrders = async () => {
  const { store } = await requireSellerStore();
  const orders = await getOperationalOrders();
  return clone(
    orders
      .filter((order) => Number(order.storeId) === Number(store.storeId))
      .map(applyOverrides),
  );
};

export const getSellerOrderById = async (orderId) =>
  (await requireOwnedOrder(orderId)).order;

export const getSellerOrderTransitions = (status) =>
  [...(ORDER_TRANSITIONS[status] || [])];

export const getSellerShipmentTransitions = (status) =>
  [...(SHIPMENT_TRANSITIONS[status] || [])];

export const updateSellerOrderStatus = async (
  orderId,
  nextStatus,
  changeNote = "",
) => {
  const { seller, order } = await requireOwnedOrder(orderId);
  const allowed = getSellerOrderTransitions(order.orderStatus);
  if (!allowed.includes(nextStatus)) {
    throw new Error(`Invalid order transition from ${order.orderStatus} to ${nextStatus}.`);
  }
  const operationalOrder = operationalOrders.find(
    (record) => Number(record.orderId) === Number(order.orderId),
  );
  operationalOrder.orderStatus = nextStatus;
  operationalOrderStatusHistory.push({
    orderStatusHistoryId: nextOperationalId(
      operationalOrderStatusHistory,
      "orderStatusHistoryId",
    ),
    orderId: order.orderId,
    oldStatus: order.orderStatus,
    newStatus: nextStatus,
    changedByUserId: seller.userId,
    changedDate: new Date().toISOString(),
    changeNote:
      String(changeNote || "").trim() ||
      `Brand Store changed order status to ${nextStatus}.`,
  });
  await notifyBuyer(
    order,
    seller,
    "ORDER_STATUS_CHANGED",
    `${order.orderNumber || `Order #${order.orderId}`} is now ${nextStatus}.`,
  );
  return getSellerOrderById(orderId);
};

export const updateSellerShipmentStatus = async (
  orderId,
  shipmentId,
  nextStatus,
) => {
  const { seller, order } = await requireOwnedOrder(orderId);
  const shipment = order.shipments.find(
    (record) => Number(record.shipmentId) === Number(shipmentId),
  );
  if (!shipment) throw new Error("Shipment was not found for this order.");
  const allowed = getSellerShipmentTransitions(shipment.shipmentStatus);
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid shipment transition from ${shipment.shipmentStatus} to ${nextStatus}.`,
    );
  }
  const operationalShipment = operationalShipments.find(
    (record) => Number(record.shipmentId) === Number(shipment.shipmentId),
  );
  operationalShipment.shipmentStatus = nextStatus;
  await notifyBuyer(
    order,
    seller,
    "SHIPMENT_STATUS_CHANGED",
    `${order.orderNumber || `Order #${order.orderId}`} shipment is now ${nextStatus}.`,
  );
  return getSellerOrderById(orderId);
};

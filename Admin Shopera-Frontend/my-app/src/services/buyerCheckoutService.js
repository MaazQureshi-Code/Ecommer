import { requireAuthenticatedBuyer } from "../auth/authSession";
import { getCouponByCode } from "../api/adminCouponService";
import {
  operationalOrderAddresses,
  operationalOrderItems,
  operationalOrders,
  operationalOrderStatusHistory,
  operationalPayments,
  operationalShipments,
  generateOrderNumber,
  nextOperationalId,
} from "../data/operationalOrderStore";
import {
  advanceRowVersion,
  operationalProductVariants,
} from "../data/operationalProductStore";
import {
  calculateCouponDiscount,
  getEffectiveCouponStatus,
} from "../utils/couponUtils";
import { getBuyerAddressById } from "./buyerAddressService";
import { convertBuyerCart, getBuyerCart } from "./buyerCartService";

const PAYMENT_METHODS = ["CARD", "CASH_ON_DELIVERY", "BANK_TRANSFER"];
const TEMPORARY_SHIPPING_AMOUNT = 0;
const FALLBACK_CURRENCY_CODE = "USD";
let checkoutInProgress = false;

const money = (value) => Number(Number(value).toFixed(2));

export const createBuyerCheckout = async ({
  shippingAddressId,
  billingAddressId,
  paymentMethod,
  coupon = null,
}) => {
  const buyer = requireAuthenticatedBuyer();
  if (checkoutInProgress) throw new Error("Checkout is already processing.");
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error("Choose a supported payment method.");
  }
  checkoutInProgress = true;

  try {
    const [shippingAddress, billingAddress, cart] = await Promise.all([
      getBuyerAddressById(shippingAddressId),
      getBuyerAddressById(billingAddressId || shippingAddressId),
      getBuyerCart(),
    ]);
    if (!cart.items.length) throw new Error("Your cart is empty.");

    const grouped = Object.values(
      cart.items.reduce((groups, item) => {
        groups[item.storeId] ||= [];
        groups[item.storeId].push(item);
        return groups;
      }, {}),
    );
    const cartSubtotal = money(
      cart.items.reduce((total, item) => total + item.lineTotal, 0),
    );
    const resolvedCoupon = coupon?.couponCode
      ? getCouponByCode(coupon.couponCode)
      : null;
    const validCoupon =
      resolvedCoupon &&
      getEffectiveCouponStatus(resolvedCoupon) === "ACTIVE" &&
      cartSubtotal >= Number(resolvedCoupon.minPurchaseAmount || 0)
        ? resolvedCoupon
        : null;
    const totalDiscount = validCoupon
      ? calculateCouponDiscount(validCoupon, cartSubtotal)
      : 0;
    let assignedDiscount = 0;
    const createdOrders = [];
    const now = new Date();

    grouped.forEach((items, groupIndex) => {
      items.forEach((item) => {
        const variant = operationalProductVariants.find(
          (record) => Number(record.variantId) === Number(item.variantId),
        );
        if (
          !variant ||
          variant.status !== "ACTIVE" ||
          Number(variant.stockQuantity) < Number(item.quantity)
        ) {
          throw new Error(`${item.productName} no longer has sufficient stock.`);
        }
      });

      const orderId = nextOperationalId(operationalOrders, "orderId");
      const subtotalAmount = money(
        items.reduce((total, item) => total + item.lineTotal, 0),
      );
      const discountAmount =
        groupIndex === grouped.length - 1
          ? money(totalDiscount - assignedDiscount)
          : money(totalDiscount * (subtotalAmount / cartSubtotal));
      assignedDiscount = money(assignedDiscount + discountAmount);
      const shippingAmount = TEMPORARY_SHIPPING_AMOUNT;
      const totalAmount = money(
        Math.max(subtotalAmount - discountAmount + shippingAmount, 0),
      );
      const orderDate = new Date(now.getTime() + groupIndex).toISOString();
      const order = {
        orderId,
        orderNumber: generateOrderNumber(orderId, now),
        buyerUserId: buyer.userId,
        storeId: items[0].storeId,
        couponId: validCoupon?.couponId || null,
        orderDate,
        orderStatus: "PENDING",
        subtotalAmount,
        discountAmount,
        shippingAmount,
        totalAmount,
        currencyCode: FALLBACK_CURRENCY_CODE,
      };
      operationalOrders.push(order);

      items.forEach((item) => {
        const variant = operationalProductVariants.find(
          (record) => Number(record.variantId) === Number(item.variantId),
        );
        operationalOrderItems.push({
          orderItemId: nextOperationalId(operationalOrderItems, "orderItemId"),
          orderId,
          variantId: variant.variantId,
          productNameAtPurchase: item.productName,
          skuAtPurchase: variant.sku,
          variantNameAtPurchase: variant.variantName,
          quantity: item.quantity,
          unitPriceAtPurchase: Number(variant.price),
          unitCostAtPurchase: Number(variant.costPrice),
        });
        variant.stockQuantity -= item.quantity;
        variant.rowVersion = advanceRowVersion(variant.rowVersion);
        if (variant.stockQuantity === 0) variant.status = "OUT_OF_STOCK";
      });

      [shippingAddress, billingAddress].forEach((address, addressIndex) => {
        operationalOrderAddresses.push({
          orderAddressId: nextOperationalId(
            operationalOrderAddresses,
            "orderAddressId",
          ),
          orderId,
          addressType: addressIndex === 0 ? "SHIPPING" : "BILLING",
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhone,
          streetAddress: address.streetAddress,
          city: address.city,
          stateProvince: address.stateProvince,
          postalCode: address.postalCode,
          country: address.country,
        });
      });
      operationalPayments.push({
        paymentId: nextOperationalId(operationalPayments, "paymentId"),
        orderId,
        createdDate: orderDate,
        paymentDate: null,
        amount: totalAmount,
        paymentMethod,
        paymentStatus: "PENDING",
        transactionReference: null,
      });
      operationalShipments.push({
        shipmentId: nextOperationalId(operationalShipments, "shipmentId"),
        orderId,
        courierName: null,
        trackingNumber: null,
        shipmentStatus: "PENDING",
        shippedDate: null,
        deliveredDate: null,
        shippingCost: shippingAmount,
      });
      operationalOrderStatusHistory.push({
        orderStatusHistoryId: nextOperationalId(
          operationalOrderStatusHistory,
          "orderStatusHistoryId",
        ),
        orderId,
        oldStatus: null,
        newStatus: "PENDING",
        changedDate: orderDate,
        changedByUserId: buyer.userId,
        changeNote: "Order was created.",
      });
      createdOrders.push(order);
    });

    convertBuyerCart();
    return structuredClone(createdOrders);
  } finally {
    checkoutInProgress = false;
  }
};

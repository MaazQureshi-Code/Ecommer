import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getBuyerOrderById } from "../../services/buyerOrderService";
import { formatCurrency } from "../../utils/formatCurrency";

function BuyerOrderDetailsPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getBuyerOrderById(orderId).then(setOrder).catch((caught) => setError(caught.message)); }, [orderId]);
  if (error) return <div><h1>Order unavailable</h1><p>{error}</p><Link to="/account/orders">Back to orders</Link></div>;
  if (!order) return <p>Loading order…</p>;
  const createdCount = location.state?.createdOrderIds?.length || 0;
  return (
    <div>
      {createdCount > 1 && <p>Your multi-store cart created {createdCount} separate orders.</p>}
      <h1>{order.orderNumber}</h1>
      <p>{order.storeName} · {order.orderStatus}</p>
      <p>Payment: {order.paymentStatus} · Shipment: {order.shipmentStatus}</p>
      <h2>Items</h2>
      <div className="buyer-cards">{order.items.map((item) => (
        <article className="buyer-card" key={item.orderItemId}>
          <strong>{item.productNameAtPurchase}</strong>
          <span>{item.variantNameAtPurchase || "Standard"} · SKU {item.skuAtPurchase}</span>
          <span>{item.quantity} × {formatCurrency(item.unitPriceAtPurchase, order.currencyCode)}</span>
        </article>
      ))}</div>
      <p>Subtotal {formatCurrency(order.subtotalAmount, order.currencyCode)}</p>
      <p>Discount −{formatCurrency(order.discountAmount, order.currencyCode)}</p>
      <p>Shipping {formatCurrency(order.shippingAmount, order.currencyCode)}</p>
      <strong>Total {formatCurrency(order.totalAmount, order.currencyCode)}</strong>
      <h2>Addresses</h2>
      {order.addresses.map((address) => <p key={address.orderAddressId}><strong>{address.addressType}</strong>: {address.recipientName}, {address.streetAddress}, {address.city}, {address.stateProvince} {address.postalCode}, {address.country} · {address.recipientPhone}</p>)}
      <h2>Status history</h2>
      <ol>{order.statusHistory.map((entry) => <li key={entry.orderStatusHistoryId}>{entry.newStatus} — {new Date(entry.changedDate).toLocaleString()} {entry.changeNote && `· ${entry.changeNote}`}</li>)}</ol>
    </div>
  );
}
export default BuyerOrderDetailsPage;

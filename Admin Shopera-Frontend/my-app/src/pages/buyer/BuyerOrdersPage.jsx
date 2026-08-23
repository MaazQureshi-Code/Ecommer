import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBuyerOrders } from "../../services/buyerOrderService";
import { formatCurrency } from "../../utils/formatCurrency";

function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { getBuyerOrders().then(setOrders).catch((caught) => setError(caught.message)); }, []);
  const filtered = useMemo(() => orders.filter((order) =>
    (!status || order.orderStatus === status) &&
    (!query || `${order.orderNumber} ${order.storeName}`.toLowerCase().includes(query.toLowerCase()))
  ), [orders, query, status]);
  return (
    <div>
      <h1>Order history</h1>
      <div className="buyer-filters">
        <input type="search" placeholder="Search order or Brand Store" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{[...new Set(orders.map((order) => order.orderStatus))].map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className="buyer-cards">{filtered.map((order) => (
        <Link className="buyer-card" key={order.orderId} to={`/account/orders/${order.orderId}`}>
          <strong>{order.orderNumber}</strong>
          <span>{order.storeName}</span>
          <span>{order.orderStatus} · Payment {order.paymentStatus} · Shipment {order.shipmentStatus}</span>
          <span>{formatCurrency(order.totalAmount, order.currencyCode)}</span>
        </Link>
      ))}</div>
      {!filtered.length && !error && <p>No matching orders.</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
export default BuyerOrdersPage;

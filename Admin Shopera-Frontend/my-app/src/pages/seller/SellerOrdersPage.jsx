import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import { getSellerOrders } from "../../services/sellerOrderService";

function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getSellerOrders().then(setOrders).catch((reason) => setError(reason.message));
  }, []);
  return (
    <section className="seller-page">
      <h1>Brand Orders</h1>
      {error && <div className="admin-page-notice admin-page-notice-error">{error}</div>}
      <div className="seller-card-list">
        {orders.map((order) => (
          <Link className="seller-record-card" key={order.orderId}
            to={`/seller/orders/${order.orderId}`}>
            <div><strong>{order.orderNumber || `Order #${order.orderId}`}</strong>
              <span>{order.buyerName}</span></div>
            <div><AdminStatusBadge status={order.orderStatus} />
              <span>{order.totalAmount} {order.currencyCode}</span></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
export default SellerOrdersPage;

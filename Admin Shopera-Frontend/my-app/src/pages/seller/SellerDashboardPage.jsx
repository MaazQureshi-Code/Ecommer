import { useEffect, useState } from "react";
import { getSellerProducts, getSellerStore } from "../../services/sellerProductService";
import { getSellerOrders } from "../../services/sellerOrderService";

function SellerDashboardPage() {
  const [data, setData] = useState({ products: [], orders: [], store: null });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getSellerProducts(), getSellerOrders(), getSellerStore()])
      .then(([products, orders, store]) => {
        if (active) setData({ products, orders, store });
      })
      .catch((reason) => active && setError(reason.message));
    return () => {
      active = false;
    };
  }, []);

  const { products, orders, store } = data;
  const metrics = [
    ["Total Products", products.length],
    ["Active Products", products.filter((product) => product.status === "ACTIVE").length],
    ["Draft Products", products.filter((product) => product.status === "DRAFT").length],
    ["Out of Stock", products.filter((product) => product.status === "OUT_OF_STOCK").length],
    ["Sale Enabled", products.filter((product) => product.isSaleEnabled).length],
    ["Units in Stock", products.reduce((total, product) => total + product.totalStock, 0)],
    ["Total Orders", orders.length],
    ["Pending Orders", orders.filter((order) => order.orderStatus === "PENDING").length],
    ["Processing Orders", orders.filter((order) => order.orderStatus === "PROCESSING").length],
    ["Shipped Orders", orders.filter((order) => order.orderStatus === "SHIPPED").length],
    ["Delivered Orders", orders.filter((order) => order.orderStatus === "DELIVERED").length],
  ];

  return (
    <section className="seller-page">
      <h1>Brand Dashboard</h1>
      {error && <div className="admin-page-notice admin-page-notice-error">{error}</div>}
      {store && (
        <div className={store.approvalStatus === "APPROVED" && store.storeStatus === "ACTIVE"
          ? "seller-store-state seller-store-state-ok"
          : "seller-store-state"}>
          <strong>{store.storeName}</strong>
          <span>
            Approval: {store.approvalStatus} · Status: {store.storeStatus}
          </span>
          {!(store.approvalStatus === "APPROVED" && store.storeStatus === "ACTIVE") && (
            <p>Products cannot become sale-enabled until the Brand Store is approved and active.</p>
          )}
        </div>
      )}
      <div className="seller-metric-grid">
        {metrics.map(([label, value]) => (
          <article key={label}><span>{label}</span><strong>{value}</strong></article>
        ))}
      </div>
    </section>
  );
}

export default SellerDashboardPage;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import {
  getSellerOrderById,
  getSellerOrderTransitions,
  getSellerShipmentTransitions,
  updateSellerOrderStatus,
  updateSellerShipmentStatus,
} from "../../services/sellerOrderService";

function SellerOrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getSellerOrderById(orderId).then(setOrder).catch((reason) => setError(reason.message));
  }, [orderId]);

  const changeOrder = async (status) => {
    try { setOrder(await updateSellerOrderStatus(orderId, status)); setError(""); }
    catch (reason) { setError(reason.message); }
  };
  const changeShipment = async (shipmentId, status) => {
    try { setOrder(await updateSellerShipmentStatus(orderId, shipmentId, status)); setError(""); }
    catch (reason) { setError(reason.message); }
  };

  if (!order) return <section className="seller-page"><h1>Order</h1>{error || "Loading..."}</section>;
  return (
    <section className="seller-page">
      <h1>{order.orderNumber || `Order #${order.orderId}`}</h1>
      {error && <div className="admin-page-notice admin-page-notice-error">{error}</div>}
      <div className="seller-store-state"><strong>{order.buyerName}</strong>
        <AdminStatusBadge status={order.orderStatus} /></div>
      <div className="seller-action-row">
        {getSellerOrderTransitions(order.orderStatus).map((status) => (
          <button key={status} onClick={() => changeOrder(status)}>{status}</button>
        ))}
      </div>
      <h2>Purchase-time items</h2>
      <div className="seller-card-list">
        {order.items.map((item) => (
          <article className="seller-record-card" key={item.orderItemId}>
            <div><strong>{item.productNameAtPurchase}</strong>
              <span>{item.variantNameAtPurchase} · {item.skuAtPurchase}</span></div>
            <div><span>Qty {item.quantity}</span>
              <span>Price {item.unitPriceAtPurchase} {order.currencyCode}</span>
              <span>Cost {item.unitCostAtPurchase} {order.currencyCode}</span></div>
          </article>
        ))}
      </div>
      <h2>Shipments</h2>
      {(order.shipments || []).map((shipment) => (
        <div className="seller-store-state" key={shipment.shipmentId}>
          <AdminStatusBadge status={shipment.shipmentStatus} />
          <span>{shipment.courierName || "Courier not assigned"} · {shipment.trackingNumber || "No tracking number"}</span>
          <div className="seller-action-row">
            {getSellerShipmentTransitions(shipment.shipmentStatus).map((status) => (
              <button key={status} onClick={() => changeShipment(shipment.shipmentId, status)}>{status}</button>
            ))}
          </div>
        </div>
      ))}
      <h2>Status history</h2>
      {(order.statusHistory || []).map((history) => (
        <div className="seller-history" key={history.orderStatusHistoryId}>
          <span>{history.oldStatus || "CREATED"} → {history.newStatus}</span>
          <small>{history.changeNote}</small>
        </div>
      ))}
    </section>
  );
}
export default SellerOrderDetailsPage;

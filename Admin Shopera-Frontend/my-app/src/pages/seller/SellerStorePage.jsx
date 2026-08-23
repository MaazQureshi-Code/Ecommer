import { useEffect, useState } from "react";
import { getSellerStore } from "../../services/sellerProductService";

function SellerStorePage() {
  const [store, setStore] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { getSellerStore().then(setStore).catch((reason) => setError(reason.message)); }, []);
  return (
    <section className="seller-page"><h1>Brand Store</h1>
      {error && <div className="admin-page-notice admin-page-notice-error">{error}</div>}
      {store && <div className="seller-store-profile">
        <h2>{store.storeName}</h2><p>{store.storeDescription}</p>
        <dl><dt>Approval</dt><dd>{store.approvalStatus}</dd>
          <dt>Status</dt><dd>{store.storeStatus}</dd>
          <dt>Support email</dt><dd>{store.supportEmail}</dd>
          <dt>Support phone</dt><dd>{store.supportPhone}</dd></dl>
        <p>Approval and operational status are managed by administrators.</p>
      </div>}
    </section>
  );
}
export default SellerStorePage;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import { getSellerProducts } from "../../services/sellerProductService";

function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getSellerProducts().then(setProducts).catch((reason) => setError(reason.message));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter(
      (product) =>
        !query ||
        product.productName.toLowerCase().includes(query) ||
        String(product.productId).includes(query),
    );
  }, [products, search]);

  return (
    <section className="seller-page">
      <div className="seller-page-heading">
        <div><h1>Products</h1><p>Manage products owned by your Brand Store.</p></div>
        <Link className="admin-create-coupon-button" to="/seller/products/new">Create Product</Link>
      </div>
      {error && <div className="admin-page-notice admin-page-notice-error">{error}</div>}
      <input className="seller-search" value={search} onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products..." />
      <div className="seller-card-list">
        {filtered.map((product) => (
          <Link to={`/seller/products/${product.productId}`} key={product.productId}
            className="seller-record-card">
            <div><strong>{product.productName}</strong><span>#{product.productId}</span></div>
            <div><AdminStatusBadge status={product.status} />
              <span>{product.totalStock} units</span>
              <span>{product.isSaleEnabled ? "Sale enabled" : "Sale disabled"}</span></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default SellerProductsPage;

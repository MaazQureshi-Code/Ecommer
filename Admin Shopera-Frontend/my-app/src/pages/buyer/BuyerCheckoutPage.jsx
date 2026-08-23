import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import useCart from "../../hooks/useCart";
import { getBuyerAddresses } from "../../services/buyerAddressService";
import { createBuyerCheckout } from "../../services/buyerCheckoutService";
import { formatCurrency } from "../../utils/formatCurrency";
import "../../styles/buyer/buyerWorkspace.css";

function BuyerCheckoutPage() {
  const { cartItems, subtotal, discount, appliedCoupon, refreshCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ shippingAddressId: "", billingAddressId: "", paymentMethod: "CASH_ON_DELIVERY" });
  const [error, setError] = useState("");
  const processing = useRef(false);
  const navigate = useNavigate();
  useEffect(() => { getBuyerAddresses().then(setAddresses).catch((caught) => setError(caught.message)); }, []);
  const submit = async (event) => {
    event.preventDefault();
    if (processing.current) return;
    processing.current = true;
    try {
      const orders = await createBuyerCheckout({ ...form, coupon: appliedCoupon });
      await refreshCart();
      navigate(`/account/orders/${orders[0].orderId}`, { state: { createdOrderIds: orders.map((order) => order.orderId) } });
    } catch (caught) {
      setError(caught.message);
      processing.current = false;
    }
  };
  return (
    <>
      <Navbar />
      <main className="buyer-page container">
        <h1>Checkout</h1>
        <p>{cartItems.length} item(s) · {formatCurrency(Math.max(subtotal - discount, 0))}</p>
        {!addresses.length ? <p>Add a saved address in your account before checkout.</p> : (
          <form className="buyer-form" onSubmit={submit}>
            <label>Shipping address<select required value={form.shippingAddressId} onChange={(event) => setForm({ ...form, shippingAddressId: event.target.value })}><option value="">Select</option>{addresses.map((address) => <option key={address.buyerAddressId} value={address.buyerAddressId}>{address.streetAddress}, {address.city}</option>)}</select></label>
            <label>Billing address<select value={form.billingAddressId} onChange={(event) => setForm({ ...form, billingAddressId: event.target.value })}><option value="">Same as shipping</option>{addresses.map((address) => <option key={address.buyerAddressId} value={address.buyerAddressId}>{address.streetAddress}, {address.city}</option>)}</select></label>
            <label>Payment method<select value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}><option value="CASH_ON_DELIVERY">Cash on delivery</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CARD">Card (authorization pending; no card data collected)</option></select></label>
            <button type="submit" disabled={!cartItems.length}>Place order</button>
          </form>
        )}
        {error && <p>{error}</p>}
      </main>
    </>
  );
}
export default BuyerCheckoutPage;

import { Link } from "react-router-dom";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import Navbar from "../../components/layout/Navbar";
import useCart from "../../hooks/useCart";
import "../../styles/buyer/buyerWorkspace.css";

function BuyerCartPage() {
  const { cartItems, cartCount, cartError } = useCart();
  return (
    <>
      <Navbar />
      <main className="buyer-page container">
        <h1>Your cart</h1>
        {cartItems.map((item) => <CartItem key={item.cartItemId} item={item} />)}
        {!cartItems.length && <p>Your cart is empty. <Link to="/">Continue shopping</Link></p>}
        {cartError && <p>{cartError}</p>}
        {cartItems.length > 0 && <CartSummary cartCount={cartCount} />}
      </main>
    </>
  );
}
export default BuyerCartPage;

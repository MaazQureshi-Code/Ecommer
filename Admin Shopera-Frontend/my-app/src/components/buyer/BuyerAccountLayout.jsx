import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar";
import "../../styles/buyer/buyerWorkspace.css";

function BuyerAccountLayout() {
  return (
    <>
      <Navbar />
      <main className="buyer-workspace container">
        <aside className="buyer-workspace__nav">
          <h2>My account</h2>
          <NavLink to="/account/profile">Profile</NavLink>
          <NavLink to="/account/addresses">Addresses</NavLink>
          <NavLink to="/account/orders">Orders</NavLink>
          <NavLink to="/account/wishlist">Wishlist</NavLink>
          <NavLink to="/cart">Cart</NavLink>
        </aside>
        <section className="buyer-workspace__content">
          <Outlet />
        </section>
      </main>
    </>
  );
}

export default BuyerAccountLayout;

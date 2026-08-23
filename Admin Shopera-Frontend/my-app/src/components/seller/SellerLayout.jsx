import { NavLink, Outlet } from "react-router-dom";
import { Boxes, LayoutDashboard, PackageSearch, Settings, Store } from "lucide-react";
import { getAuthenticatedUser } from "../../auth/authSession";

const links = [
  ["/seller", "Dashboard", LayoutDashboard],
  ["/seller/products", "Products", Boxes],
  ["/seller/orders", "Orders", PackageSearch],
  ["/seller/store", "Brand Store", Store],
  ["/seller/settings", "Settings", Settings],
];

function SellerLayout() {
  const seller = getAuthenticatedUser();
  return (
    <div className="seller-shell">
      <aside className="seller-sidebar">
        <div className="seller-brand">Brand Workspace</div>
        <nav>
          {links.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === "/seller"}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="seller-main">
        <header className="seller-header">
          <div>
            <strong>{seller.fullName}</strong>
            <span>SELLER</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default SellerLayout;

// src/components/layout/Navbar.jsx
 
import { useState } from "react";
import { Link } from "react-router-dom";

import useCart from "../../hooks/useCart";

function Navbar({ links = [] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, isCartOpen, openCart } = useCart();

  return (
    <header className="navbar">
      <div className="container navbar__container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="navbar__logo-text">shopera</span>
        </Link>

        <form className="navbar__search">
          <input
            type="search"
            placeholder="Search"
            className="navbar__search-input"
          />

          <button type="submit" className="navbar__search-button" aria-label="Search">
            <span aria-hidden="true">&#9906;</span>
          </button>
        </form>

        <nav className={`navbar__links ${isMenuOpen ? "navbar__links--open" : ""}`}>
          {links.map((link) => (
            <Link key={link.id} to={link.path} className="navbar__link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to="/account/wishlist" className="navbar__icon-button" aria-label="Wishlist">
            &#9825;
          </Link>

          <button
            type="button"
            className={`navbar__icon-button navbar__cart-button ${
              cartCount > 0 || isCartOpen ? "navbar__cart-button--active" : ""
            }`}
            aria-label="Cart"
            onClick={openCart}
          >
            <span aria-hidden="true">&#128722;</span>
            {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
          </button>

          <Link to="/account" className="navbar__login">
            My account
          </Link>
        </div>

        <button
          type="button"
          className="navbar__menu-button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          &#9776;
        </button>
      </div>
    </header>
  );
}

export default Navbar;

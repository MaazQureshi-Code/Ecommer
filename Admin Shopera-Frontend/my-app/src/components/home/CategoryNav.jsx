// src/components/home/CategoryNav.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function CategoryNav({ categories = [], quickLinks = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const featuredCategories = categories.slice(0, 5);

  return (
    <section className="category-nav">
      <div className="container category-nav__container" ref={navRef}>
        <div className="category-nav__menu">
          <button
            type="button"
            className={`category-nav__trigger${isOpen ? " is-active" : ""}`}
            aria-expanded={isOpen}
            aria-controls="category-nav-panel"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className="category-nav__trigger-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Categories</span>
            <span className="category-nav__chevron" aria-hidden="true" />
          </button>
        </div>

        <div className="category-nav__list" aria-label="Featured categories">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              to={category.path || `/collections/${category.slug}`}
              className="category-nav__item"
            >
              <span className="category-nav__item-icon" aria-hidden="true">
                {category.icon || category.name.charAt(0)}
              </span>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>

        <div className="category-nav__quick-links">
          {quickLinks.map((link) => (
            <Link key={link.id} to={link.path} className="category-nav__quick-link">
              {link.label}
            </Link>
          ))}
        </div>

        <div
          id="category-nav-panel"
          className={`category-nav__panel${isOpen ? " is-open" : ""}`}
        >
          <div className="category-nav__panel-head">
            <div>
              <span>Browse</span>
              <strong>Shop by category</strong>
            </div>
            <span>{categories.length} departments</span>
          </div>

          <div className="category-nav__panel-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.path || `/collections/${category.slug}`}
                className="category-nav__panel-item"
                onClick={() => setIsOpen(false)}
              >
                <span className="category-nav__panel-icon" aria-hidden="true">
                  {category.icon || category.name.charAt(0)}
                </span>
                <span className="category-nav__panel-copy">
                  <span>{category.name}</span>
                  {category.count ? <small>{category.count}</small> : null}
                </span>
                <span className="category-nav__panel-arrow" aria-hidden="true">
                  &#8250;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryNav;

// src/components/home/TopBrandsOffers.jsx

import { Link } from "react-router-dom";

function BrandMark({ brand }) {
  if (brand.mark === "apple") {
    return <span className="top-brands-offers__apple" aria-hidden="true"></span>;
  }

  if (brand.mark === "nike") {
    return <span className="top-brands-offers__nike" aria-hidden="true"></span>;
  }

  if (brand.mark === "adidas") {
    return (
      <span className="top-brands-offers__adidas" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    );
  }

  if (brand.mark === "huawei") {
    return (
      <span className="top-brands-offers__huawei" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
    );
  }

  return <span className="top-brands-offers__wordmark">{brand.mark}</span>;
}

function OfferIcon({ type }) {
  return (
    <span className={`top-brands-offers__offer-icon top-brands-offers__offer-icon--${type}`} aria-hidden="true">
      <span></span>
    </span>
  );
}

function TopBrandsOffers({ brands = [], offers = [] }) {
  return (
    <section className="top-brands-offers">
      <div className="container">
        <div className="top-brands-offers__header">
          <h2>TOP BRANDS</h2>
          <Link to="/collections/top-brands" className="top-brands-offers__view-all">
            See All
          </Link>
        </div>

        <div className="top-brands-offers__brands">
          {brands.map((brand) => (
            <Link key={brand.id} to={brand.path} className="top-brands-offers__brand" aria-label={brand.name}>
              <BrandMark brand={brand} />
            </Link>
          ))}
        </div>

        <div className="top-brands-offers__offers">
          {offers.map((offer) => (
            <Link key={offer.id} to={offer.path} className="top-brands-offers__offer">
              <OfferIcon type={offer.icon} />

              <span>
                <strong>{offer.title}</strong>
                <small>{offer.subtitle}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopBrandsOffers;

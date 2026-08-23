// src/components/home/SectionTitle.jsx

import { Link } from "react-router-dom";

function SectionTitle({ title, subtitle, viewAllLink }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {viewAllLink && (
        <Link to={viewAllLink} className="section-title__link">
          View all
        </Link>
      )}
    </div>
  );
}

export default SectionTitle;


import React from "react";
import "./StatCard.css";

function StatCard({
  title,
  value,
  icon,
  color = "#6c3df4",
  percentage,
  description
}) {
  return (
    <div className="stat-card">

      <div className="stat-card-top">

        <div className="stat-card-info">
          <p>{title}</p>
          <h2>{value}</h2>
        </div>

        <div
          className="stat-card-icon"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>

      </div>

      <div className="stat-card-bottom">

        {percentage && (
          <span className="stat-percentage">
            {percentage}
          </span>
        )}

        <span className="stat-description">
          {description}
        </span>

      </div>

    </div>
  );
}

export default StatCard;

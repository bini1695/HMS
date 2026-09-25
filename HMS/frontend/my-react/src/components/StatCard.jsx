import React from 'react';
import './StatCard.css';

export default function StatCard({ label, value, icon, accent = 'primary', trend }) {
  return (
    <div className="stat-card card">
      <div className={`stat-card-icon stat-card-icon-${accent}`}>{icon}</div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
        {trend && (
          <span className={`stat-card-trend ${trend.direction === 'down' ? 'trend-down' : 'trend-up'}`}>
            {trend.direction === 'down' ? '▼' : '▲'} {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}

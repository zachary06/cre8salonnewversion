import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ title, value, icon, trend, trendUp = true, colorClass = 'text-primary' }) => {
  return (
    <div className="card unified-stat-card">
      <div className="flex items-center gap-20">
        <div className={`unified-stat-icon ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="unified-stat-title">{title}</p>
          <h2 className="unified-stat-value">{value}</h2>
          {trend && (
            <p className={`unified-stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
              {trendUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
              <span>{trend}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatCard);

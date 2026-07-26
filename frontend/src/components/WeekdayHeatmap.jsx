import React from "react";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function WeekdayHeatmap({ data }) {
  if (!data || data.every((d) => d.amount === 0)) {
    return <div className="empty-state">No spending yet this month to map by weekday.</div>;
  }

  const max = Math.max(...data.map((d) => d.amount));

  return (
    <div className="weekday-heatmap">
      {data.map((d) => {
        const intensity = max > 0 ? d.amount / max : 0;
        return (
          <div className="weekday-cell" key={d.day}>
            <div
              className="weekday-swatch"
              style={{ opacity: 0.15 + intensity * 0.85 }}
              title={`${d.day}: ${formatCurrency(d.amount)}`}
            />
            <div className="weekday-label">{d.day}</div>
            <div className="weekday-amount">{formatCurrency(d.amount)}</div>
          </div>
        );
      })}
    </div>
  );
}

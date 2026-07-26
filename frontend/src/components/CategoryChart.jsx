import React from "react";
import { PieChart, Pie, Cell, Sector, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getCategoryIcon } from "./categoryIcons";

const COLORS = ["#E8B93A", "#E63946", "#3DDC84", "#6E7681", "#C9722A", "#8B6FD9", "#3FA9C9"];

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="donut-legend">
      {payload.map((entry, index) => (
        <li key={index}>
          <span className="swatch" style={{ background: entry.color }} />
          {getCategoryIcon(entry.value)} {entry.value}
          <span className="donut-legend-value">{formatCurrency(entry.payload.amount)}</span>
        </li>
      ))}
    </ul>
  );
};

// Slightly expands the hovered segment outward (suggestion #7: donut segments expand on hover)
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

export default function CategoryChart({ data, loading = false }) {
  if (loading) {
    return (
      <div className="donut-wrap">
        <div className="skeleton skeleton-donut" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state-illustrated">
        <div className="empty-state-icon">🥧</div>
        <div className="empty-state-title">No expenses yet.</div>
        <div className="empty-state-subtitle">Add one to see the breakdown.</div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={90}
            paddingAngle={2}
            stroke="#0A0B0D"
            activeShape={renderActiveShape}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `₹${value}`}
            contentStyle={{ background: "#16181C", border: "1px solid #2A2D33", borderRadius: 2, color: "#E8E6E1" }}
            itemStyle={{ color: "#E8E6E1" }}
          />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <div className="donut-center-value">{formatCurrency(total)}</div>
        <div className="donut-center-label">Spent</div>
      </div>
    </div>
  );
}

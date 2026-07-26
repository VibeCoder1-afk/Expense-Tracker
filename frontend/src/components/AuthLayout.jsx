import React from "react";

const FEATURES = [
  { icon: "📊", label: "Analytics Dashboard" },
  { icon: "💰", label: "Budget Goals" },
  { icon: "🤖", label: "AI Insights" },
  { icon: "📈", label: "Spending Reports" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-shell">
        <div className="auth-side-panel">
          <div className="stamp auth-stamp">
            <span className="rupee-glyph">₹</span>
          </div>
          <h1 className="auth-side-title">Expense Tracker</h1>
          <p className="auth-side-subtitle">
            Track your income and spending efficiently.
          </p>
          <ul className="auth-feature-list">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="auth-feature-icon">{f.icon}</span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="auth-form-panel">{children}</div>
      </div>
    </div>
  );
}

import React from "react";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function SummaryCards({ summary }) {
  return (
    <div className="summary-cards">
      <div className="card income">
        <div className="label">Total Income</div>
        <div className="value">{formatCurrency(summary.income)}</div>
      </div>
      <div className="card expense">
        <div className="label">Total Expense</div>
        <div className="value">{formatCurrency(summary.expense)}</div>
      </div>
      <div className="card balance">
        <div className="label">Balance</div>
        <div className="value">{formatCurrency(summary.balance)}</div>
      </div>
    </div>
  );
}

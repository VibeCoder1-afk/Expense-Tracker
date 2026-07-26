import React from "react";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function TransactionList({ transactions, onDelete }) {
  if (!transactions || transactions.length === 0) {
    return <div className="empty-state">No transactions yet. Add your first one above.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Note</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t._id}>
            <td>{new Date(t.date).toLocaleDateString()}</td>
            <td>{t.category}</td>
            <td>{t.note || "—"}</td>
            <td className={`amount ${t.type}`}>
              {t.type === "expense" ? "-" : "+"}
              {formatCurrency(t.amount)}
            </td>
            <td>
              <button className="delete-btn" onClick={() => onDelete(t._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

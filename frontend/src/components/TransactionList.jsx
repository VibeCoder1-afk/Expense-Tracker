import React, { useState, useMemo } from "react";
import { getCategoryIcon } from "./categoryIcons";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const FILTERS = ["All", "Income", "Expense", "This Month", "Last Month"];
const SORTS = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "amount-asc", label: "Amount: low to high" },
];

const isInMonth = (date, monthsAgo) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
};

const exportToCsv = (transactions) => {
  const header = ["Date", "Type", "Category", "Note", "Amount"];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString("en-GB"),
    t.type,
    t.category,
    (t.note || "").replace(/"/g, '""'),
    t.amount,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function TransactionList({ transactions, onDelete }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");

  const filtered = useMemo(() => {
    if (!transactions) return [];
    let result = transactions;

    switch (filter) {
      case "Income":
        result = result.filter((t) => t.type === "income");
        break;
      case "Expense":
        result = result.filter((t) => t.type === "expense");
        break;
      case "This Month":
        result = result.filter((t) => isInMonth(new Date(t.date), 0));
        break;
      case "Last Month":
        result = result.filter((t) => isInMonth(new Date(t.date), 1));
        break;
      default:
        break;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) => t.category.toLowerCase().includes(q) || (t.note || "").toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "date-asc":
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "amount-desc":
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      default:
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return sorted;
  }, [transactions, filter, search, sort]);

  return (
    <div>
      <div className="filter-toolbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f}
          </button>
        ))}
      </div>

      <div className="list-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search category or note…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          type="button"
          className="export-btn"
          onClick={() => exportToCsv(filtered)}
          disabled={filtered.length === 0}
        >
          ⭳ Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        transactions && transactions.length > 0 ? (
          <div className="empty-state">— no entries match your filters —</div>
        ) : (
          <div className="empty-state-illustrated">
            <div className="empty-state-icon">🧾</div>
            <div className="empty-state-title">No transactions yet.</div>
            <div className="empty-state-subtitle">Start by adding your first income.</div>
          </div>
        )
      ) : (
        <div className="receipt-list">
          {filtered.map((t, i) => (
            <div
              className="receipt-row fade-in-row"
              key={t._id}
              style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
            >
              <span className="receipt-date">{new Date(t.date).toLocaleDateString("en-GB")}</span>
              <div className="receipt-main">
                <span className="receipt-category">{getCategoryIcon(t.category)} {t.category}</span>
                <span className={`receipt-type-badge ${t.type}`}>{t.type}</span>
                {t.note && <span className="receipt-note">({t.note})</span>}
              </div>
              <span className="receipt-leader" />
              <span className={`receipt-amount ${t.type}`}>
                {t.type === "expense" ? "-" : "+"}
                {formatCurrency(t.amount)}
              </span>
              <button className="delete-btn" onClick={() => onDelete(t._id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

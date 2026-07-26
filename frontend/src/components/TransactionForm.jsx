import React, { useState } from "react";
import { getCategoryIcon } from "./categoryIcons";

const CATEGORIES = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Other"];

// toISOString() converts to UTC, which gives the wrong calendar date for
// anyone in a timezone ahead of UTC (e.g. IST, UTC+5:30) during early
// morning hours — the UTC date is still "yesterday" until 5:30 AM IST.
// This builds the date string from local Y/M/D components instead.
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: CATEGORIES[0],
    note: "",
    date: getLocalDateString(),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;

    await onAdd({ ...form, amount: Number(form.amount) });

    setForm({ ...form, amount: "", note: "" });
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div>
        <label className="field-label">Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="expense">💸 Expense</option>
          <option value="income">💰 Income</option>
        </select>
      </div>

      <div>
        <label className="field-label">Amount (₹)</label>
        <input
          type="number"
          name="amount"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label className="field-label">Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Date</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} />
      </div>

      <div className="full">
        <label className="field-label">Note (optional)</label>
        <input
          type="text"
          name="note"
          placeholder="e.g. groceries for the week"
          value={form.note}
          onChange={handleChange}
        />
      </div>

      <button className="primary" type="submit">+ Add Entry</button>
    </form>
  );
}

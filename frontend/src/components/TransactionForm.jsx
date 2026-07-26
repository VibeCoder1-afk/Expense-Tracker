import React, { useState } from "react";

const CATEGORIES = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Other"];

export default function TransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: CATEGORIES[0],
    note: "",
    date: new Date().toISOString().slice(0, 10),
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
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        min="0"
        step="0.01"
        required
      />

      <select name="category" value={form.category} onChange={handleChange}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input type="date" name="date" value={form.date} onChange={handleChange} />

      <input
        className="full"
        type="text"
        name="note"
        placeholder="Note (optional)"
        value={form.note}
        onChange={handleChange}
      />

      <button className="primary" type="submit">Add Transaction</button>
    </form>
  );
}

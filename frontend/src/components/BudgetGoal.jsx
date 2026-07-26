import React, { useState, useEffect } from "react";
import { getBudget, setBudget as saveBudget } from "../api";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function BudgetGoal({ expense, onSaved }) {
  const [budget, setBudgetState] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBudget()
      .then((b) => setBudgetState(b))
      .catch(() => setBudgetState({ monthlyLimit: 0 }))
      .finally(() => setBudgetLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const value = Number(inputValue);
    if (isNaN(value) || value < 0) return;
    setSaving(true);
    try {
      const updated = await saveBudget(value);
      setBudgetState(updated);
      setEditing(false);
      if (onSaved) onSaved();
    } finally {
      setSaving(false);
    }
  };

  if (budgetLoading) {
    return (
      <div className="panel budget-goal">
        <div className="budget-goal-header">
          <h2>Budget Goal</h2>
        </div>
        <div className="skeleton skeleton-label" style={{ width: "40%" }} />
        <div className="skeleton skeleton-bar" style={{ marginTop: 12 }} />
        <div className="skeleton skeleton-label" style={{ width: "30%", marginTop: 10 }} />
      </div>
    );
  }

  if (!budget) return null;

  const limit = budget.monthlyLimit || 0;
  const pct = limit > 0 ? Math.min(100, Math.round((expense / limit) * 100)) : 0;
  const over = limit > 0 && expense > limit;

  return (
    <div className="panel budget-goal">
      <div className="budget-goal-header">
        <h2>Budget Goal</h2>
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setInputValue(String(limit));
            setEditing((v) => !v);
          }}
        >
          {editing ? "Cancel" : limit > 0 ? "Edit" : "Set goal"}
        </button>
      </div>

      {editing ? (
        <form className="budget-goal-form" onSubmit={handleSave}>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Monthly limit (₹)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      ) : limit > 0 ? (
        <>
          <div className="budget-goal-amounts">
            <span>{formatCurrency(expense)} spent</span>
            <span className="budget-goal-limit">of {formatCurrency(limit)}</span>
          </div>
          <div className="balance-progress-track">
            <div
              className={`balance-progress-fill${over ? " over" : ""}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="balance-progress-label">
            {over ? "Over your monthly budget" : `${pct}% of budget used`}
          </div>
        </>
      ) : (
        <div className="empty-state">No budget set yet — click "Set goal" to add one.</div>
      )}
    </div>
  );
}

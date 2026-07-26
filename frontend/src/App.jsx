import React, { useEffect, useState, useCallback } from "react";
import SummaryCards from "./components/SummaryCards";
import CategoryChart from "./components/CategoryChart";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import { getTransactions, getSummary, createTransaction, deleteTransaction } from "./api";

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, categoryBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [txns, sum] = await Promise.all([getTransactions(), getSummary()]);
      setTransactions(txns);
      setSummary(sum);
      setError(null);
    } catch (err) {
      setError("Could not reach the server. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async (payload) => {
    await createTransaction(payload);
    await loadData();
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    await loadData();
  };

  return (
    <div className="app">
      <div className="header">
        <h1>💰 Expense Tracker</h1>
      </div>

      {error && <div className="panel" style={{ color: "#dc2626" }}>{error}</div>}

      <SummaryCards summary={summary} />

      <div className="grid-2">
        <div className="panel">
          <h2>Add Transaction</h2>
          <TransactionForm onAdd={handleAdd} />
        </div>
        <div className="panel">
          <h2>Spending by Category</h2>
          <CategoryChart data={summary.categoryBreakdown} />
        </div>
      </div>

      <div className="panel">
        <h2>All Transactions</h2>
        {loading ? <div className="empty-state">Loading…</div> : (
          <TransactionList transactions={transactions} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

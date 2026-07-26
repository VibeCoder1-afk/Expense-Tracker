import React, { useEffect, useState, useCallback, useRef } from "react";
import SummaryCards from "./components/SummaryCards";
import CategoryChart from "./components/CategoryChart";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import BudgetGoal from "./components/BudgetGoal";
import AnalyticsPage from "./components/AnalyticsPage";
import ThemeToggle from "./components/ThemeToggle";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Toast from "./components/Toast";
import { getTransactions, getSummary, createTransaction, deleteTransaction, logout as apiLogout } from "./api";

const TABS = ["Dashboard", "Analytics"];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, categoryBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("Dashboard");
  const [tabLeaving, setTabLeaving] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // --- Auth state ---
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [authView, setAuthView] = useState("login"); // "login" | "signup"
  const [authFadingOut, setAuthFadingOut] = useState(false);
  const [enteredDashboard, setEnteredDashboard] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    // Plays the staggered card entrance once, right after login.
    // After it finishes, tab switches skip the stagger and just use
    // the quick tab-fade instead.
    setEnteredDashboard(false);
    const t = setTimeout(() => setEnteredDashboard(true), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleAdd = async (payload) => {
    await createTransaction(payload);
    await loadData();
    showToast("Transaction Added");
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    await loadData();
    showToast("Transaction Deleted");
  };

  const handleAuthed = (authedUser) => {
    setAuthFadingOut(true);
    setTimeout(() => {
      setUser(authedUser);
    }, 480); // matches the 0.5s fade-out in animations.css
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === tab || tabLeaving) return;
    setTabLeaving(true);
    // Matches the .tab-leaving fade-out duration in index.css (180ms) —
    // waits for the current tab's content to fade out before actually
    // swapping to the new tab, so the switch reads as a cross-fade
    // rather than an instant cut.
    setTimeout(() => {
      setTab(nextTab);
      setTabLeaving(false);
    }, 180);
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setTransactions([]);
    setSummary({ income: 0, expense: 0, balance: 0, categoryBreakdown: [] });
  };

  // --- Not logged in: show auth screens ---
  if (!user) {
    return authView === "login" ? (
      <div className={`app auth-transition${authFadingOut ? " fade-out" : ""}`}>
        <Login onAuthed={handleAuthed} onSwitchToSignup={() => setAuthView("signup")} />
      </div>
    ) : (
      <div className={`app auth-transition${authFadingOut ? " fade-out" : ""}`}>
        <Signup onAuthed={handleAuthed} onSwitchToLogin={() => setAuthView("login")} />
      </div>
    );
  }

  return (
    <div className="app dashboard-enter">
      <Toast message={toast} />
      <div className="header">
        <div className="stamp">
          <span className="rupee-glyph">₹</span>
        </div>
        <div className="header-titles">
          <span className="eyebrow">Personal Ledger</span>
          <h1>Expense Tracker</h1>
          <p className="subtitle">Track your income and spending efficiently.</p>
        </div>
        <div className="header-actions">
          <span className="header-user">{user.name || user.email}</span>
          <button type="button" className="link-btn" onClick={handleLogout}>
            Log out
          </button>
          <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? " active" : ""}`}
            onClick={() => handleTabChange(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>

      {error && <div className="panel" style={{ color: "#dc2626" }}>{error}</div>}

      <div key={tab} className={`tab-fade${tabLeaving ? " tab-leaving" : ""}`}>
        {tab === "Analytics" ? (
          <AnalyticsPage />
        ) : (
          <>
            <div className={!enteredDashboard ? "stagger-item" : undefined} style={!enteredDashboard ? { animationDelay: "0.1s" } : undefined}>
              <SummaryCards summary={summary} transactions={transactions} loading={loading} />
            </div>

            <div className={!enteredDashboard ? "stagger-item" : undefined} style={!enteredDashboard ? { animationDelay: "0.35s" } : undefined}>
              <BudgetGoal expense={summary.expense} onSaved={() => showToast("Budget Updated")} />
            </div>

            <div className={`grid-2${!enteredDashboard ? " stagger-item" : ""}`} style={!enteredDashboard ? { animationDelay: "0.6s" } : undefined}>
              <div className="panel">
                <h2>Add Transaction</h2>
                <TransactionForm onAdd={handleAdd} />
              </div>
              <div className="panel">
                <h2>Spending by Category</h2>
                <CategoryChart data={summary.categoryBreakdown} loading={loading} />
              </div>
            </div>

            <div className={`panel${!enteredDashboard ? " stagger-item" : ""}`} style={!enteredDashboard ? { animationDelay: "0.85s" } : undefined}>
              <h2>All Transactions</h2>
              {loading ? <div className="empty-state">Loading…</div> : (
                <TransactionList transactions={transactions} onDelete={handleDelete} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

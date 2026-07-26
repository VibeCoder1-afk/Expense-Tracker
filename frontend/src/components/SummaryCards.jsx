import React from "react";
import useCountUp from "./useCountUp";
import { getCategoryIcon } from "./categoryIcons";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function TrendBadge({ pct }) {
  // null means "no prior month to compare against" — show nothing rather than a misleading number
  if (pct === null || pct === undefined) return null;

  const isUp = pct > 0;
  const isFlat = pct === 0;
  const arrow = isFlat ? "→" : isUp ? "↑" : "↓";
  const cls = isFlat ? "flat" : isUp ? "up" : "down";

  return (
    <div className={`trend ${cls}`}>
      {arrow} {Math.abs(pct)}% vs last month
    </div>
  );
}

function BalanceTrend({ amount }) {
  if (amount === null || amount === undefined) return null;

  const isUp = amount > 0;
  const isFlat = amount === 0;
  const arrow = isFlat ? "→" : isUp ? "↑" : "↓";
  const cls = isFlat ? "flat" : isUp ? "up" : "down";

  return (
    <div className={`trend ${cls}`}>
      {arrow} {formatCurrency(Math.abs(amount))} vs last month
    </div>
  );
}

function AnimatedValue({ amount, className }) {
  const animated = useCountUp(amount || 0);
  return <div className={className}>{formatCurrency(animated)}</div>;
}

export default function SummaryCards({ summary, transactions = [], loading = false }) {
  if (loading) {
    return (
      <>
        <div className="summary-cards">
          <div className="card skeleton-card">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
          </div>
          <div className="card skeleton-card">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
          </div>
          <div className="card skeleton-card">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
            <div className="skeleton skeleton-bar" />
          </div>
        </div>
        <div className="panel quick-stats">
          <div className="stat-item">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-stat" />
          </div>
          <div className="stat-item">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-stat" />
          </div>
          <div className="stat-item">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-stat" />
          </div>
          <div className="stat-item">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-stat" />
          </div>
        </div>
      </>
    );
  }

  const expenses = transactions.filter((t) => t.type === "expense");
  const incomes = transactions.filter((t) => t.type === "income");

  const highestExpense = expenses.reduce(
    (max, t) => (t.amount > (max?.amount ?? -Infinity) ? t : max),
    null
  );
  const biggestIncome = incomes.reduce(
    (max, t) => (t.amount > (max?.amount ?? -Infinity) ? t : max),
    null
  );

  const today = new Date();
  const todaysSpending = expenses
    .filter((t) => isSameDay(new Date(t.date), today))
    .reduce((sum, t) => sum + t.amount, 0);

  const expensePctOfIncome = summary.income > 0
    ? Math.min(100, Math.round((summary.expense / summary.income) * 100))
    : summary.expense > 0 ? 100 : 0;
  const overBudget = summary.income > 0 && summary.expense > summary.income;

  return (
    <>
      <div className="summary-cards">
        <div className="card income fade-in-row" style={{ animationDelay: "0ms" }}>
          <div className="label">Total Income</div>
          <AnimatedValue amount={summary.income} className="value" />
          <TrendBadge pct={summary.incomeChangePct} />
        </div>
        <div className="card expense fade-in-row" style={{ animationDelay: "80ms" }}>
          <div className="label">Total Expense</div>
          <AnimatedValue amount={summary.expense} className="value" />
          <TrendBadge pct={summary.expenseChangePct} />
        </div>
        <div className="card balance fade-in-row" style={{ animationDelay: "160ms" }}>
          <div className="label">Balance</div>
          <AnimatedValue amount={summary.balance} className="value" />
          <BalanceTrend amount={summary.balanceChangeAmount} />
          <div className="balance-progress-track">
            <div
              className={`balance-progress-fill${overBudget ? " over" : ""}`}
              style={{ width: `${expensePctOfIncome}%` }}
            />
          </div>
          <div className="balance-progress-label">
            {overBudget ? "Spending exceeds income" : `${expensePctOfIncome}% of income spent`}
          </div>
        </div>
      </div>

      <div className="panel quick-stats">
        <div className="stat-item">
          <div className="label">💸 Highest Expense</div>
          <div className="stat-value">{highestExpense ? formatCurrency(highestExpense.amount) : "—"}</div>
          {highestExpense && (
            <div className="stat-sub">{getCategoryIcon(highestExpense.category)} {highestExpense.category}</div>
          )}
        </div>
        <div className="stat-item">
          <div className="label">💰 Biggest Income</div>
          <div className="stat-value">{biggestIncome ? formatCurrency(biggestIncome.amount) : "—"}</div>
        </div>
        <div className="stat-item">
          <div className="label">📅 Today's Spending</div>
          <div className="stat-value">{formatCurrency(todaysSpending)}</div>
        </div>
        <div className="stat-item">
          <div className="label">🧾 Transactions</div>
          <div className="stat-value">{transactions.length}</div>
        </div>
      </div>
    </>
  );
}

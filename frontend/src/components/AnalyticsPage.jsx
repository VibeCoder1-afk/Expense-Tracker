import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getMonthlyTrends, getStats, getBudget } from "../api";
import WeekdayHeatmap from "./WeekdayHeatmap";
import AIInsights from "./AIInsights";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

function ThisMonthSummary({ stats }) {
  if (!stats) return null;

  return (
    <div className="panel this-month-summary">
      <h2>This Month</h2>
      <div className="this-month-grid">
        <div className="this-month-item">
          <div className="label">Income</div>
          <div className="this-month-value income">{formatCurrency(stats.income)}</div>
        </div>
        <div className="this-month-item">
          <div className="label">Expense</div>
          <div className="this-month-value expense">{formatCurrency(stats.expense)}</div>
        </div>
        <div className="this-month-item">
          <div className="label">Savings</div>
          <div className="this-month-value">{formatCurrency(stats.savings)}</div>
        </div>
        <div className="this-month-item">
          <div className="label">Savings Rate</div>
          <div className="this-month-value">
            {stats.savingsRate !== null && stats.savingsRate !== undefined ? `${stats.savingsRate}%` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreStats({ stats }) {
  if (!stats) return null;

  if (stats.transactionCount === 0) {
    return (
      <div className="panel">
        <h2>More Analytics</h2>
        <div className="empty-state">Add more transactions to unlock analytics.</div>
      </div>
    );
  }

  return (
    <div className="panel quick-stats more-stats">
      <div className="stat-item">
        <div className="label">🏷️ Top Category</div>
        <div className="stat-value">{stats.topCategory ? stats.topCategory.category : "—"}</div>
        {stats.topCategory && (
          <div className="stat-sub">{formatCurrency(stats.topCategory.amount)}</div>
        )}
      </div>
      <div className="stat-item">
        <div className="label">📆 Avg Daily Spend</div>
        <div className="stat-value">{formatCurrency(stats.avgDailySpend)}</div>
      </div>
      <div className="stat-item">
        <div className="label">🧮 Avg Transaction</div>
        <div className="stat-value">{formatCurrency(stats.avgTransactionValue)}</div>
      </div>
      <div className="stat-item">
        <div className="label">🔥 Highest Expense</div>
        <div className="stat-value">
          {stats.highestExpense ? formatCurrency(stats.highestExpense.amount) : "—"}
        </div>
        {stats.highestExpense && <div className="stat-sub">{stats.highestExpense.category}</div>}
      </div>
    </div>
  );
}

function BudgetVisualization({ budget, stats }) {
  if (!budget || !budget.monthlyLimit) return null;

  const limit = budget.monthlyLimit;
  const spent = stats ? stats.expense : 0;
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const over = spent > limit;

  return (
    <div className="panel">
      <h2>Budget</h2>
      <div className="balance-progress-track">
        <div
          className={`balance-progress-fill${over ? " over" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="budget-viz-amounts">
        {formatCurrency(spent)} / {formatCurrency(limit)}
      </div>
      <div className="balance-progress-label">{pct}% used</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [trends, setTrends] = useState(null);
  const [stats, setStats] = useState(null);
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getMonthlyTrends(6), getStats(), getBudget().catch(() => null)])
      .then(([trendsData, statsData, budgetData]) => {
        setTrends(trendsData);
        setStats(statsData);
        setBudget(budgetData);
      })
      .catch(() => setError("Could not load analytics."));
  }, []);

  if (error) {
    return <div className="panel" style={{ color: "#dc2626" }}>{error}</div>;
  }

  if (!trends || !stats) {
    return <div className="panel empty-state">Loading analytics…</div>;
  }

  const hasEnoughData = trends.some((t) => t.income > 0 || t.expense > 0);

  return (
    <div>
      <ThisMonthSummary stats={stats} />

      {!hasEnoughData ? (
        <div className="panel empty-state">Add more transactions to unlock analytics.</div>
      ) : (
        <>
          <div className="panel">
            <h2>Balance Over Time</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--ink-soft)" fontSize={12} />
                <YAxis stroke="var(--ink-soft)" fontSize={12} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 2, color: "var(--ink)" }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--signal)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  fill="url(#balanceGradient)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="panel">
            <h2>Income vs Expense by Month</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trends}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--ink-soft)" fontSize={12} />
                <YAxis stroke="var(--ink-soft)" fontSize={12} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 2, color: "var(--ink)" }}
                />
                <Legend wrapperStyle={{ color: "var(--ink-soft)", fontSize: 13 }} />
                <Bar dataKey="income" fill="var(--green)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expense" fill="var(--red)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <MoreStats stats={stats} />

          <div className="panel">
            <h2>Spending by Weekday</h2>
            <WeekdayHeatmap data={stats.weekdayBreakdown} />
          </div>

          <BudgetVisualization budget={budget} stats={stats} />

          <AIInsights stats={stats} trends={trends} />
        </>
      )}
    </div>
  );
}

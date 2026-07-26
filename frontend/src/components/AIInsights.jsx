import React, { useMemo } from "react";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

// Generates plain-language insights from stats + trends using simple rules —
// no LLM call needed, but structured so a real AI summary could replace/augment
// this later if desired.
function buildInsights(stats, trends) {
  const insights = [];
  if (!stats) return insights;

  // Category change vs previous month
  if (trends && trends.length >= 2 && stats.topCategory) {
    const prevMonth = trends[trends.length - 2];
    const thisMonth = trends[trends.length - 1];
    if (prevMonth && thisMonth && prevMonth.expense > 0) {
      const pctChange = Math.round(((thisMonth.expense - prevMonth.expense) / prevMonth.expense) * 100);
      if (Math.abs(pctChange) >= 10) {
        insights.push({
          icon: pctChange > 0 ? "📈" : "📉",
          text: `Overall spending ${pctChange > 0 ? "increased" : "decreased"} by ${Math.abs(pctChange)}% compared to last month.`,
          level: pctChange >= 50 ? "alert" : pctChange >= 10 ? "warning" : "good",
        });
      }
    }
  }

  // Top category callout
  if (stats.topCategory && stats.expense > 0) {
    const pctOfTotal = Math.round((stats.topCategory.amount / stats.expense) * 100);
    insights.push({
      icon: "🏷️",
      text: `${stats.topCategory.category} is your top spending category this month, making up ${pctOfTotal}% of expenses.`,
      level: pctOfTotal >= 70 ? "warning" : undefined,
    });
  }

  // Savings rate
  if (stats.savingsRate !== null && stats.savingsRate !== undefined) {
    if (stats.savingsRate >= 20) {
      insights.push({
        icon: "💪",
        text: `You're saving ${stats.savingsRate}% of your income this month — solid progress.`,
        level: "good",
      });
    } else if (stats.savingsRate < 0) {
      insights.push({
        icon: "⚠️",
        text: `You're spending more than you're earning this month (${Math.abs(stats.savingsRate)}% over income).`,
        level: "alert",
      });
    }
  }

  // Weekday pattern
  if (stats.weekdayBreakdown) {
    const weekend = stats.weekdayBreakdown
      .filter((d) => d.day === "Sat" || d.day === "Sun")
      .reduce((sum, d) => sum + d.amount, 0);
    const weekday = stats.weekdayBreakdown
      .filter((d) => d.day !== "Sat" && d.day !== "Sun")
      .reduce((sum, d) => sum + d.amount, 0);
    if (weekend > weekday && weekend > 0) {
      insights.push({ icon: "🎉", text: "Most of your spending happens on weekends." });
    }
  }

  // Highest single expense
  if (stats.highestExpense) {
    insights.push({
      icon: "💸",
      text: `Your largest single expense this month was ${formatCurrency(stats.highestExpense.amount)} (${stats.highestExpense.category}).`,
    });
  }

  return insights;
}

const LEVEL_LABELS = { good: "Good", warning: "Warning", alert: "Alert" };

export default function AIInsights({ stats, trends }) {
  const insights = useMemo(() => buildInsights(stats, trends), [stats, trends]);

  return (
    <div className="panel">
      <h2>AI Insights</h2>
      {insights.length === 0 ? (
        <div className="empty-state">Add more transactions to unlock insights.</div>
      ) : (
        <ul className="ai-insights-list">
          {insights.map((insight, i) => (
            <li key={i} className={`ai-insight-item${insight.level ? ` level-${insight.level}` : ""}`}>
              {insight.level ? (
                <div className="ai-insight-leveled">
                  <div className="ai-insight-level-header">
                    <span className={`ai-status-dot ${insight.level}`} />
                    {LEVEL_LABELS[insight.level]}
                  </div>
                  <div className="ai-insight-leveled-text">{insight.text}</div>
                </div>
              ) : (
                <>
                  <span className="ai-insight-icon">{insight.icon}</span>
                  <span>{insight.text}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

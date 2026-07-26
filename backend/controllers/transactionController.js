const Transaction = require("../models/Transaction");

// GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const filter = { user: req.userId };

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (category) {
      filter.category = category;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

// GET /api/transactions/summary
exports.getSummary = async (req, res) => {
  try {
    const filter = { user: req.userId };
    const transactions = await Transaction.find(filter);

    const sumTotals = (list) =>
      list.reduce(
        (acc, t) => {
          if (t.type === "income") acc.income += t.amount;
          else acc.expense += t.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      );

    const totals = sumTotals(transactions);
    const balance = totals.income - totals.expense;

    const byCategory = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      });

    const categoryBreakdown = Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
    }));

    res.json({
      income: totals.income,
      expense: totals.expense,
      balance,
      categoryBreakdown,
      // These totals are now all-time, so a month-over-month delta no
      // longer applies here. Month-over-month comparisons still exist
      // in /transactions/trends and /transactions/stats for Analytics.
      incomeChangePct: null,
      expenseChangePct: null,
      balanceChangeAmount: null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute summary", error: err.message });
  }
};

// GET /api/transactions/trends?months=6
exports.getMonthlyTrends = async (req, res) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 6;
    const now = new Date();
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const txns = await Transaction.find({
        user: req.userId,
        date: { $gte: start, $lt: end },
      });
      const income = txns.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const expense = txns.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

      results.push({
        month: start.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        income,
        expense,
        balance: income - expense,
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to compute trends", error: err.message });
  }
};

// GET /api/transactions/stats
// Deeper analytics for the current month: top category, average daily spend,
// average transaction value, savings rate, highest expense, and a weekday
// spending breakdown (for a Mon-Sun heatmap).
exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const transactions = await Transaction.find({
      user: req.userId,
      date: { $gte: start, $lt: end },
    });

    const incomeTxns = transactions.filter((t) => t.type === "income");
    const expenseTxns = transactions.filter((t) => t.type === "expense");

    const income = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
    const expense = expenseTxns.reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round((savings / income) * 1000) / 10 : null;

    // Top spending category
    const byCategory = {};
    expenseTxns.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    const topCategoryEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry
      ? { category: topCategoryEntry[0], amount: topCategoryEntry[1] }
      : null;

    // Average daily spending: total expense / days elapsed so far this month
    // (or full month length if querying a past month)
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysElapsed = isCurrentMonth ? now.getDate() : daysInMonth;
    const avgDailySpend = daysElapsed > 0 ? expense / daysElapsed : 0;

    // Average transaction value (expenses only)
    const avgTransactionValue = expenseTxns.length > 0 ? expense / expenseTxns.length : 0;

    // Highest expense this month
    const highestExpense = expenseTxns.reduce(
      (max, t) => (t.amount > (max?.amount ?? -Infinity) ? t : max),
      null
    );

    // Weekday spending heatmap: Sun=0 ... Sat=6
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayTotals = new Array(7).fill(0);
    expenseTxns.forEach((t) => {
      const day = new Date(t.date).getDay();
      weekdayTotals[day] += t.amount;
    });
    const weekdayBreakdown = weekdayLabels.map((label, i) => ({
      day: label,
      amount: weekdayTotals[i],
    }));

    res.json({
      income,
      expense,
      savings,
      savingsRate,
      topCategory,
      avgDailySpend,
      avgTransactionValue,
      highestExpense,
      weekdayBreakdown,
      transactionCount: transactions.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute stats", error: err.message });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: "type, amount, and category are required" });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      amount,
      category,
      note,
      date: date || Date.now(),
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to create transaction", error: err.message });
  }
};

// PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update transaction", error: err.message });
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction", error: err.message });
  }
};

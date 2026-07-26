const Transaction = require("../models/Transaction");

// GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const filter = {};

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
    const { month, year } = req.query;
    const filter = {};

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter);

    const totals = transactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );

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
      balance: totals.income - totals.expense,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to compute summary", error: err.message });
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
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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
    const deleted = await Transaction.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction", error: err.message });
  }
};

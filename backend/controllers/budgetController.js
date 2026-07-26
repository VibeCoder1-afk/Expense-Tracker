const Budget = require("../models/Budget");

// GET /api/budget
exports.getBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({ user: req.userId });
    if (!budget) {
      budget = await Budget.create({ user: req.userId, monthlyLimit: 0 });
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch budget", error: err.message });
  }
};

// PUT /api/budget
exports.setBudget = async (req, res) => {
  try {
    const { monthlyLimit } = req.body;

    if (monthlyLimit === undefined || monthlyLimit < 0) {
      return res.status(400).json({ message: "monthlyLimit must be a non-negative number" });
    }

    let budget = await Budget.findOne({ user: req.userId });
    if (!budget) {
      budget = await Budget.create({ user: req.userId, monthlyLimit });
    } else {
      budget.monthlyLimit = monthlyLimit;
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: "Failed to update budget", error: err.message });
  }
};

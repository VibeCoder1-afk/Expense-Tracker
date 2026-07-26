const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getSummary,
  getMonthlyTrends,
  getStats,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

// GET /api/transactions        -> list all (supports ?month=&year=&category=)
// GET /api/transactions/summary-> totals + category breakdown
// GET /api/transactions/trends -> monthly trends
// GET /api/transactions/stats  -> deeper analytics (top category, avg spend, weekday heatmap, etc.)
// POST /api/transactions       -> create
// PUT /api/transactions/:id    -> update
// DELETE /api/transactions/:id -> delete

router.get("/summary", getSummary);
router.get("/trends", getMonthlyTrends);
router.get("/stats", getStats);
router.get("/", getTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

// GET /api/transactions        -> list all (supports ?month=&year=&category=)
// GET /api/transactions/summary-> totals + category breakdown
// POST /api/transactions       -> create
// PUT /api/transactions/:id    -> update
// DELETE /api/transactions/:id -> delete

router.get("/summary", getSummary);
router.get("/", getTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;

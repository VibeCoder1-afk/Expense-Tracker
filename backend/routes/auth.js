const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/me  (protected)

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);

module.exports = router;

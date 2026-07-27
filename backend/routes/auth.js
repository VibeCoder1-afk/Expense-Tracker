const express = require("express");
const router = express.Router();
const { register, login, getMe, googleAuth } = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/google  — Google Sign-In (verifies ID token, issues app JWT)
// GET  /api/auth/me  (protected)

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", requireAuth, getMe);

module.exports = router;

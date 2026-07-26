const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const transactionRoutes = require("./routes/transactions");
const budgetRoutes = require("./routes/budgetRoutes");
const authRoutes = require("./routes/auth");
const requireAuth = require("./middleware/authMiddleware");

const app = express();

// Allow both localhost (laptop browser) and your local network IP (phone)
// to hit the API during development. Add more origins here as needed —
// e.g. if your IP changes, or you add a production frontend URL later.
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_ORIGIN, // e.g. http://192.168.1.101:3000, set in .env
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

// Protected routes — require a valid JWT
app.use("/api/transactions", requireAuth, transactionRoutes);
app.use("/api/budget", requireAuth, budgetRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running on port ${PORT} (accessible on your network too)`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

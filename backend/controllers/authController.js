const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to register", error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to log in", error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};

// POST /api/auth/google
// Body: { credential } — the ID token returned by Google Identity Services on the frontend.
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google Sign-In is not configured on this server" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(401).json({ message: "Google account email is not verified" });
    }

    const { sub: googleId, email, name } = payload;

    // Match an existing account by googleId first, then fall back to matching by
    // email so someone who originally signed up with a password can also use Google.
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.googleId = googleId;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({ email, name, googleId });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(401).json({ message: "Google sign-in failed", error: err.message });
  }
};

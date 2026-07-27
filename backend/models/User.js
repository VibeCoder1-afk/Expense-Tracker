const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      // Not required for accounts created via Google Sign-In.
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many docs with no googleId at all
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

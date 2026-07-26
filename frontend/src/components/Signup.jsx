import React, { useState } from "react";
import { register } from "../api";
import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Signup({ onAuthed, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailValid = email.length === 0 || isValidEmail(email);
  const passwordValid = password.length === 0 || password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await register(email, password, name);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onAuthed(user);
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;
      if (status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(serverMessage || "Something went wrong while signing up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="panel auth-panel">
        <h2>Sign Up</h2>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="field-label">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="you@example.com"
              required
            />
            {touched && !emailValid && (
              <div className="field-hint error">Please enter a valid email address.</div>
            )}
          </div>
          <div>
            <label className="field-label">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              showChecklist
            />
          </div>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Creating account…
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>
            Log in
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

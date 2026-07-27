import React, { useState } from "react";
import { login } from "../api";
import AuthLayout from "./AuthLayout";
import PasswordInput from "./PasswordInput";
import GoogleSignInButton from "./GoogleSignInButton";

export default function Login({ onAuthed, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onAuthed(user);
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;
      if (status === 401) {
        setError("Incorrect email or password.");
      } else if (!err.response) {
        setError("Could not reach the server. Please try again.");
      } else {
        setError(serverMessage || "Something went wrong while logging in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="panel auth-panel">
        <h2>Log In</h2>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Logging in…
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <GoogleSignInButton onAuthed={onAuthed} onError={setError} />

        <div className="auth-switch">
          Don't have an account?{" "}
          <button type="button" className="link-btn" onClick={onSwitchToSignup}>
            Sign up
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

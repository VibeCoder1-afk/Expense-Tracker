import React, { useEffect, useRef } from "react";
import { googleLogin } from "../api";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ onAuthed, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return; // silently no-op if not configured — email/password auth still works
    }
    if (!window.google || !window.google.accounts) {
      return; // GSI script hasn't loaded yet (see public/index.html)
    }

    const handleCredentialResponse = async (response) => {
      try {
        const { token, user } = await googleLogin(response.credential);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        onAuthed(user);
      } catch (err) {
        const message = err.response?.data?.message || "Google sign-in failed. Please try again.";
        onError?.(message);
      }
    };

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return null; // no client ID configured — hide the button rather than show a broken one
  }

  return <div className="google-btn-wrap" ref={buttonRef} />;
}

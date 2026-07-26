import React from "react";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} type="button" aria-label="Toggle light/dark mode">
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}

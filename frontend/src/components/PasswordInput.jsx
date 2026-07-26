import React, { useState } from "react";

// A password field with a show/hide toggle. When `showChecklist` is true,
// it also renders a live-updating validation checklist below the field
// (used on Signup, not Login).
export default function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoFocus = false,
  showChecklist = false,
}) {
  const [visible, setVisible] = useState(false);

  const hasLength = value.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);

  return (
    <div>
      <div className="password-field-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={showChecklist ? 8 : undefined}
          autoFocus={autoFocus}
          required
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>

      {showChecklist && value.length > 0 && (
        <ul className="password-checklist">
          <li className={hasLength ? "met" : ""}>
            {hasLength ? "✓" : "○"} 8+ characters
          </li>
          <li className={hasLetter ? "met" : ""}>
            {hasLetter ? "✓" : "○"} Contains a letter
          </li>
          <li className={hasNumber ? "met" : ""}>
            {hasNumber ? "✓" : "○"} Contains a number
          </li>
        </ul>
      )}
    </div>
  );
}

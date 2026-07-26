import React from "react";

// Feedback item #5: brief top-right confirmation after
// adding/deleting a transaction or updating the budget.
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-check">✓</span> {message}
    </div>
  );
}

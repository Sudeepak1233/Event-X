
import React from "react";
import "./Button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  fullWidth = false
}) {
  return (
    <button
      type={type}
      className={`custom-button ${variant} ${size} ${
        fullWidth ? "full-width" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;

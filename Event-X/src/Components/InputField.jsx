
import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import "./InputField.css";

function InputField({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  icon,
  error,
  rows = 4
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="input-field-container">

      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required-star"> *</span>}
        </label>
      )}

      <div className="input-wrapper">

        {icon && (
          <span className="input-icon">
            {icon}
          </span>
        )}

        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            rows={rows}
            className="custom-input custom-textarea"
          />
        ) : (
          <input
            id={name}
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="custom-input"
          />
        )}

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}

      </div>

      {error && (
        <p className="input-error">{error}</p>
      )}

    </div>
  );
}

export default InputField;

import * as React from "react";

export interface CustomInputProps {
  name?: string;
  label?: string;
  type?: string;
  value?: string | number;
  placeholder?: string;
  min?: number;
  max?: number;
  error?: string;
  as?: "input" | "textarea";
  className?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (e: any) => void;
}

function Input({
  name,
  label,
  type = "text",
  value,
  placeholder,
  min,
  max,
  error,
  as = "input",
  className = "",
  disabled,
  onChange,
}: CustomInputProps) {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]"
        >
          {label}
        </label>
      )}
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
          disabled={disabled}
          rows={4}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-[var(--bg)] text-[var(--ink)] outline-none transition focus:border-[var(--ink)] resize-none ${
            error ? "border-red-500" : "border-[var(--line)]"
          } ${className}`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
          disabled={disabled}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-[var(--bg)] text-[var(--ink)] outline-none transition focus:border-[var(--ink)] ${
            error ? "border-red-500" : "border-[var(--line)]"
          } ${className}`}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export { Input };
export default Input;

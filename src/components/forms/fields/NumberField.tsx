"use client";

import { FC } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const NumberField: FC<NumberFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  helpText,
  min,
  max,
  disabled = false,
}) => {
  const hasError = !!error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(0);
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium text-zinc-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type="number"
        value={value || ""}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${name}-error` : helpText ? `${name}-help` : undefined
        }
        className={cn(
          "px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100",
          "placeholder:text-zinc-600",
          "focus:outline-none focus:ring-2 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors",
          hasError
            ? "border-red-500 focus:ring-red-500"
            : "border-zinc-800 focus:ring-zinc-600"
        )}
      />

      {/* Error message */}
      {hasError && (
        <p
          id={`${name}-error`}
          className="text-xs text-red-400 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Help text */}
      {!hasError && helpText && (
        <p id={`${name}-help`} className="text-xs text-zinc-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default NumberField;

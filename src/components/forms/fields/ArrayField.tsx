"use client";

import { FC, useState, KeyboardEvent } from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrayFieldProps {
  label: string;
  name: string;
  values: string[];
  onChange: (values: string[]) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
}

const ArrayField: FC<ArrayFieldProps> = ({
  label,
  name,
  values,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  helpText,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const hasError = !!error;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addValue();
    } else if (e.key === "Backspace" && inputValue === "" && values.length > 0) {
      // Remove last value when backspace on empty input
      removeValue(values.length - 1);
    }
  };

  const addValue = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInputValue("");
    }
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
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

      <div
        className={cn(
          "px-3 py-2 bg-zinc-900 border rounded-lg",
          "focus-within:ring-2 focus-within:border-transparent",
          "transition-colors min-h-[42px]",
          disabled && "opacity-50 cursor-not-allowed",
          hasError
            ? "border-red-500 focus-within:ring-red-500"
            : "border-zinc-800 focus-within:ring-zinc-600"
        )}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Existing values as tags */}
          {values.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-100 text-sm rounded-md"
            >
              {value}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                  aria-label={`Remove ${value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}

          {/* Input for new values */}
          <input
            id={name}
            name={name}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              addValue();
              onBlur?.();
            }}
            placeholder={values.length === 0 ? placeholder : ""}
            disabled={disabled}
            required={required && values.length === 0}
            aria-required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${name}-error` : helpText ? `${name}-help` : undefined
            }
            className="flex-1 min-w-[120px] bg-transparent border-none text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
      </div>

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

export default ArrayField;

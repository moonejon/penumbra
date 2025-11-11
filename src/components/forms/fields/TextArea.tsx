"use client";

import { FC } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

const TextArea: FC<TextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  helpText,
  rows = 4,
  maxLength,
  disabled = false,
}) => {
  const hasError = !!error;
  const showCharCount = maxLength && maxLength > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium text-zinc-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
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
          "resize-vertical transition-colors",
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

      {/* Help text or character count */}
      {!hasError && (helpText || showCharCount) && (
        <div className="flex items-center justify-between">
          {helpText && (
            <p id={`${name}-help`} className="text-xs text-zinc-500">
              {helpText}
            </p>
          )}
          {showCharCount && (
            <p className="text-xs text-zinc-500">
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextArea;

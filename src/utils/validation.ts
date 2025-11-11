/**
 * Validation utilities for book data
 */

export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Validate ISBN-13 format and checksum
 */
export function validateISBN13(isbn: string): string | null {
  if (!isbn) return null;

  // Remove hyphens and spaces
  const cleaned = isbn.replace(/[-\s]/g, "");

  if (cleaned.length !== 13) {
    return "ISBN-13 must be 13 digits";
  }

  if (!/^\d+$/.test(cleaned)) {
    return "ISBN-13 must contain only digits";
  }

  if (!cleaned.startsWith("978") && !cleaned.startsWith("979")) {
    return "ISBN-13 must start with 978 or 979";
  }

  // Checksum validation
  const digits = cleaned.split("").map(Number);
  const checksum = digits.reduce((sum, digit, index) => {
    const weight = index % 2 === 0 ? 1 : 3;
    return sum + digit * weight;
  }, 0);

  if (checksum % 10 !== 0) {
    return "Invalid ISBN-13 checksum";
  }

  return null;
}

/**
 * Validate ISBN-10 format and checksum
 */
export function validateISBN10(isbn: string): string | null {
  if (!isbn) return null;

  const cleaned = isbn.replace(/[-\s]/g, "");

  if (cleaned.length !== 10) {
    return "ISBN-10 must be 10 characters";
  }

  if (!/^[\dX]+$/i.test(cleaned)) {
    return "ISBN-10 must contain only digits (and X for checksum)";
  }

  // Checksum validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }

  const lastChar = cleaned[9].toUpperCase();
  sum += lastChar === "X" ? 10 : parseInt(lastChar);

  if (sum % 11 !== 0) {
    return "Invalid ISBN-10 checksum";
  }

  return null;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date format (YYYY-MM-DD, YYYY-MM, or YYYY)
 */
export function validateDate(dateStr: string): string | null {
  if (!dateStr) return null;

  // Allow YYYY, YYYY-MM, or YYYY-MM-DD
  const patterns = [
    /^\d{4}$/,                           // YYYY
    /^\d{4}-(0[1-9]|1[0-2])$/,          // YYYY-MM
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, // YYYY-MM-DD
  ];

  const isValidFormat = patterns.some((pattern) => pattern.test(dateStr));

  if (!isValidFormat) {
    return "Date must be in YYYY, YYYY-MM, or YYYY-MM-DD format";
  }

  // Validate actual date if full date provided
  if (dateStr.length === 10) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
  }

  return null;
}

/**
 * Sanitize string input (trim and enforce max length)
 */
export function sanitizeString(input: string, maxLength: number = 5000): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets to prevent XSS
    .substring(0, maxLength);
}

/**
 * Validate required field
 */
export function validateRequired(value: string | string[] | number, fieldName: string): string | null {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${fieldName} is required`;
    }
  } else if (typeof value === "string") {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
  } else if (typeof value === "number") {
    if (value === 0 || isNaN(value)) {
      return `${fieldName} is required`;
    }
  }

  return null;
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = Infinity
): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }

  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }

  return null;
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  fieldName: string,
  min: number = -Infinity,
  max: number = Infinity
): string | null {
  if (isNaN(value)) {
    return `${fieldName} must be a valid number`;
  }

  if (value < min) {
    return `${fieldName} must be at least ${min}`;
  }

  if (value > max) {
    return `${fieldName} must be no more than ${max}`;
  }

  return null;
}

"use client";

import { useState, useCallback } from "react";
import { BookImportDataType } from "@/shared.types";
import {
  validateISBN13,
  validateISBN10,
  validateRequired,
  validateLength,
  validateNumberRange,
  validateDate,
} from "@/utils/validation";
import { initialBookImportData } from "@/app/import/components/import";

export type FormErrors = Partial<Record<keyof BookImportDataType, string>>;
export type FormTouched = Partial<Record<keyof BookImportDataType, boolean>>;

export interface FormState {
  data: BookImportDataType;
  errors: FormErrors;
  touched: FormTouched;
  isDirty: boolean;
  isValid: boolean;
}

export interface UseBookFormReturn {
  formState: FormState;
  handleChange: <K extends keyof BookImportDataType>(
    field: K,
    value: BookImportDataType[K]
  ) => void;
  handleBlur: (field: keyof BookImportDataType) => void;
  validateForm: () => boolean;
  resetForm: (initialData?: Partial<BookImportDataType>) => void;
  setFieldError: (field: keyof BookImportDataType, error: string) => void;
}

/**
 * Custom hook for managing book form state and validation
 */
export function useBookForm(
  initialData: Partial<BookImportDataType> = {},
  mode: "create" | "edit" | "queue-edit" = "edit"
): UseBookFormReturn {
  const [formState, setFormState] = useState<FormState>({
    data: { ...initialBookImportData, ...initialData },
    errors: {},
    touched: {},
    isDirty: false,
    isValid: false,
  });

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (field: keyof BookImportDataType, value: any): string | null => {
      switch (field) {
        case "title":
          return (
            validateRequired(value, "Title") ||
            validateLength(value, "Title", 1, 500)
          );

        case "authors":
          return validateRequired(value, "At least one author");

        case "isbn13":
          if (mode === "create" && (!value || value.trim() === "")) {
            // ISBN optional for manual entry
            return null;
          }
          return validateRequired(value, "ISBN-13") || validateISBN13(value);

        case "isbn10":
          if (!value || value.trim() === "") return null; // Optional
          return validateISBN10(value);

        case "pageCount":
          if (!value || value === 0) return null; // Optional
          return validateNumberRange(value, "Page count", 1, 10000);

        case "datePublished":
          if (!value || value.trim() === "") return null; // Optional
          return validateDate(value);

        case "synopsis":
          if (!value || value.trim() === "") return null; // Optional
          return validateLength(value, "Synopsis", 0, 5000);

        case "publisher":
          if (!value || value.trim() === "") return null; // Optional
          return validateLength(value, "Publisher", 0, 500);

        case "titleLong":
          if (!value || value.trim() === "") return null; // Optional
          return validateLength(value, "Long title", 0, 1000);

        default:
          return null;
      }
    },
    [mode]
  );

  /**
   * Handle field value change
   */
  const handleChange = useCallback(
    <K extends keyof BookImportDataType>(
      field: K,
      value: BookImportDataType[K]
    ) => {
      setFormState((prev) => {
        const newData = { ...prev.data, [field]: value };
        const error = validateField(field, value);
        const newErrors = { ...prev.errors };

        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }

        return {
          ...prev,
          data: newData,
          errors: newErrors,
          isDirty: true,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateField]
  );

  /**
   * Handle field blur (for on-blur validation)
   */
  const handleBlur = useCallback(
    (field: keyof BookImportDataType) => {
      setFormState((prev) => {
        const error = validateField(field, prev.data[field]);
        const newErrors = { ...prev.errors };
        const newTouched = { ...prev.touched, [field]: true };

        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }

        return {
          ...prev,
          errors: newErrors,
          touched: newTouched,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateField]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    const fields: (keyof BookImportDataType)[] = [
      "title",
      "authors",
      "isbn13",
      "isbn10",
      "pageCount",
      "datePublished",
      "synopsis",
      "publisher",
      "titleLong",
    ];

    fields.forEach((field) => {
      const error = validateField(field, formState.data[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Mark all fields as touched
    const allTouched: FormTouched = {};
    fields.forEach((field) => {
      allTouched[field] = true;
    });

    setFormState((prev) => ({
      ...prev,
      errors,
      touched: allTouched,
      isValid: Object.keys(errors).length === 0,
    }));

    return Object.keys(errors).length === 0;
  }, [formState.data, validateField]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback((newInitialData?: Partial<BookImportDataType>) => {
    setFormState({
      data: { ...initialBookImportData, ...(newInitialData || {}) },
      errors: {},
      touched: {},
      isDirty: false,
      isValid: false,
    });
  }, []);

  /**
   * Manually set field error (for server-side validation)
   */
  const setFieldError = useCallback(
    (field: keyof BookImportDataType, error: string) => {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [field]: error },
        isValid: false,
      }));
    },
    []
  );

  return {
    formState,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldError,
  };
}

"use client";

import { FC, useState } from "react";
import { BookImportDataType } from "@/shared.types";
import { useBookForm } from "@/hooks/useBookForm";
import TextField from "./fields/TextField";
import TextArea from "./fields/TextArea";
import ArrayField from "./fields/ArrayField";
import NumberField from "./fields/NumberField";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookFormProps {
  mode: "create" | "edit" | "queue-edit";
  initialData?: Partial<BookImportDataType>;
  onSubmit: (data: BookImportDataType) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
}

const FormSection: FC<SectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  collapsible = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-zinc-800 pb-6 last:border-0">
      <button
        type="button"
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center justify-between w-full mb-4",
          collapsible && "cursor-pointer hover:text-zinc-100",
          !collapsible && "cursor-default"
        )}
        disabled={!collapsible}
      >
        <h3 className="text-lg font-semibold text-zinc-100">
          {title}
        </h3>
        {collapsible && (
          isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )
        )}
      </button>

      {isExpanded && <div className="space-y-4">{children}</div>}
    </div>
  );
};

const BookForm: FC<BookFormProps> = ({
  mode,
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    formState,
    handleChange,
    handleBlur,
    validateForm,
  } = useBookForm(initialData, mode);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      setSubmitError("Please fix the errors before submitting");
      return;
    }

    try {
      await onSubmit(formState.data);
      setHasUnsavedChanges(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    }
  };

  const handleCancelClick = () => {
    if (hasUnsavedChanges && formState.isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }
    onCancel();
  };

  const errorCount = Object.keys(formState.errors).filter(
    (key) => formState.touched[key as keyof BookImportDataType]
  ).length;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Error summary */}
      {submitError && (
        <div
          className="p-4 bg-red-950/50 border border-red-500/50 rounded-lg flex items-start gap-3"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">Error</p>
            <p className="text-sm text-red-200 mt-1">{submitError}</p>
          </div>
        </div>
      )}

      {errorCount > 0 && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-200">
            Please fix {errorCount} error{errorCount > 1 ? "s" : ""} before submitting
          </p>
        </div>
      )}

      {/* Basic Information */}
      <FormSection title="Basic Information" defaultExpanded>
        <TextField
          label="Title"
          name="title"
          value={formState.data.title}
          onChange={(value) => {
            handleChange("title", value);
            setHasUnsavedChanges(true);
          }}
          onBlur={() => handleBlur("title")}
          error={formState.touched.title ? formState.errors.title : undefined}
          required
          placeholder="Enter book title"
          maxLength={500}
        />

        <ArrayField
          label="Authors"
          name="authors"
          values={formState.data.authors}
          onChange={(value) => {
            handleChange("authors", value);
            setHasUnsavedChanges(true);
          }}
          onBlur={() => handleBlur("authors")}
          error={formState.touched.authors ? formState.errors.authors : undefined}
          required
          placeholder="Type author name and press Enter"
          helpText="Press Enter or comma to add multiple authors"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextField
            label="ISBN-13"
            name="isbn13"
            value={formState.data.isbn13}
            onChange={(value) => {
              handleChange("isbn13", value);
              setHasUnsavedChanges(true);
            }}
            onBlur={() => handleBlur("isbn13")}
            error={formState.touched.isbn13 ? formState.errors.isbn13 : undefined}
            required={mode !== "create"}
            placeholder="978-0-123456-78-9"
            helpText="13 digits starting with 978 or 979"
            maxLength={17}
          />

          <TextField
            label="ISBN-10"
            name="isbn10"
            value={formState.data.isbn10}
            onChange={(value) => {
              handleChange("isbn10", value);
              setHasUnsavedChanges(true);
            }}
            onBlur={() => handleBlur("isbn10")}
            error={formState.touched.isbn10 ? formState.errors.isbn10 : undefined}
            placeholder="0-123456789-X"
            helpText="Optional, 10 characters"
            maxLength={13}
          />
        </div>

        <TextField
          label="Language"
          name="language"
          value={formState.data.language}
          onChange={(value) => {
            handleChange("language", value);
            setHasUnsavedChanges(true);
          }}
          placeholder="English"
        />
      </FormSection>

      {/* Publication Details */}
      <FormSection title="Publication Details" defaultExpanded>
        <TextField
          label="Publisher"
          name="publisher"
          value={formState.data.publisher}
          onChange={(value) => {
            handleChange("publisher", value);
            setHasUnsavedChanges(true);
          }}
          placeholder="Publisher name"
          maxLength={500}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextField
            label="Publication Date"
            name="datePublished"
            value={formState.data.datePublished}
            onChange={(value) => {
              handleChange("datePublished", value);
              setHasUnsavedChanges(true);
            }}
            onBlur={() => handleBlur("datePublished")}
            error={
              formState.touched.datePublished
                ? formState.errors.datePublished
                : undefined
            }
            placeholder="YYYY-MM-DD"
            helpText="Format: YYYY, YYYY-MM, or YYYY-MM-DD"
          />

          <NumberField
            label="Page Count"
            name="pageCount"
            value={formState.data.pageCount}
            onChange={(value) => {
              handleChange("pageCount", value);
              setHasUnsavedChanges(true);
            }}
            onBlur={() => handleBlur("pageCount")}
            error={
              formState.touched.pageCount
                ? formState.errors.pageCount
                : undefined
            }
            placeholder="0"
            min={0}
            max={10000}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TextField
            label="Edition"
            name="edition"
            value={formState.data.edition}
            onChange={(value) => {
              handleChange("edition", value);
              setHasUnsavedChanges(true);
            }}
            placeholder="1st Edition"
          />

          <TextField
            label="Binding"
            name="binding"
            value={formState.data.binding}
            onChange={(value) => {
              handleChange("binding", value);
              setHasUnsavedChanges(true);
            }}
            placeholder="Hardcover, Paperback, etc."
          />
        </div>
      </FormSection>

      {/* Content */}
      <FormSection title="Content" defaultExpanded collapsible>
        <TextArea
          label="Synopsis"
          name="synopsis"
          value={formState.data.synopsis}
          onChange={(value) => {
            handleChange("synopsis", value);
            setHasUnsavedChanges(true);
          }}
          onBlur={() => handleBlur("synopsis")}
          error={
            formState.touched.synopsis
              ? formState.errors.synopsis
              : undefined
          }
          placeholder="Enter book description..."
          rows={6}
          maxLength={5000}
        />

        <ArrayField
          label="Subjects"
          name="subjects"
          values={formState.data.subjects}
          onChange={(value) => {
            handleChange("subjects", value);
            setHasUnsavedChanges(true);
          }}
          placeholder="Type subject and press Enter"
          helpText="Add categories or topics this book covers"
        />
      </FormSection>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button
          type="button"
          onClick={handleCancelClick}
          variant="outline"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[48px] md:min-h-[44px] text-base md:text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formState.isValid}
          className="w-full sm:w-auto min-h-[48px] md:min-h-[44px] text-base md:text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;

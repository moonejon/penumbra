"use client";

import { FC, useState, useEffect, useRef, KeyboardEvent } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import _ from "lodash";

type AutoCompleteSearchProps = {
  filterType: "authors" | "subjects";
  values: string[];
  selectedValues?: string[];
  onChange?: (values: string[]) => void;
  inDropdown?: boolean;
};

const AutoCompleteSearch: FC<AutoCompleteSearchProps> = ({
  filterType,
  values,
  selectedValues = [],
  onChange,
  inDropdown = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(selectedValues);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Update local state when selectedValues prop changes
  useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search query
  const filteredOptions = values.filter((value) =>
    value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Remove already selected options from dropdown
  const availableOptions = filteredOptions.filter(
    (value) => !selected.includes(value)
  );

  const handleSearchChange = (newValues: string[]) => {
    if (inDropdown && onChange) {
      // When used in dropdown, just update local state
      onChange(newValues);
    } else {
      // Original behavior - immediately update URL
      const params = new URLSearchParams(searchParams);
      if (newValues.length > 0) {
        params.set(filterType, newValues.toString());
      } else {
        params.delete(filterType);
      }
      params.delete("page");
      router.push(`library/?${params.toString()}`);
    }
  };

  // Debounced version for URL updates
  const debouncedHandleSearchChange = _.debounce(handleSearchChange, 500);

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];

    setSelected(newSelected);

    if (inDropdown) {
      handleSearchChange(newSelected);
    } else {
      debouncedHandleSearchChange(newSelected);
    }
  };

  const handleRemove = (value: string) => {
    const newSelected = selected.filter((v) => v !== value);
    setSelected(newSelected);

    if (inDropdown) {
      handleSearchChange(newSelected);
    } else {
      debouncedHandleSearchChange(newSelected);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Input Container */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          inputRef.current?.focus();
        }}
        className={`min-h-[42px] w-full px-3 py-2 bg-zinc-900/50 border rounded-lg cursor-text transition-all duration-200 ${
          isOpen
            ? "border-zinc-700 ring-2 ring-zinc-700"
            : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {/* Selected Pills */}
          {selected.map((value) => (
            <div
              key={value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300"
            >
              <span className="max-w-[150px] truncate">{value}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(value);
                }}
                className="p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 rounded"
                aria-label={`Remove ${value}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            placeholder={selected.length === 0 ? filterType : ""}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
        </div>

        {/* Dropdown Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown
            className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-[300px] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50">
          {availableOptions.length > 0 ? (
            <div className="py-1">
              {availableOptions.map((value) => {
                const isSelected = selected.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => handleToggle(value)}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors duration-150 flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{value}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-zinc-500">
                {searchQuery
                  ? "No matching options"
                  : selected.length > 0
                  ? "All options selected"
                  : "No options available"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteSearch;

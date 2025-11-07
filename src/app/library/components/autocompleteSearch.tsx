"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FC, useState, useRef, useEffect } from "react";

type AutoCompleteSearchProps = {
  filterType: "authors" | "subjects";
  values: string[];
};

const AutoCompleteSearch: FC<AutoCompleteSearchProps> = ({
  filterType,
  values,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleValue = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    setSelectedValues(newSelected);

    const params = new URLSearchParams(searchParams);
    if (newSelected.length > 0) {
      params.set(filterType, newSelected.toString());
    } else {
      params.delete(filterType);
    }
    params.delete("page");
    router.push(`library/?${params.toString()}`);
  };

  const filteredValues = values.filter((value) =>
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayLabel =
    filterType === "authors" ? "Filter by Author" : "Filter by Subject";

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {displayLabel}
      </label>

      {/* Selected pills */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-terracotta text-white"
            >
              {value}
              <button
                onClick={() => handleToggleValue(value)}
                className="hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${filterType}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors bg-white placeholder-gray-400"
        />

        {/* Dropdown */}
        {isOpen && filteredValues.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredValues.map((value) => (
              <button
                key={value}
                onClick={() => handleToggleValue(value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedValues.includes(value)
                    ? "bg-terracotta/10 text-terracotta font-medium"
                    : "text-gray-700"
                }`}
              >
                {selectedValues.includes(value) && (
                  <span className="mr-2">✓</span>
                )}
                {value}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoCompleteSearch;
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
    filterType === "authors" ? "Author" : "Subject";

  return (
    <div className="relative group" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {displayLabel}
      </label>

      {/* Selected pills */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20 font-medium hover:bg-terracotta/20 transition-colors"
            >
              {value}
              <button
                onClick={() => handleToggleValue(value)}
                className="hover:text-terracotta/80 transition-colors ml-1"
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
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all bg-white placeholder-gray-400 group-hover:border-gray-400"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>

        {/* Dropdown */}
        {isOpen && filteredValues.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {filteredValues.map((value) => (
              <button
                key={value}
                onClick={() => handleToggleValue(value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  selectedValues.includes(value)
                    ? "bg-terracotta/5 text-terracotta font-medium"
                    : "text-gray-700"
                }`}
              >
                {selectedValues.includes(value) && (
                  <span className="mr-2 text-terracotta">✓</span>
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
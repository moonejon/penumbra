"use client";

import { FC, useState, useEffect, useRef, KeyboardEvent } from "react";
import { X, Loader2, RotateCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchSuggestion } from "@/shared.types";

type IntelligentSearchProps = {
  onClose?: () => void;
};

const IntelligentSearch: FC<IntelligentSearchProps> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion>({
    authors: [],
    titles: [],
    subjects: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track active filters from URL params
  const activeTitle = searchParams.get("title");
  const activeAuthors = searchParams.get("authors");
  const activeSubjects = searchParams.get("subjects");
  const hasActiveFilters = !!(activeTitle || activeAuthors || activeSubjects);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length === 0) {
      setSuggestions({ authors: [], titles: [], subjects: [] });
      setIsOpen(false);
      setTotalItems(0);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/library/search-suggestions?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          console.error("Search suggestions API error:", response.status);
          setError("Failed to load suggestions. Please try again.");
          setSuggestions({ authors: [], titles: [], subjects: [] });
          setTotalItems(0);
          setIsOpen(true);
          return;
        }

        const data = await response.json();

        // Validate response structure
        if (!data || typeof data !== "object") {
          console.error("Invalid response structure:", data);
          setError("Invalid response received. Please try again.");
          setSuggestions({ authors: [], titles: [], subjects: [] });
          setTotalItems(0);
          setIsOpen(true);
          return;
        }

        // Ensure all required fields exist with defaults
        const validatedData: SearchSuggestion = {
          authors: Array.isArray(data.authors) ? data.authors : [],
          titles: Array.isArray(data.titles) ? data.titles : [],
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        };

        setSuggestions(validatedData);
        setTotalItems(
          validatedData.authors.length +
            validatedData.titles.length +
            validatedData.subjects.length
        );
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setError("Network error. Please check your connection and try again.");
        setSuggestions({ authors: [], titles: [], subjects: [] });
        setTotalItems(0);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get flat list of all items for keyboard navigation
  const getFlatItems = () => {
    const items: Array<{
      type: "author" | "title" | "subject";
      value: string;
      id?: number;
    }> = [];

    suggestions.authors.forEach((author) => {
      items.push({ type: "author", value: author });
    });

    suggestions.titles.forEach((title) => {
      items.push({ type: "title", value: title.title, id: title.id });
    });

    suggestions.subjects.forEach((subject) => {
      items.push({ type: "subject", value: subject });
    });

    return items;
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (event.key === "Enter" && query.trim()) {
        // Search by title when pressing Enter
        handleTitleSearch(query);
      }
      return;
    }

    const flatItems = getFlatItems();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
          const item = flatItems[selectedIndex];
          handleSelection(item.type, item.value);
        } else if (query.trim()) {
          handleTitleSearch(query);
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle selection of a suggestion
  const handleSelection = (
    type: "author" | "title" | "subject",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    switch (type) {
      case "author":
        // Filter library by author
        params.set("authors", value);
        params.delete("title");
        params.delete("subjects");
        router.push(`/library/?${params.toString()}`);
        break;
      case "title":
        // Filter library by exact title match
        params.set("title", value);
        params.delete("authors");
        params.delete("subjects");
        router.push(`/library/?${params.toString()}`);
        break;
      case "subject":
        // Filter library by subject
        params.set("subjects", value);
        params.delete("title");
        params.delete("authors");
        router.push(`/library/?${params.toString()}`);
        break;
    }

    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    onClose?.();
  };

  // Handle title text search
  const handleTitleSearch = (searchText: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("title", searchText);
    params.delete("page");
    params.delete("authors");
    params.delete("subjects");
    router.push(`/library/?${params.toString()}`);
    setIsOpen(false);
    onClose?.();
  };

  // Handle retry of failed search
  const handleRetry = () => {
    setError(null);
    // Trigger the search again by modifying query slightly and back
    const currentQuery = query;
    setQuery("");
    setTimeout(() => setQuery(currentQuery), 0);
  };

  // Handle clear all filters
  const handleClearAll = () => {
    router.push("/library");
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  // Handle removing individual filter
  const handleRemoveFilter = (filterType: "title" | "authors" | "subjects") => {
    const params = new URLSearchParams(searchParams);
    params.delete(filterType);
    params.delete("page");
    router.push(`/library/?${params.toString()}`);
  };

  // Render suggestion sections
  const renderSection = (
    title: string,
    items: Array<{ value: string; id?: number }>,
    type: "author" | "title" | "subject",
    startIndex: number
  ) => {
    if (items.length === 0) return null;

    return (
      <div key={type}>
        <div className="px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          {title}
        </div>
        {items.map((item, index) => {
          const absoluteIndex = startIndex + index;
          const isSelected = selectedIndex === absoluteIndex;
          return (
            <button
              key={`${type}-${index}`}
              onClick={() => handleSelection(type, item.value)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 ${
                isSelected
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-300 hover:bg-zinc-900/50"
              }`}
            >
              <div className="truncate">{item.value}</div>
            </button>
          );
        })}
        <div className="border-b border-zinc-800" />
      </div>
    );
  };

  const hasResults = totalItems > 0;

  return (
    <div className="w-full">
      <div className="relative w-full">
        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title, author, or subject..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim() && hasResults) {
                setIsOpen(true);
              }
            }}
            className="w-full px-4 py-2.5 pr-12 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-200"
          />

          {/* Loading spinner or clear button */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
            )}
            {hasActiveFilters && !isLoading && (
              <button
                onClick={handleClearAll}
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 rounded"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && query.trim().length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-[400px] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50"
          >
            {error ? (
              <div className="p-4">
                <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-red-300 font-medium mb-1">Error</p>
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 bg-red-950/50 hover:bg-red-950 border border-red-900/50 hover:border-red-800 rounded transition-all duration-150"
                    >
                      <RotateCw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            ) : hasResults ? (
              <div>
                <div className="px-3 py-2 border-b border-zinc-800">
                  <p className="text-xs text-zinc-500">
                    Press Enter to search titles for &quot;{query}&quot;
                  </p>
                </div>
                {renderSection(
                  "Authors",
                  suggestions.authors.map((a) => ({ value: a })),
                  "author",
                  0
                )}
                {renderSection(
                  "Titles",
                  suggestions.titles.map((t) => ({
                    value: t.title,
                    id: t.id,
                  })),
                  "title",
                  suggestions.authors.length
                )}
                {renderSection(
                  "Subjects",
                  suggestions.subjects.map((s) => ({ value: s })),
                  "subject",
                  suggestions.authors.length + suggestions.titles.length
                )}
              </div>
            ) : (
              !isLoading && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-zinc-400 mb-1">
                    No suggestions found
                  </p>
                  <p className="text-xs text-zinc-500">
                    Press Enter to search for &quot;{query}&quot;
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {activeTitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-300">
              <span className="font-medium">Title:</span>
              <span className="text-zinc-400 truncate max-w-[200px]">{activeTitle}</span>
              <button
                onClick={() => handleRemoveFilter("title")}
                className="ml-1 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 rounded"
                aria-label="Remove title filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {activeAuthors && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-300">
              <span className="font-medium">Author:</span>
              <span className="text-zinc-400 truncate max-w-[200px]">{activeAuthors}</span>
              <button
                onClick={() => handleRemoveFilter("authors")}
                className="ml-1 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 rounded"
                aria-label="Remove author filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {activeSubjects && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-300">
              <span className="font-medium">Subject:</span>
              <span className="text-zinc-400 truncate max-w-[200px]">{activeSubjects}</span>
              <button
                onClick={() => handleRemoveFilter("subjects")}
                className="ml-1 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 rounded"
                aria-label="Remove subject filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelligentSearch;

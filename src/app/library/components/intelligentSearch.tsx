"use client";

import { FC, useState, useEffect, useRef, KeyboardEvent, MouseEvent } from "react";
import { X, Loader2, RotateCw, Plus } from "lucide-react";
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
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track active filters from URL params (now supporting comma-separated values)
  const activeTitle = searchParams.get("title");
  const activeAuthors = searchParams.get("authors");
  const activeSubjects = searchParams.get("subjects");
  const hasActiveFilters = !!(activeTitle || activeAuthors || activeSubjects);

  // Parse comma-separated filter values
  const activeTitles = activeTitle ? activeTitle.split(",").filter(Boolean) : [];
  const activeAuthorsList = activeAuthors ? activeAuthors.split(",").filter(Boolean) : [];
  const activeSubjectsList = activeSubjects ? activeSubjects.split(",").filter(Boolean) : [];

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

  // Track keyboard modifiers for additive vs replacement behavior
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.shiftKey || e.altKey) {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: globalThis.KeyboardEvent) => {
      if (!e.shiftKey && !e.altKey) {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
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

  // Handle selection of a suggestion with support for additive filtering
  const handleSelection = (
    type: "author" | "title" | "subject",
    value: string,
    event?: MouseEvent<HTMLButtonElement>
  ) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    // Check if modifier key was pressed (Shift or Alt) or if event has modifiers
    const shouldReplace = isShiftPressed || event?.shiftKey || event?.altKey;

    switch (type) {
      case "author": {
        if (shouldReplace) {
          // Replace all filters with just this author
          params.set("authors", value);
          params.delete("title");
          params.delete("subjects");
        } else {
          // Add to existing authors (additive filtering)
          const existingAuthors = params.get("authors");
          const authorsList = existingAuthors ? existingAuthors.split(",").filter(Boolean) : [];

          // Only add if not already present
          if (!authorsList.includes(value)) {
            authorsList.push(value);
            params.set("authors", authorsList.join(","));
          }
        }
        break;
      }
      case "title": {
        if (shouldReplace) {
          // Replace all filters with just this title
          params.set("title", value);
          params.delete("authors");
          params.delete("subjects");
        } else {
          // Add to existing titles (additive filtering)
          const existingTitles = params.get("title");
          const titlesList = existingTitles ? existingTitles.split(",").filter(Boolean) : [];

          // Only add if not already present
          if (!titlesList.includes(value)) {
            titlesList.push(value);
            params.set("title", titlesList.join(","));
          }
        }
        break;
      }
      case "subject": {
        if (shouldReplace) {
          // Replace all filters with just this subject
          params.set("subjects", value);
          params.delete("title");
          params.delete("authors");
        } else {
          // Add to existing subjects (additive filtering)
          const existingSubjects = params.get("subjects");
          const subjectsList = existingSubjects ? existingSubjects.split(",").filter(Boolean) : [];

          // Only add if not already present
          if (!subjectsList.includes(value)) {
            subjectsList.push(value);
            params.set("subjects", subjectsList.join(","));
          }
        }
        break;
      }
    }

    router.push(`/library/?${params.toString()}`);
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

  // Handle removing individual filter value
  const handleRemoveFilter = (
    filterType: "title" | "authors" | "subjects",
    value?: string
  ) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    if (value) {
      // Remove specific value from comma-separated list
      const currentValue = params.get(filterType);
      if (currentValue) {
        const valuesList = currentValue.split(",").filter(Boolean);
        const updatedList = valuesList.filter((v) => v !== value);

        if (updatedList.length > 0) {
          params.set(filterType, updatedList.join(","));
        } else {
          params.delete(filterType);
        }
      }
    } else {
      // Remove entire filter type
      params.delete(filterType);
    }

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
              onClick={(e) => handleSelection(type, item.value, e)}
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
    <div className="w-full space-y-3">
      {/* Active Filter Pills - Now Above Search Input */}
      {hasActiveFilters && (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Filters
            </span>
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded transition-all duration-150"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTitles.map((title) => (
              <div
                key={`title-${title}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-700/50 border border-zinc-600/50 rounded-lg text-xs"
              >
                <span className="font-semibold text-zinc-300">Title:</span>
                <span className="text-zinc-100 truncate max-w-[200px]">{title}</span>
                <button
                  onClick={() => handleRemoveFilter("title", title)}
                  className="ml-1 p-0.5 text-zinc-400 hover:text-zinc-100 transition-colors duration-150 rounded hover:bg-zinc-600/30"
                  aria-label={`Remove title filter: ${title}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {activeAuthorsList.map((author) => (
              <div
                key={`author-${author}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/50 border border-blue-800/50 rounded-lg text-xs"
              >
                <span className="font-semibold text-blue-200">Author:</span>
                <span className="text-blue-100 truncate max-w-[200px]">{author}</span>
                <button
                  onClick={() => handleRemoveFilter("authors", author)}
                  className="ml-1 p-0.5 text-blue-300 hover:text-blue-100 transition-colors duration-150 rounded hover:bg-blue-800/30"
                  aria-label={`Remove author filter: ${author}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {activeSubjectsList.map((subject) => (
              <div
                key={`subject-${subject}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/50 border border-purple-800/50 rounded-lg text-xs"
              >
                <span className="font-semibold text-purple-200">Subject:</span>
                <span className="text-purple-100 truncate max-w-[200px]">{subject}</span>
                <button
                  onClick={() => handleRemoveFilter("subjects", subject)}
                  className="ml-1 p-0.5 text-purple-300 hover:text-purple-100 transition-colors duration-150 rounded hover:bg-purple-800/30"
                  aria-label={`Remove subject filter: ${subject}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

          {/* Loading spinner */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
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
                {/* Mode Indicator */}
                <div className="px-3 py-2.5 border-b border-zinc-800 bg-zinc-900/50">
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2 mb-2">
                      {isShiftPressed ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-900/30 border border-amber-800/50">
                            <X className="w-3 h-3 text-amber-400" />
                          </div>
                          <span className="text-amber-300 font-medium">
                            Click to start new search (replace filters)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="flex items-center justify-center w-5 h-5 rounded bg-green-900/30 border border-green-800/50">
                            <Plus className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-green-300 font-medium">
                            Click to refine current results
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-zinc-500">
                    {(() => {
                      const flatItems = getFlatItems();
                      if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
                        const selectedItem = flatItems[selectedIndex];
                        switch (selectedItem.type) {
                          case "author":
                            return `Press Enter to filter by author: "${selectedItem.value}"`;
                          case "title":
                            return `Press Enter to view book: "${selectedItem.value}"`;
                          case "subject":
                            return `Press Enter to filter by subject: "${selectedItem.value}"`;
                          default:
                            return `Press Enter to search titles for "${query}"`;
                        }
                      }
                      return hasActiveFilters
                        ? `Press Enter to search titles for "${query}" • Shift+Click to replace filters`
                        : `Press Enter to search titles for "${query}"`;
                    })()}
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
    </div>
  );
};

export default IntelligentSearch;

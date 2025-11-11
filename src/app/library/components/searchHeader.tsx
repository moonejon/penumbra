"use client";

import { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import IntelligentSearch from "./intelligentSearch";
import { LayoutList, LayoutGrid } from "lucide-react";
import PageSizeSelector, { PageSizeOption } from "./pageSizeSelector";

export type ViewMode = "list" | "grid";

type SearchHeaderProps = {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  pageSize?: number;
  pageSizeOptions?: PageSizeOption[];
  onPageSizeChange?: (pageSize: number) => void;
  isHidden?: boolean;
};

const SearchHeader: FC<SearchHeaderProps> = ({
  viewMode = "list",
  onViewModeChange,
  pageSize,
  pageSizeOptions = [],
  onPageSizeChange,
  isHidden = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Track active filters from URL params
  const activeTitle = searchParams.get("title");
  const activeAuthors = searchParams.get("authors");
  const activeSubjects = searchParams.get("subjects");
  const hasActiveFilters = !!(activeTitle || activeAuthors || activeSubjects);

  // Parse comma-separated filter values
  const activeTitles = activeTitle ? activeTitle.split(",").filter(Boolean) : [];
  const activeAuthorsList = activeAuthors ? activeAuthors.split(",").filter(Boolean) : [];
  const activeSubjectsList = activeSubjects ? activeSubjects.split(",").filter(Boolean) : [];

  // Handle clear all filters
  const handleClearAll = () => {
    router.push("/library");
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

  if (isHidden) return null;

  return (
    <div className="w-full sticky top-14 z-40 bg-zinc-950/80 backdrop-blur-lg">
      {/* Controls row */}
      <div className="py-3 sm:py-4 border-b border-zinc-800/50">
        <div className="flex gap-2 sm:gap-4">
          {/* Search takes up most width */}
          <div className="flex-1 min-w-0">
            <IntelligentSearch />
          </div>

          {/* Page Size Selector */}
          {onPageSizeChange && pageSize && pageSizeOptions.length > 0 && (
            <PageSizeSelector
              pageSize={pageSize}
              options={pageSizeOptions}
              onChange={onPageSizeChange}
            />
          )}

          {/* View Toggle */}
          {onViewModeChange && (
            <div className="flex items-center gap-1 border border-zinc-800 rounded-lg p-1 bg-zinc-900/50 h-[42px]">
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-2.5 sm:p-1.5 min-w-[44px] min-h-[44px] rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                title="List view"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2.5 sm:p-1.5 min-w-[44px] min-h-[44px] rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                title="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter pills row - FULL WIDTH, BELOW CONTROLS */}
      {hasActiveFilters && (
        <div className="w-full overflow-x-auto py-3 sm:py-4 hide-scrollbar">
          <div className="flex gap-2">
            {activeTitles.map((title) => (
              <div
                key={`title-${title}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-md text-xs flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-200"
              >
                <span className="text-blue-300 truncate max-w-[120px]">{title}</span>
                <button
                  onClick={() => handleRemoveFilter("title", title)}
                  className="p-1 text-blue-400 hover:text-blue-200"
                  aria-label={`Remove title filter: ${title}`}
                  style={{ minWidth: '24px', minHeight: '24px' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {activeAuthorsList.map((author) => (
              <div
                key={`author-${author}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-600/20 border border-green-500/30 rounded-md text-xs flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-200"
              >
                <span className="text-green-300 truncate max-w-[120px]">{author}</span>
                <button
                  onClick={() => handleRemoveFilter("authors", author)}
                  className="p-1 text-green-400 hover:text-green-200"
                  aria-label={`Remove author filter: ${author}`}
                  style={{ minWidth: '24px', minHeight: '24px' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {activeSubjectsList.map((subject) => (
              <div
                key={`subject-${subject}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-md text-xs flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-200"
              >
                <span className="text-purple-300 truncate max-w-[120px]">{subject}</span>
                <button
                  onClick={() => handleRemoveFilter("subjects", subject)}
                  className="p-1 text-purple-400 hover:text-purple-200"
                  aria-label={`Remove subject filter: ${subject}`}
                  style={{ minWidth: '24px', minHeight: '24px' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {/* Clear all button at the end of the row */}
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-md flex-shrink-0 transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHeader;

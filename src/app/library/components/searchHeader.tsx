"use client";

import { FC } from "react";
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
  if (isHidden) return null;

  return (
    <div className="w-full sticky top-14 z-40 py-3 sm:py-4 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/50">
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
              className={`p-1.5 rounded-md transition-all duration-200 ${
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
              className={`p-1.5 rounded-md transition-all duration-200 ${
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
  );
};

export default SearchHeader;

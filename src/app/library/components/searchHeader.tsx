"use client";

import { FC } from "react";
import IntelligentSearch from "./intelligentSearch";

const SearchHeader: FC = () => {
  return (
    <div className="w-full sticky top-16 z-40 py-3 sm:py-4 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-screen-sm mx-auto px-4">
        <div className="flex gap-2 sm:gap-4">
          {/* Search takes up full width */}
          <div className="flex-1 min-w-0">
            <IntelligentSearch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;

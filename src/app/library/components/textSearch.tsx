"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FC, useCallback } from "react";
import _ from "lodash";

type TextSearchProps = {
  filterType: "title";
};

const TextSearch: FC<TextSearchProps> = ({ filterType }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = useCallback(
    _.debounce((value: string) => {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set(filterType, value);
      } else {
        params.delete(filterType);
      }
      params.delete("page");
      router.push(`library/?${params.toString()}`);
    }, 500),
    [filterType, searchParams, router]
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  };

  if (filterType === "title") {
    return (
      <div className="relative group">
        <label
          htmlFor="title-search"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title
        </label>
        <div className="relative">
          <input
            id="title-search"
            type="text"
            placeholder="Search by title..."
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all bg-white placeholder-gray-400 group-hover:border-gray-400"
            onChange={onChange}
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
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    );
  }
};

export default TextSearch;

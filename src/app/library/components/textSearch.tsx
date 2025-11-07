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
      <div className="relative">
        <label
          htmlFor="title-search"
          className="block text-xs font-medium text-gray-700 mb-1.5"
        >
          Search by Title
        </label>
        <input
          id="title-search"
          type="text"
          placeholder="Enter book title..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors bg-white placeholder-gray-400"
          onChange={onChange}
        />
      </div>
    );
  }
};

export default TextSearch;

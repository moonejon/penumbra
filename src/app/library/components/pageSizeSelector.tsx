"use client";

import { FC } from "react";
import { ChevronDown } from "lucide-react";

export type PageSizeOption = {
  value: number;
  label: string;
};

type PageSizeSelectorProps = {
  pageSize: number;
  options: PageSizeOption[];
  onChange: (pageSize: number) => void;
  disabled?: boolean;
};

const PageSizeSelector: FC<PageSizeSelectorProps> = ({
  pageSize,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2 border border-zinc-800 rounded-lg px-3 py-2 bg-zinc-900/50">
      <label
        htmlFor="page-size-select"
        className="text-sm text-zinc-400 whitespace-nowrap hidden sm:block"
      >
        Per page:
      </label>
      <div className="relative">
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={`appearance-none bg-transparent text-zinc-100 text-sm font-medium pr-6 focus:outline-none cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Items per page"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-zinc-900 text-zinc-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};

export default PageSizeSelector;

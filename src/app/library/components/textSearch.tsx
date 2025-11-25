"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FC } from "react";
import _ from "lodash";

type TextSearchProps = {
  filterType: "title";
};

const TextSearch: FC<TextSearchProps> = ({ filterType }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);

    params.set(filterType, e.target.value);
    params.delete("page");
    router.push(`library/?${params.toString()}`);
  };

  if (filterType == "title") {
    return (
      <div className="w-full">
        <label htmlFor="title-search" className="sr-only">
          Search by title
        </label>
        <Input
          id="title-search"
          type="text"
          placeholder="Search by title..."
          onChange={_.debounce(handleSearchChange, 500)}
          className="w-full"
        />
      </div>
    );
  }


};

export default TextSearch;

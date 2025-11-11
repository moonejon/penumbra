"use client";

import { FC } from "react";
import TextSearch from "./textSearch";
import AutoCompleteSearch from "./autocompleteSearch";

type FiltersProps = {
    authors: string[]
    subjects: string[]
}

const Filters: FC<FiltersProps> = ({ authors, subjects }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 p-8">
        <TextSearch filterType="title" />
        <AutoCompleteSearch filterType="authors" values={authors} />
        <AutoCompleteSearch filterType="subjects" values={subjects} />
      </div>
    </div>
  );
};

export default Filters;

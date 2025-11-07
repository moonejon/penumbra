"use client";

import { FC } from "react";
import TextSearch from "./textSearch";
import AutoCompleteSearch from "./autocompleteSearch";

type SidebarProps = {
  authors: string[];
  subjects: string[];
};

const Sidebar: FC<SidebarProps> = ({ authors, subjects }) => {
  return (
    <aside className="w-full lg:sticky lg:top-6 lg:h-fit">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 p-7 mx-4 lg:mx-6 my-6">
        <div className="mb-6">
          <h2 className="text-xl font-serif font-semibold text-gray-900 mb-1">Discover</h2>
          <p className="text-sm text-gray-500">Search and filter your collection</p>
        </div>

        <div className="space-y-6">
          <TextSearch filterType="title" />
          <AutoCompleteSearch filterType="authors" values={authors} />
          <AutoCompleteSearch filterType="subjects" values={subjects} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

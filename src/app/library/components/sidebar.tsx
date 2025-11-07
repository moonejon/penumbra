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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mx-4 lg:mx-6 my-6">
        <h2 className="text-lg font-bold text-terracotta mb-4">Filters</h2>

        <div className="space-y-4">
          <TextSearch filterType="title" />
          <AutoCompleteSearch filterType="authors" values={authors} />
          <AutoCompleteSearch filterType="subjects" values={subjects} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

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
        <div className="mb-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-terracotta mb-1">Search & Filter</h2>
          <p className="text-xs text-gray-500">Refine your library view</p>
        </div>

        <div className="space-y-5">
          <TextSearch filterType="title" />
          <div className="pt-1">
            <AutoCompleteSearch filterType="authors" values={authors} />
          </div>
          <div className="pt-1">
            <AutoCompleteSearch filterType="subjects" values={subjects} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

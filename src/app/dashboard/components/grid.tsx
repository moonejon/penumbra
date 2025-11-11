"use client";

import { BookType } from "@/shared.types";
import { FC } from "react";

type GridProps = {
  rows: BookType[];
};

const Grid: FC<GridProps> = ({ rows }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full border-collapse bg-zinc-900/50">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Title</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Authors</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Binding</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Publisher</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Pages</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">Published</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-zinc-300">ISBN-13</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((book) => (
            <tr
              key={book.id}
              className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors duration-150"
            >
              <td className="px-4 py-3 text-sm text-zinc-100">{book.title}</td>
              <td className="px-4 py-3 text-sm text-zinc-300">
                {book.authors.join(", ")}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-300">{book.binding}</td>
              <td className="px-4 py-3 text-sm text-zinc-300">{book.publisher}</td>
              <td className="px-4 py-3 text-sm text-zinc-300">{book.pageCount}</td>
              <td className="px-4 py-3 text-sm text-zinc-300">{book.datePublished}</td>
              <td className="px-4 py-3 text-sm text-zinc-300 font-mono">{book.isbn13}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;

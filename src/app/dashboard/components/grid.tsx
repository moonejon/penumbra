"use client";

import { BookType } from "@/shared.types";
import { DataGrid } from "@mui/x-data-grid";
import { FC } from "react";

type GridProps = {
    rows: BookType[];
};

const Grid: FC<GridProps> = ({rows}) => {


  const colNames = [
    "title",
    "authors",
    "binding",
    "publisher",
    "pageCount",
    "datePublished",
  ];

  const columns = colNames.map((colName) => {
    return { field: colName };
  });

  return <DataGrid columns={columns} rows={rows} pagination />;
};

export default Grid

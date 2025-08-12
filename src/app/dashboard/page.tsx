"use client";

import { FC, useEffect, useState } from "react";
import { Container, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid";
import { fetchBooks } from "@/utils/actions/books";
import { BookType } from "@/shared.types";
type DashboardProps = object;

// eslint-disable-next-line no-empty-pattern
const Dashboard: FC<DashboardProps> = ({}) => {
  // TODO: implement server-side data fetching using the customDataSource feature of MUI Data Grid

  //   interface GridDataSource {
  //     /**
  //      * This method is called when the grid needs to fetch rows.
  //      * @param {GridGetRowsParams} params The parameters required to fetch the rows.
  //      * @returns {Promise<GridGetRowsResponse>} A promise that resolves to the data of
  //      * type [GridGetRowsResponse].
  //      */
  //     getRows(params: GridGetRowsParams): Promise<GridGetRowsResponse>;
  //   }

  //   const customDataSource: GridDataSource = {
  //     getRows: async (
  //       params: GridGetRowsParams
  //     ): Promise<GridGetRowsResponse> => {
  //       const response = await fetch('/books');
  //       const data = await response;

  //       console.log(data);

  //       return {
  //         rows: {},
  //         rowCount: {},
  //       };
  //     },
  //   };

  const [rows, setRows] = useState<Array<BookType>>([]);

  const colNames = [
    'title',
    'authors',
    'binding',
    'publisher',
    'pageCount',
    'datePublished',
  ]

  const columns = colNames.map((colName) => {
    return { field: colName};
  });

  useEffect(() => {
    async function fetchRows() {
      const books = await fetchBooks();
      setRows(books);
    }

    fetchRows();
  }, []);

  return <Container sx={{padding: '25px'}}>
    <Typography gutterBottom variant="h3">Dashboard</Typography>
    {<DataGrid columns={columns} rows={rows} pagination />}
    </Container>;
};

export default Dashboard;

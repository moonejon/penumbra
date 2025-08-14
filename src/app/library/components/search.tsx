"use client";

import { TextField } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FC, useState } from "react";
import _ from "lodash";
import theme from "@/theme";

type SearchProps = object;

// eslint-disable-next-line no-empty-pattern
const Search: FC<SearchProps> = ({}) => {
  const [searchType, setSearchType] = useState<string>("title");

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);

    if (searchType === "title") params.set("title", e.target.value);
    params.delete("page");
    router.push(`library/?${params.toString()}`);
  };

  return (
    <>
      <TextField
        id="outlined-basic"
        variant="filled"
        label="title"
        fullWidth
        sx={{ backgroundColor: theme.palette.background.default }}
        onChange={_.debounce(handleSearchChange, 500)}
      />
    </>
  );
};

export default Search;

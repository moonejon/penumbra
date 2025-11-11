"use client";

import { TextField } from "@mui/material";
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
      <TextField
        id="outlined-basic"
        variant="filled"
        label="title"
        onChange={_.debounce(handleSearchChange, 500)}
      />
    );
  }


};

export default TextSearch;

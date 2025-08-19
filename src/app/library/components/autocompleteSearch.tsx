import theme from "@/theme";
import { Autocomplete, TextField } from "@mui/material";
import _ from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, SyntheticEvent } from "react";

type AutoCompleteSearchProps = {
    filterType: 'authors',
    values: string[]
}

const AutoCompleteSearch: FC<AutoCompleteSearchProps> = ({ filterType, values }) => {

    const router = useRouter();
      const searchParams = useSearchParams();
    
      const handleSearchChange = (event: SyntheticEvent, value: string[]) => {
        const params = new URLSearchParams(searchParams);
        params.set(filterType, value.toString())
        params.delete("page");
        router.push(`library/?${params.toString()}`);
      };

    return (
      <Autocomplete
        multiple
        id="tags-outlined"
        options={values}
        // getOptionLabel={(option) => option.title}
        filterSelectedOptions
        defaultValue={[]}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            // label={filterType}
            placeholder={filterType}
            />
        )}
        onChange={_.debounce(handleSearchChange, 500)}
        sx={{ backgroundColor: theme.palette.background.default }}
      />
    );
  }

  export default AutoCompleteSearch
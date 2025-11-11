import { Autocomplete, TextField } from "@mui/material";
import _ from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, SyntheticEvent } from "react";

type AutoCompleteSearchProps = {
    filterType: 'authors' | 'subjects',
    values: string[],
    selectedValues?: string[],
    onChange?: (values: string[]) => void,
    inDropdown?: boolean
}

const AutoCompleteSearch: FC<AutoCompleteSearchProps> = ({
  filterType,
  values,
  selectedValues,
  onChange,
  inDropdown = false
}) => {

    const router = useRouter();
      const searchParams = useSearchParams();

      const handleSearchChange = (event: SyntheticEvent, value: string[]) => {
        if (inDropdown && onChange) {
          // When used in dropdown, just update local state
          onChange(value);
        } else {
          // Original behavior - immediately update URL
          const params = new URLSearchParams(searchParams);
          params.set(filterType, value.toString())
          params.delete("page");
          router.push(`library/?${params.toString()}`);
        }
      };

    return (
      <Autocomplete
        multiple
        id={`${filterType}-autocomplete`}
        options={values}
        filterSelectedOptions
        value={selectedValues || []}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder={filterType}
            size="small"
            />
        )}
        onChange={inDropdown ? handleSearchChange : _.debounce(handleSearchChange, 500)}
      />
    );
  }

  export default AutoCompleteSearch
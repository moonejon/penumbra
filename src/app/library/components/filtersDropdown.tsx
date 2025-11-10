"use client";

import { FC, useState, useRef, useEffect } from "react";
import {
  Button,
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter, useSearchParams } from "next/navigation";
import theme from "@/theme";
import AutoCompleteSearch from "./autocompleteSearch";

type FiltersDropdownProps = {
  authors: string[];
  subjects: string[];
};

const FiltersDropdown: FC<FiltersDropdownProps> = ({ authors, subjects }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize selected filters from URL params
  useEffect(() => {
    const authorsParam = searchParams.get("authors");
    const subjectsParam = searchParams.get("subjects");

    if (authorsParam) {
      setSelectedAuthors(authorsParam.split(","));
    } else {
      setSelectedAuthors([]);
    }

    if (subjectsParam) {
      setSelectedSubjects(subjectsParam.split(","));
    } else {
      setSelectedSubjects([]);
    }
  }, [searchParams]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    // Update authors filter
    if (selectedAuthors.length > 0) {
      params.set("authors", selectedAuthors.join(","));
    } else {
      params.delete("authors");
    }

    // Update subjects filter
    if (selectedSubjects.length > 0) {
      params.set("subjects", selectedSubjects.join(","));
    } else {
      params.delete("subjects");
    }

    router.push(`/library/?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("authors");
    params.delete("subjects");
    params.delete("page");

    setSelectedAuthors([]);
    setSelectedSubjects([]);

    router.push(`/library/?${params.toString()}`);
    setIsOpen(false);
  };

  const activeFilterCount =
    (selectedAuthors.length > 0 ? 1 : 0) + (selectedSubjects.length > 0 ? 1 : 0);

  return (
    <Box sx={{ position: "relative" }}>
      <Button
        ref={buttonRef}
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={handleToggle}
        sx={{
          height: "40px",
          minWidth: "100px",
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        Filters
        {activeFilterCount > 0 && (
          <Chip
            label={activeFilterCount}
            size="small"
            color="primary"
            sx={{
              ml: 1,
              height: "20px",
              minWidth: "20px",
              "& .MuiChip-label": {
                px: 0.5,
                fontSize: "0.7rem",
              },
            }}
          />
        )}
      </Button>

      {isOpen && (
        <Paper
          ref={dropdownRef}
          elevation={8}
          sx={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: "320px",
            maxWidth: "400px",
            zIndex: 1300,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filter Library
              </Typography>
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Authors
                </Typography>
                <AutoCompleteSearch
                  filterType="authors"
                  values={authors}
                  selectedValues={selectedAuthors}
                  onChange={setSelectedAuthors}
                  inDropdown={true}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Subjects
                </Typography>
                <AutoCompleteSearch
                  filterType="subjects"
                  values={subjects}
                  selectedValues={selectedSubjects}
                  onChange={setSelectedSubjects}
                  inDropdown={true}
                />
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
              >
                Clear
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default FiltersDropdown;

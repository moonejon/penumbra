"use client";

import { FC, useState, useEffect, useRef, KeyboardEvent } from "react";
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Divider,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter, useSearchParams } from "next/navigation";
import theme from "@/theme";
import { SearchSuggestion } from "@/shared.types";

type IntelligentSearchProps = {
  onClose?: () => void;
};

const IntelligentSearch: FC<IntelligentSearchProps> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion>({
    authors: [],
    titles: [],
    subjects: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track active filters from URL params
  const activeTitle = searchParams.get("title");
  const activeAuthors = searchParams.get("authors");
  const activeSubjects = searchParams.get("subjects");
  const hasActiveFilters = !!(activeTitle || activeAuthors || activeSubjects);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length === 0) {
      setSuggestions({ authors: [], titles: [], subjects: [] });
      setIsOpen(false);
      setTotalItems(0);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/library/search-suggestions?q=${encodeURIComponent(query)}`
        );

        // FIX #2: Add response validation to prevent crashes
        if (!response.ok) {
          console.error("Search suggestions API error:", response.status);
          setSuggestions({ authors: [], titles: [], subjects: [] });
          setTotalItems(0);
          setIsOpen(false);
          return;
        }

        const data = await response.json();

        // Validate response structure
        if (!data || typeof data !== "object") {
          console.error("Invalid response structure:", data);
          setSuggestions({ authors: [], titles: [], subjects: [] });
          setTotalItems(0);
          setIsOpen(false);
          return;
        }

        // Ensure all required fields exist with defaults
        const validatedData: SearchSuggestion = {
          authors: Array.isArray(data.authors) ? data.authors : [],
          titles: Array.isArray(data.titles) ? data.titles : [],
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        };

        setSuggestions(validatedData);
        setTotalItems(
          validatedData.authors.length +
            validatedData.titles.length +
            validatedData.subjects.length
        );
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions({ authors: [], titles: [], subjects: [] });
        setTotalItems(0);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get flat list of all items for keyboard navigation
  const getFlatItems = () => {
    const items: Array<{
      type: "author" | "title" | "subject";
      value: string;
      id?: number;
    }> = [];

    suggestions.authors.forEach((author) => {
      items.push({ type: "author", value: author });
    });

    suggestions.titles.forEach((title) => {
      items.push({ type: "title", value: title.title, id: title.id });
    });

    suggestions.subjects.forEach((subject) => {
      items.push({ type: "subject", value: subject });
    });

    return items;
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (event.key === "Enter" && query.trim()) {
        // Search by title when pressing Enter
        handleTitleSearch(query);
      }
      return;
    }

    const flatItems = getFlatItems();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
          const item = flatItems[selectedIndex];
          handleSelection(item.type, item.value);
        } else if (query.trim()) {
          handleTitleSearch(query);
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle selection of a suggestion
  const handleSelection = (
    type: "author" | "title" | "subject",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    switch (type) {
      case "author":
        // Filter library by author
        params.set("authors", value);
        params.delete("title");
        params.delete("subjects");
        router.push(`/library/?${params.toString()}`);
        break;
      case "title":
        // Filter library by exact title match
        // This will show just that one book, and user can click to see details
        params.set("title", value);
        params.delete("authors");
        params.delete("subjects");
        router.push(`/library/?${params.toString()}`);
        break;
      case "subject":
        // Filter library by subject
        params.set("subjects", value);
        params.delete("title");
        params.delete("authors");
        router.push(`/library/?${params.toString()}`);
        break;
    }

    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    onClose?.();
  };

  // Handle title text search
  const handleTitleSearch = (searchText: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("title", searchText);
    params.delete("page");
    params.delete("authors");
    params.delete("subjects");
    router.push(`/library/?${params.toString()}`);
    setIsOpen(false);
    onClose?.();
  };

  // Handle clear all filters
  const handleClearAll = () => {
    router.push("/library");
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  // Handle removing individual filter
  const handleRemoveFilter = (filterType: "title" | "authors" | "subjects") => {
    const params = new URLSearchParams(searchParams);
    params.delete(filterType);
    params.delete("page");
    router.push(`/library/?${params.toString()}`);
  };

  // Render suggestion sections
  const renderSection = (
    title: string,
    items: Array<{ value: string; id?: number }>,
    type: "author" | "title" | "subject",
    startIndex: number
  ) => {
    if (items.length === 0) return null;

    return (
      <Box key={type}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: "block",
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "0.7rem",
          }}
        >
          {title}
        </Typography>
        {items.map((item, index) => {
          const absoluteIndex = startIndex + index;
          return (
            <ListItem key={`${type}-${index}`} disablePadding>
              <ListItemButton
                selected={selectedIndex === absoluteIndex}
                onClick={() => handleSelection(type, item.value)}
                sx={{
                  py: 1,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.action.selected,
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemText
                  primary={item.value}
                  primaryTypographyProps={{
                    sx: {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        <Divider />
      </Box>
    );
  };

  const hasResults = totalItems > 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ position: "relative", width: "100%" }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Search by title, author, or subject..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && hasResults) {
              setIsOpen(true);
            }
          }}
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: theme.palette.background.paper,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme.palette.divider,
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <>
                {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                {hasActiveFilters && !isLoading && (
                  <IconButton
                    size="small"
                    onClick={handleClearAll}
                    sx={{
                      mr: -0.5,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                    aria-label="Clear all filters"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ),
          }}
        />

        {isOpen && (query.trim().length > 0) && (
          <Paper
            ref={dropdownRef}
            elevation={8}
            sx={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 1300,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {hasResults ? (
              <List disablePadding>
                {renderSection(
                  "Authors",
                  suggestions.authors.map((a) => ({ value: a })),
                  "author",
                  0
                )}
                {renderSection(
                  "Titles",
                  suggestions.titles.map((t) => ({
                    value: t.title,
                    id: t.id,
                  })),
                  "title",
                  suggestions.authors.length
                )}
                {renderSection(
                  "Subjects",
                  suggestions.subjects.map((s) => ({ value: s })),
                  "subject",
                  suggestions.authors.length + suggestions.titles.length
                )}
                <Box sx={{ px: 2, py: 1, backgroundColor: theme.palette.action.hover }}>
                  <Typography variant="caption" color="text.secondary">
                    Press Enter to search titles for &quot;{query}&quot;
                  </Typography>
                </Box>
              </List>
            ) : (
              !isLoading && (
                <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No suggestions found
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Press Enter to search for &quot;{query}&quot;
                  </Typography>
                </Box>
              )
            )}
          </Paper>
        )}
      </Box>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {activeTitle && (
            <Chip
              label={`Title: ${activeTitle}`}
              size="small"
              onDelete={() => handleRemoveFilter("title")}
              sx={{
                backgroundColor: theme.palette.primary.dark,
                color: theme.palette.primary.contrastText,
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    color: theme.palette.primary.light,
                  },
                },
              }}
            />
          )}
          {activeAuthors && (
            <Chip
              label={`Author: ${activeAuthors}`}
              size="small"
              onDelete={() => handleRemoveFilter("authors")}
              sx={{
                backgroundColor: theme.palette.secondary.dark,
                color: theme.palette.secondary.contrastText,
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.secondary.contrastText,
                  "&:hover": {
                    color: theme.palette.secondary.light,
                  },
                },
              }}
            />
          )}
          {activeSubjects && (
            <Chip
              label={`Subject: ${activeSubjects}`}
              size="small"
              onDelete={() => handleRemoveFilter("subjects")}
              sx={{
                backgroundColor: theme.palette.info.dark,
                color: theme.palette.info.contrastText,
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.info.contrastText,
                  "&:hover": {
                    color: theme.palette.info.light,
                  },
                },
              }}
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

export default IntelligentSearch;

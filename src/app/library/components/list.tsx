"use client";

import { BookType } from "@/shared.types";
import { Dispatch, FC, SetStateAction } from "react";
import { Box, Pagination, Stack, useMediaQuery, Skeleton, Card, CardContent } from "@mui/material";
import Item from "./item";
import { useRouter, useSearchParams } from "next/navigation";
import theme from "@/theme";

type ListProps = {
  rows: BookType[];
  page: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
  pageCount: number;
  isLoading?: boolean;
};

const SkeletonBookCard: FC = () => {
  return (
    <Card
      sx={{
        maxHeight: "200px",
        width: "auto",
      }}
    >
      <CardContent
        sx={{
          paddingLeft: { xs: 1, md: 2 },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={4}
            sx={{
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
                width: "120px",
              }}
            >
              <Skeleton variant="rectangular" width={100} height={160} />
            </Box>
            <Stack
              spacing={{ xs: 2, md: 7 }}
              sx={{ marginLeft: { xs: "1em !important" }, flex: 1 }}
            >
              <Stack spacing={1}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
              </Stack>
              <Stack spacing={0.5}>
                <Skeleton variant="text" width="50%" height={16} />
                <Skeleton variant="text" width="30%" height={16} />
                <Skeleton variant="text" width="20%" height={16} />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const List: FC<ListProps> = ({ rows, page, setSelectedBook, pageCount, isLoading = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (_: unknown, page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`library/?${params.toString()}`);
  };

  const isMobile: boolean = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack spacing={2}>
      {isLoading ? (
        // Show 10 skeleton cards while loading
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBookCard key={i} />
          ))}
        </>
      ) : (
        rows?.map((book, i) => (
          <Item book={book} key={i} setSelectedBook={setSelectedBook} />
        ))
      )}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", py: 2 }}>
        <Pagination
          variant="outlined"
          size={isMobile ? "small" : "large"}
          shape="rounded"
          count={pageCount}
          page={page}
          disabled={isLoading}
          sx={{
            button: {
              background: theme.palette.background.default,
            },
          }}
          onChange={handlePageChange}
        />
      </Box>
    </Stack>
  );
};

export default List;

"use server";

import { Container, Typography } from "@mui/material";
import { fetchBooks } from "@/utils/actions/books";
import Grid from "./components/grid";
type DashboardPageProps = object;

// eslint-disable-next-line no-empty-pattern
export default async function DashboardPage({}: DashboardPageProps) {
  const books = await fetchBooks();

  return (
    <Container sx={{ padding: "25px" }}>
      <Typography gutterBottom variant="h3">
        Dashboard
      </Typography>
      <Grid rows={books} />
    </Container>
  );
}

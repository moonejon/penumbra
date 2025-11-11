"use server";

import { fetchBooks } from "@/utils/actions/books";
import Grid from "./components/grid";
type DashboardPageProps = object;

// eslint-disable-next-line no-empty-pattern
export default async function DashboardPage({}: DashboardPageProps) {
  const books = await fetchBooks();

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-zinc-100">
        Dashboard
      </h1>
      <Grid rows={books} />
    </div>
  );
}

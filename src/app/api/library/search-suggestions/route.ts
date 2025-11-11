import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getViewableBookFilter } from "@/utils/permissions";
import { SearchSuggestion } from "@/shared.types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  // Helper to create response with no-cache headers
  const createResponse = (data: SearchSuggestion) => {
    return NextResponse.json(data, {
      headers: {
        // Prevent caching to ensure suggestions always reflect current database state
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  };

  try {

    if (!query || query.trim().length === 0) {
      return createResponse({
        authors: [],
        titles: [],
        subjects: [],
      } as SearchSuggestion);
    }

    // Minimum query length to reduce noise from single-character searches
    if (query.trim().length < 2) {
      return createResponse({
        authors: [],
        titles: [],
        subjects: [],
      } as SearchSuggestion);
    }

    // Get viewable book filter (handles auth automatically)
    const visibilityFilter = await getViewableBookFilter();

    // Fetch all viewable books to enable comprehensive author/subject search
    // IMPORTANT: Only return authors/subjects from books that currently exist and are viewable
    // This ensures deleted books or non-visible books don't appear in suggestions
    const allBooks = await prisma.book.findMany({
      where: visibilityFilter,
      select: { id: true, title: true, authors: true, subjects: true },
    });

    // Early return if no books found - prevents showing empty suggestions
    if (allBooks.length === 0) {
      return createResponse({
        authors: [],
        titles: [],
        subjects: [],
      } as SearchSuggestion);
    }

    // Extract and filter all matching items with ranking
    const queryLower = query.toLowerCase();

    // Use Maps to track items with their ranking scores
    const titlesMap = new Map<number, { title: string; score: number }>();
    const authorsMap = new Map<string, number>();
    const subjectsMap = new Map<string, number>();

    // Helper function to calculate match score (higher is better)
    const getMatchScore = (text: string, query: string): number => {
      const textLower = text.toLowerCase();
      if (textLower === query) return 1000; // Exact match
      if (textLower.startsWith(query)) return 100; // Prefix match

      // Word boundary match (query starts a word in the text)
      const words = textLower.split(/\s+/);
      for (const word of words) {
        if (word.startsWith(query)) return 50;
      }

      return 1; // Contains match (lowest priority)
    };

    allBooks.forEach((book) => {
      // Check title match
      const titleLower = book.title.toLowerCase();
      if (titleLower.includes(queryLower)) {
        const score = getMatchScore(book.title, queryLower);
        titlesMap.set(book.id, { title: book.title, score });
      }

      // Check author matches
      book.authors.forEach((author) => {
        const authorLower = author.toLowerCase();
        if (authorLower.includes(queryLower)) {
          const score = getMatchScore(author, queryLower);
          // Keep highest score if author appears in multiple books
          authorsMap.set(author, Math.max(authorsMap.get(author) || 0, score));
        }
      });

      // Check subject matches
      book.subjects.forEach((subject) => {
        const subjectLower = subject.toLowerCase();
        if (subjectLower.includes(queryLower)) {
          const score = getMatchScore(subject, queryLower);
          // Keep highest score if subject appears in multiple books
          subjectsMap.set(subject, Math.max(subjectsMap.get(subject) || 0, score));
        }
      });
    });

    // Sort by score (highest first), then alphabetically, and limit to 5 per category
    const authors = Array.from(authorsMap.entries())
      .sort((a, b) => {
        // Sort by score descending, then alphabetically
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([author]) => author)
      .slice(0, 5);

    const titles = Array.from(titlesMap.entries())
      .sort((a, b) => {
        // Sort by score descending, then alphabetically
        if (b[1].score !== a[1].score) return b[1].score - a[1].score;
        return a[1].title.localeCompare(b[1].title);
      })
      .map(([id, { title }]) => ({ id, title }))
      .slice(0, 5);

    const subjects = Array.from(subjectsMap.entries())
      .sort((a, b) => {
        // Sort by score descending, then alphabetically
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([subject]) => subject)
      .slice(0, 5);

    return createResponse({
      authors,
      titles,
      subjects,
    } as SearchSuggestion);
  } catch (error) {
    // FIX #3: Improve error logging with detailed information
    console.error("Search suggestions error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      query: searchParams.get("q"),
    });
    return NextResponse.json(
      { error: "Failed to fetch search suggestions" },
      { status: 500 }
    );
  }
}

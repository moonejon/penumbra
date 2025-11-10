import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getViewableBookFilter } from "@/utils/permissions";
import { Prisma } from "@prisma/client";
import { SearchSuggestion } from "@/shared.types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  try {

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        authors: [],
        titles: [],
        subjects: [],
      } as SearchSuggestion);
    }

    // Get viewable book filter (handles auth automatically)
    const visibilityFilter = await getViewableBookFilter();

    // FIX #1: Rewrite query strategy to support partial matches
    // Fetch books that match by title (this works with contains)
    const booksByTitle = await prisma.book.findMany({
      where: {
        ...visibilityFilter,
        title: { contains: query, mode: Prisma.QueryMode.insensitive },
      },
      select: { id: true, title: true, authors: true, subjects: true },
      take: 50,
    });

    // Also fetch books by author/subject if they have exact name matches
    // to expand results beyond just title matches
    const booksByAuthorOrSubject = await prisma.book.findMany({
      where: {
        ...visibilityFilter,
        OR: [
          { authors: { hasSome: [query] } },  // Exact match for now
          { subjects: { hasSome: [query] } },
        ],
      },
      select: { id: true, title: true, authors: true, subjects: true },
      take: 50,
    });

    // Combine and deduplicate
    const allBooks = [...booksByTitle, ...booksByAuthorOrSubject];
    const uniqueBooks = Array.from(
      new Map(allBooks.map(book => [book.id, book])).values()
    );

    // Extract and filter authors/subjects with JavaScript for partial matches
    const authorsSet = new Set<string>();
    const subjectsSet = new Set<string>();
    const titlesMap = new Map<number, string>();
    const queryLower = query.toLowerCase();

    uniqueBooks.forEach((book) => {
      // Add title if it matches
      if (book.title.toLowerCase().includes(queryLower)) {
        titlesMap.set(book.id, book.title);
      }

      // Filter authors for partial matches
      book.authors.forEach((author) => {
        if (author.toLowerCase().includes(queryLower)) {
          authorsSet.add(author);
        }
      });

      // Filter subjects for partial matches
      book.subjects.forEach((subject) => {
        if (subject.toLowerCase().includes(queryLower)) {
          subjectsSet.add(subject);
        }
      });
    });

    // Limit results to 5 per category and sort
    const authors = Array.from(authorsSet)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 5);

    const titles = Array.from(titlesMap.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 5);

    const subjects = Array.from(subjectsSet)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 5);

    return NextResponse.json({
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

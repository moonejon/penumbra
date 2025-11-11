import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get("isbn");
    const title = searchParams.get("title");
    const author = searchParams.get("author");

    if (!isbn && !title) {
      return NextResponse.json(
        { error: "ISBN or title required" },
        { status: 400 }
      );
    }

    // Search multiple sources in parallel
    const results = await Promise.allSettled([
      searchGoogleBooks(isbn, title, author),
      searchOpenLibrary(isbn),
    ]);

    // Aggregate results
    const images = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .filter((url): url is string => Boolean(url));

    // Remove duplicates
    const uniqueImages = Array.from(new Set(images));

    return NextResponse.json({
      success: true,
      images: uniqueImages.slice(0, 12), // Limit to 12 results
    });
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Search Google Books API for cover images
 */
async function searchGoogleBooks(
  isbn?: string | null,
  title?: string | null,
  author?: string | null
): Promise<string[]> {
  try {
    const query = isbn || `${title} ${author || ""}`.trim();
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`,
      {
        headers: {
          "User-Agent": "Penumbra/1.0",
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Extract image URLs
    const images: string[] = [];
    for (const item of data.items) {
      const imageLinks = item.volumeInfo?.imageLinks;
      if (imageLinks) {
        // Prefer larger images
        const imageUrl =
          imageLinks.extraLarge ||
          imageLinks.large ||
          imageLinks.medium ||
          imageLinks.small ||
          imageLinks.thumbnail;

        if (imageUrl) {
          // Convert to HTTPS and remove zoom parameter for higher quality
          const httpsUrl = imageUrl.replace("http:", "https:").replace("&zoom=1", "");
          images.push(httpsUrl);
        }
      }
    }

    return images;
  } catch (error) {
    console.error("Google Books search error:", error);
    return [];
  }
}

/**
 * Search Open Library for cover images
 */
async function searchOpenLibrary(isbn?: string | null): Promise<string[]> {
  if (!isbn) return [];

  try {
    const cleanISBN = isbn.replace(/[-\s]/g, "");
    const images: string[] = [];

    // Try both ISBN-10 and ISBN-13 endpoints
    const sizes = ["L", "M"]; // Large and Medium

    for (const size of sizes) {
      const url = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-${size}.jpg`;

      // Check if image exists by attempting to fetch it
      const response = await fetch(url, {
        method: "HEAD",
        headers: {
          "User-Agent": "Penumbra/1.0",
        },
      });

      if (response.ok && response.headers.get("content-type")?.includes("image")) {
        images.push(url);
      }
    }

    return images;
  } catch (error) {
    console.error("Open Library search error:", error);
    return [];
  }
}

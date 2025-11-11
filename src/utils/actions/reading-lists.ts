"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/utils/permissions";
import type {
  ReadingList,
  ReadingListWithBooks,
  FavoriteBook,
  ReadingListTypeEnum,
  ReadingListVisibilityEnum,
} from "@/shared.types";

/**
 * CRUD Operations for Reading Lists
 */

/**
 * Create a new reading list
 * Enforces uniqueness constraints for FAVORITES lists
 */
export async function createReadingList(
  title: string,
  description?: string,
  visibility?: ReadingListVisibilityEnum,
  type?: ReadingListTypeEnum,
  year?: string
) {
  try {
    const user = await getCurrentUser();

    // Validate title length
    if (!title || title.trim().length === 0) {
      return { success: false, error: "Title is required" };
    }
    if (title.length > 200) {
      return { success: false, error: "Title must be 200 characters or less" };
    }

    // Validate description length
    if (description && description.length > 2000) {
      return { success: false, error: "Description must be 2000 characters or less" };
    }

    // Enforce FAVORITES_ALL uniqueness - only one per user
    if (type === "FAVORITES_ALL") {
      const existing = await prisma.readingList.findFirst({
        where: {
          ownerId: user.id,
          type: "FAVORITES_ALL",
        },
      });
      if (existing) {
        return {
          success: false,
          error: "User already has an all-time favorites list",
        };
      }
    }

    // Enforce FAVORITES_YEAR uniqueness - only one per user per year
    if (type === "FAVORITES_YEAR") {
      if (!year) {
        return {
          success: false,
          error: "Year is required for FAVORITES_YEAR type",
        };
      }
      const existing = await prisma.readingList.findFirst({
        where: {
          ownerId: user.id,
          type: "FAVORITES_YEAR",
          year,
        },
      });
      if (existing) {
        return {
          success: false,
          error: `User already has a favorites list for year ${year}`,
        };
      }
    }

    // Create the reading list
    const list = await prisma.readingList.create({
      data: {
        ownerId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        visibility: visibility || "PRIVATE",
        type: type || "STANDARD",
        year: year || null,
      },
    });

    return { success: true, data: list as ReadingList };
  } catch (error) {
    console.error("Create reading list error:", error);
    return {
      success: false,
      error: "Failed to create reading list",
    };
  }
}

/**
 * Fetch all reading lists for the authenticated user
 * Returns lists ordered by most recently updated first
 */
export async function fetchUserReadingLists() {
  try {
    const user = await getCurrentUser();

    const lists = await prisma.readingList.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        _count: {
          select: { books: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, data: lists };
  } catch (error) {
    console.error("Fetch user reading lists error:", error);
    return {
      success: false,
      error: "Failed to fetch reading lists",
    };
  }
}

/**
 * Fetch a single reading list with all its books
 * Books are ordered by position (ascending)
 * Validates ownership before returning data
 */
export async function fetchReadingList(listId: number) {
  try {
    const user = await getCurrentUser();

    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      include: {
        books: {
          include: {
            book: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!list) {
      return { success: false, error: "Reading list not found" };
    }

    // Validate ownership
    if (list.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this reading list",
      };
    }

    return { success: true, data: list as ReadingListWithBooks };
  } catch (error) {
    console.error("Fetch reading list error:", error);
    return {
      success: false,
      error: "Failed to fetch reading list",
    };
  }
}

/**
 * Update reading list metadata (title, description, visibility)
 * Cannot change type or year after creation
 */
export async function updateReadingList(
  listId: number,
  updates: {
    title?: string;
    description?: string;
    visibility?: ReadingListVisibilityEnum;
  }
) {
  try {
    const user = await getCurrentUser();

    // Verify ownership
    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      select: { ownerId: true },
    });

    if (!list) {
      return { success: false, error: "Reading list not found" };
    }

    if (list.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this reading list",
      };
    }

    // Validate title if provided
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.trim().length === 0) {
        return { success: false, error: "Title cannot be empty" };
      }
      if (updates.title.length > 200) {
        return { success: false, error: "Title must be 200 characters or less" };
      }
    }

    // Validate description if provided
    if (updates.description !== undefined && updates.description.length > 2000) {
      return { success: false, error: "Description must be 2000 characters or less" };
    }

    // Build update data
    const updateData: {
      title?: string;
      description?: string | null;
      visibility?: ReadingListVisibilityEnum;
    } = {};

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description.trim() || null;
    }
    if (updates.visibility !== undefined) {
      updateData.visibility = updates.visibility;
    }

    // Update the list
    const updatedList = await prisma.readingList.update({
      where: { id: listId },
      data: updateData,
    });

    return { success: true, data: updatedList as ReadingList };
  } catch (error) {
    console.error("Update reading list error:", error);
    return {
      success: false,
      error: "Failed to update reading list",
    };
  }
}

/**
 * Delete a reading list and all its book associations
 * Cascade delete handled by Prisma schema
 */
export async function deleteReadingList(listId: number) {
  try {
    const user = await getCurrentUser();

    // Verify ownership
    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      select: { ownerId: true },
    });

    if (!list) {
      return { success: false, error: "Reading list not found" };
    }

    if (list.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this reading list",
      };
    }

    // Delete the list (cascade will remove all BookInReadingList entries)
    await prisma.readingList.delete({
      where: { id: listId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete reading list error:", error);
    return {
      success: false,
      error: "Failed to delete reading list",
    };
  }
}

/**
 * Book Management in Reading Lists
 */

/**
 * Add a book to a reading list
 * Position is auto-calculated if not provided (100, 200, 300, etc.)
 * Enforces max 6 books for FAVORITES lists
 */
export async function addBookToReadingList(
  listId: number,
  bookId: number,
  position?: number
) {
  try {
    const user = await getCurrentUser();

    // Verify list ownership
    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      include: {
        books: {
          orderBy: { position: "desc" },
          take: 1,
        },
        _count: {
          select: { books: true },
        },
      },
    });

    if (!list) {
      return { success: false, error: "Reading list not found" };
    }

    if (list.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this reading list",
      };
    }

    // Verify book ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { ownerId: true },
    });

    if (!book) {
      return { success: false, error: "Book not found" };
    }

    if (book.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this book",
      };
    }

    // Enforce max 6 books for FAVORITES lists
    if (
      (list.type === "FAVORITES_ALL" || list.type === "FAVORITES_YEAR") &&
      list._count.books >= 6
    ) {
      return {
        success: false,
        error: "Favorites lists can contain a maximum of 6 books",
      };
    }

    // Check if book is already in this list
    const existingEntry = await prisma.bookInReadingList.findUnique({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: listId,
        },
      },
    });

    if (existingEntry) {
      return {
        success: false,
        error: "Book is already in this reading list",
      };
    }

    // Calculate position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      // Auto-increment: find highest position and add 100
      const highestPosition = list.books[0]?.position || 0;
      finalPosition = highestPosition + 100;
    } else {
      // Validate provided position
      if (finalPosition < 0 || !Number.isInteger(finalPosition)) {
        return {
          success: false,
          error: "Position must be a positive integer",
        };
      }
    }

    // Add book to list
    const entry = await prisma.bookInReadingList.create({
      data: {
        bookId,
        readingListId: listId,
        position: finalPosition,
      },
      include: {
        book: true,
      },
    });

    return { success: true, data: entry };
  } catch (error) {
    console.error("Add book to reading list error:", error);
    return {
      success: false,
      error: "Failed to add book to reading list",
    };
  }
}

/**
 * Remove a book from a reading list
 */
export async function removeBookFromReadingList(listId: number, bookId: number) {
  try {
    const user = await getCurrentUser();

    // Verify list ownership
    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      select: { ownerId: true },
    });

    if (!list) {
      return { success: false, error: "Reading list not found" };
    }

    if (list.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this reading list",
      };
    }

    // Check if book is in the list
    const entry = await prisma.bookInReadingList.findUnique({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: listId,
        },
      },
    });

    if (!entry) {
      return {
        success: false,
        error: "Book is not in this reading list",
      };
    }

    // Remove the book from the list
    await prisma.bookInReadingList.delete({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: listId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Remove book from reading list error:", error);
    return {
      success: false,
      error: "Failed to remove book from reading list",
    };
  }
}

/**
 * Reorder books in a reading list
 * Accepts array of book IDs in desired order
 * Positions are auto-assigned as 100, 200, 300, etc.
 */
export async function reorderBooksInList(listId: number, bookIds: number[]) {
  try {
    const user = await getCurrentUser();

    // Verify list ownership
    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      include: {
        books: {
          select: { bookId: true },
        },
      },
    });

    if (!list) {
      return { success: false, error: "Reading list not found" };
    }

    if (list.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this reading list",
      };
    }

    // Validate that all provided book IDs exist in the list
    const existingBookIds = list.books.map((b) => b.bookId);
    const allValid = bookIds.every((id) => existingBookIds.includes(id));

    if (!allValid) {
      return {
        success: false,
        error: "Some book IDs are not in this reading list",
      };
    }

    // Validate that all books in the list are included in the reorder
    if (bookIds.length !== existingBookIds.length) {
      return {
        success: false,
        error: "Must provide all books in the list for reordering",
      };
    }

    // Use transaction to update all positions atomically
    await prisma.$transaction(
      bookIds.map((bookId, index) =>
        prisma.bookInReadingList.update({
          where: {
            bookId_readingListId: {
              bookId,
              readingListId: listId,
            },
          },
          data: {
            position: (index + 1) * 100, // 100, 200, 300, etc.
          },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Reorder books in list error:", error);
    return {
      success: false,
      error: "Failed to reorder books in list",
    };
  }
}

/**
 * Update notes for a book in a specific reading list
 */
export async function updateBookNotesInList(
  listId: number,
  bookId: number,
  notes: string
) {
  try {
    const user = await getCurrentUser();

    // Verify list ownership
    const list = await prisma.readingList.findUnique({
      where: { id: listId },
      select: { ownerId: true },
    });

    if (!list) {
      return { success: false, error: "Reading list not found" };
    }

    if (list.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this reading list",
      };
    }

    // Validate notes length
    if (notes && notes.length > 2000) {
      return { success: false, error: "Notes must be 2000 characters or less" };
    }

    // Check if book is in the list
    const entry = await prisma.bookInReadingList.findUnique({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: listId,
        },
      },
    });

    if (!entry) {
      return {
        success: false,
        error: "Book is not in this reading list",
      };
    }

    // Update notes
    const updatedEntry = await prisma.bookInReadingList.update({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: listId,
        },
      },
      data: {
        notes: notes.trim() || null,
      },
      include: {
        book: true,
      },
    });

    return { success: true, data: updatedEntry };
  } catch (error) {
    console.error("Update book notes in list error:", error);
    return {
      success: false,
      error: "Failed to update book notes",
    };
  }
}

/**
 * Favorites Management
 */

/**
 * Set a book as a favorite at a specific position (1-6)
 * Creates the appropriate FAVORITES list if it doesn't exist
 * Year parameter determines if it's FAVORITES_YEAR or FAVORITES_ALL
 */
export async function setFavorite(
  bookId: number,
  position: number,
  year?: string
) {
  try {
    const user = await getCurrentUser();

    // Validate position (1-6)
    if (position < 1 || position > 6 || !Number.isInteger(position)) {
      return {
        success: false,
        error: "Position must be an integer between 1 and 6",
      };
    }

    // Verify book ownership
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { ownerId: true },
    });

    if (!book) {
      return { success: false, error: "Book not found" };
    }

    if (book.ownerId !== user.id) {
      return {
        success: false,
        error: "Unauthorized - you don't own this book",
      };
    }

    // Determine list type and find or create the appropriate favorites list
    const listType = year ? "FAVORITES_YEAR" : "FAVORITES_ALL";
    let favoritesList = await prisma.readingList.findFirst({
      where: {
        ownerId: user.id,
        type: listType,
        year: year || null,
      },
    });

    // Create favorites list if it doesn't exist
    if (!favoritesList) {
      const title = year ? `Favorite Books of ${year}` : "All-Time Favorites";
      favoritesList = await prisma.readingList.create({
        data: {
          ownerId: user.id,
          title,
          type: listType,
          year: year || null,
          visibility: "PRIVATE",
        },
      });
    }

    // Convert position (1-6) to internal position (100-600)
    const internalPosition = position * 100;

    // Check if book is already in favorites
    const existingEntry = await prisma.bookInReadingList.findUnique({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: favoritesList.id,
        },
      },
    });

    if (existingEntry) {
      // Update position if already in list
      const updatedEntry = await prisma.bookInReadingList.update({
        where: {
          bookId_readingListId: {
            bookId,
            readingListId: favoritesList.id,
          },
        },
        data: {
          position: internalPosition,
        },
        include: {
          book: true,
        },
      });
      return { success: true, data: updatedEntry };
    }

    // Check if list already has 6 books
    const bookCount = await prisma.bookInReadingList.count({
      where: {
        readingListId: favoritesList.id,
      },
    });

    if (bookCount >= 6) {
      return {
        success: false,
        error: "Favorites list already contains 6 books. Remove one before adding another.",
      };
    }

    // Add book to favorites
    const entry = await prisma.bookInReadingList.create({
      data: {
        bookId,
        readingListId: favoritesList.id,
        position: internalPosition,
      },
      include: {
        book: true,
      },
    });

    return { success: true, data: entry };
  } catch (error) {
    console.error("Set favorite error:", error);
    return {
      success: false,
      error: "Failed to set favorite",
    };
  }
}

/**
 * Remove a book from favorites
 */
export async function removeFavorite(bookId: number, year?: string) {
  try {
    const user = await getCurrentUser();

    // Determine list type and find the favorites list
    const listType = year ? "FAVORITES_YEAR" : "FAVORITES_ALL";
    const favoritesList = await prisma.readingList.findFirst({
      where: {
        ownerId: user.id,
        type: listType,
        year: year || null,
      },
    });

    if (!favoritesList) {
      return {
        success: false,
        error: "Favorites list not found",
      };
    }

    // Check if book is in favorites
    const entry = await prisma.bookInReadingList.findUnique({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: favoritesList.id,
        },
      },
    });

    if (!entry) {
      return {
        success: false,
        error: "Book is not in favorites",
      };
    }

    // Remove from favorites
    await prisma.bookInReadingList.delete({
      where: {
        bookId_readingListId: {
          bookId,
          readingListId: favoritesList.id,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Remove favorite error:", error);
    return {
      success: false,
      error: "Failed to remove favorite",
    };
  }
}

/**
 * Fetch favorites (all-time or for a specific year)
 * Returns books ordered by position
 */
export async function fetchFavorites(year?: string) {
  try {
    const user = await getCurrentUser();

    // Determine list type
    const listType = year ? "FAVORITES_YEAR" : "FAVORITES_ALL";

    // Find favorites list
    const favoritesList = await prisma.readingList.findFirst({
      where: {
        ownerId: user.id,
        type: listType,
        year: year || null,
      },
      include: {
        books: {
          include: {
            book: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    // If no favorites list exists, return empty array
    if (!favoritesList) {
      return { success: true, data: [] };
    }

    // Transform to FavoriteBook format (position divided by 100 to get 1-6)
    const favorites: FavoriteBook[] = favoritesList.books.map((entry) => ({
      book: entry.book,
      position: entry.position / 100,
    }));

    return { success: true, data: favorites };
  } catch (error) {
    console.error("Fetch favorites error:", error);
    return {
      success: false,
      error: "Failed to fetch favorites",
    };
  }
}

/**
 * Fetch all available years that have favorites lists
 * Returns an array of years sorted in descending order (newest first)
 */
export async function fetchAvailableFavoriteYears() {
  try {
    const user = await getCurrentUser();

    // Find all FAVORITES_YEAR lists for this user
    const favoritesYearLists = await prisma.readingList.findMany({
      where: {
        ownerId: user.id,
        type: "FAVORITES_YEAR",
        year: {
          not: null,
        },
      },
      select: {
        year: true,
      },
      orderBy: {
        year: "desc",
      },
    });

    // Extract years and convert to numbers
    const years = favoritesYearLists
      .map((list) => list.year)
      .filter((year): year is string => year !== null)
      .map((year) => parseInt(year, 10))
      .filter((year) => !isNaN(year));

    return { success: true, years };
  } catch (error) {
    console.error("Fetch available favorite years error:", error);
    return {
      success: false,
      error: "Failed to fetch available years",
      years: [],
    };
  }
}

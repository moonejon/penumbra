'use client'

import * as React from 'react'
import { Search, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { fetchBooksPaginated } from '@/utils/actions/books'
import { addBookToReadingList } from '@/utils/actions/reading-lists'
import type { BookType } from '@/shared.types'
import Image from 'next/image'

interface AddBooksModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  listId: number
  existingBookIds: number[] // Books already in the list
}

const BOOKS_PER_PAGE = 12

/**
 * AddBooksModal Component
 * Modal for searching and adding books from user's library to a reading list
 * Features: search by title/author, pagination, excludes books already in list
 */
export function AddBooksModal({
  isOpen,
  onClose,
  onSuccess,
  listId,
  existingBookIds,
}: AddBooksModalProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [books, setBooks] = React.useState<BookType[]>([])
  const [totalPages, setTotalPages] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [addingBookId, setAddingBookId] = React.useState<number | null>(null)

  /**
   * Fetch books from library
   */
  const fetchBooks = React.useCallback(async (page: number, query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchBooksPaginated({
        pageSize: BOOKS_PER_PAGE,
        page,
        title: query || undefined,
      })

      // Filter out books already in the list
      const availableBooks = result.books.filter(
        (book) => !existingBookIds.includes(book.id)
      )

      setBooks(availableBooks)
      setTotalPages(result.pageCount)
    } catch (err) {
      console.error('Error fetching books:', err)
      setError('Failed to load books. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [existingBookIds])

  /**
   * Load books when modal opens or search/page changes
   */
  React.useEffect(() => {
    if (isOpen) {
      fetchBooks(currentPage, searchQuery)
    }
  }, [isOpen, currentPage, searchQuery, fetchBooks])

  /**
   * Reset state when modal closes
   */
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setCurrentPage(1)
      setBooks([])
      setError(null)
      setAddingBookId(null)
    }
  }, [isOpen])

  /**
   * Handle search input with debounce
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page on new search
  }

  /**
   * Add book to reading list
   */
  const handleAddBook = async (bookId: number) => {
    setAddingBookId(bookId)
    setError(null)

    try {
      const result = await addBookToReadingList(listId, bookId)

      if (result.success) {
        // Remove the book from the available list
        setBooks((prev) => prev.filter((book) => book.id !== bookId))
        onSuccess()
      } else {
        setError(result.error || 'Failed to add book to list')
      }
    } catch (err) {
      console.error('Error adding book:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setAddingBookId(null)
    }
  }

  /**
   * Pagination handlers
   */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Books to List"
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            inputMode="search"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            className={cn(
              'w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg',
              'text-base sm:text-sm text-zinc-100',
              'placeholder:text-zinc-600',
              'focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent',
              'transition-colors'
            )}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Books Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: BOOKS_PER_PAGE }).map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-800 rounded-lg animate-pulse"
                  style={{ height: '280px' }}
                />
              ))}
            </div>
          ) : books.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <Search className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-100 mb-2">
                No books found
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'All your books are already in this list'}
              </p>
            </div>
          ) : (
            // Books grid
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors"
                >
                  {/* Book Cover */}
                  <div className="relative aspect-[2/3] w-full bg-zinc-800">
                    <Image
                      src={book.image || '/placeholder-book.png'}
                      alt={`Cover of ${book.title}`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Book Info */}
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-zinc-100 line-clamp-2 mb-1">
                      {book.title}
                    </h4>
                    {book.authors && book.authors.length > 0 && (
                      <p className="text-xs text-zinc-400 line-clamp-1 mb-3">
                        {book.authors.join(', ')}
                      </p>
                    )}

                    {/* Add Button */}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAddBook(book.id)}
                      disabled={addingBookId === book.id}
                      className="w-full min-h-[44px]"
                    >
                      {addingBookId === book.id ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="gap-2 min-h-[44px] min-w-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-sm text-zinc-400">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-2 min-h-[44px] min-w-[44px]"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export type { AddBooksModalProps }

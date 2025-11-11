'use client'

import * as React from 'react'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { BookCoverCard } from '@/components/ui/BookCoverCard'
import { fetchBooks } from '@/utils/actions/books'
import { setFavorite } from '@/utils/actions/reading-lists'
import type { BookType } from '@/shared.types'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AddFavoriteModalProps {
  isOpen: boolean
  onClose: () => void
  position: number // 1-6
  year: 'all-time' | number
  onSuccess: () => void
}

export const AddFavoriteModal = React.forwardRef<
  HTMLDivElement,
  AddFavoriteModalProps
>(({ isOpen, onClose, position, year, onSuccess }, ref) => {
  // State management
  const [books, setBooks] = React.useState<BookType[]>([])
  const [filteredBooks, setFilteredBooks] = React.useState<BookType[]>([])
  const [selectedBook, setSelectedBook] = React.useState<BookType | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const BOOKS_PER_PAGE = 12

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  // Debounce search input (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setCurrentPage(1) // Reset to first page on search
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch books on mount
  React.useEffect(() => {
    if (!isOpen) return

    const loadBooks = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const userBooks = await fetchBooks()

        if (!userBooks || userBooks.length === 0) {
          setBooks([])
          setFilteredBooks([])
          setError('No books found in your library')
          return
        }

        // Filter by year if not all-time
        let filtered = userBooks
        if (year !== 'all-time') {
          filtered = userBooks.filter((book) => {
            if (!book.readDate) return false
            const bookYear = new Date(book.readDate).getFullYear()
            return bookYear === year
          })
        }

        setBooks(filtered)
        setFilteredBooks(filtered)
      } catch (err) {
        console.error('Error fetching books:', err)
        setError('Failed to load books')
        setBooks([])
        setFilteredBooks([])
      } finally {
        setIsLoading(false)
      }
    }

    loadBooks()
  }, [isOpen, year])

  // Filter books by search query
  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredBooks(books)
      return
    }

    const query = debouncedQuery.toLowerCase()
    const filtered = books.filter((book) => {
      const titleMatch = book.title.toLowerCase().includes(query)
      const authorMatch = book.authors.some((author) =>
        author.toLowerCase().includes(query)
      )
      return titleMatch || authorMatch
    })

    setFilteredBooks(filtered)
  }, [debouncedQuery, books])

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE)
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE
  const endIndex = startIndex + BOOKS_PER_PAGE
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex)

  // Handle book selection
  const handleBookSelect = (book: BookType) => {
    setSelectedBook(book)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedBook) return

    setIsSubmitting(true)
    setError(null)

    try {
      const yearParam = year === 'all-time' ? undefined : year.toString()
      const result = await setFavorite(selectedBook.id, position, yearParam)

      if (!result.success) {
        setError(result.error || 'Failed to add book to favorites')
        return
      }

      // Success - call onSuccess and close modal
      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Error adding favorite:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    setSelectedBook(null)
    setSearchQuery('')
    setCurrentPage(1)
    setError(null)
    onClose()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, book: BookType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleBookSelect(book)
    }
  }

  // Page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add to Favorites #${position}`}
      size="lg"
    >
      <div ref={ref} className="flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
            aria-label="Search books"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
            <p className="mt-4 text-zinc-400">Loading books...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBooks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-zinc-400">
              {searchQuery.trim()
                ? 'No books found matching your search'
                : year === 'all-time'
                ? 'No books in your library'
                : `No books read in ${year}`}
            </p>
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && paginatedBooks.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paginatedBooks.map((book) => (
                <div
                  key={book.id}
                  className={cn(
                    'relative rounded-lg transition-all',
                    selectedBook?.id === book.id
                      ? 'ring-2 ring-blue-500'
                      : 'hover:ring-2 hover:ring-zinc-600'
                  )}
                  onClick={() => handleBookSelect(book)}
                  onKeyDown={(e) => handleKeyDown(e, book)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedBook?.id === book.id}
                  aria-label={`Select ${book.title} by ${book.authors.join(', ')}`}
                >
                  <BookCoverCard book={book} size="sm" />
                  <div className="mt-2 px-1">
                    <p className="text-xs text-zinc-300 font-medium truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {book.authors.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <Button
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <span className="text-sm text-zinc-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-zinc-800">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            className="flex-1"
            disabled={!selectedBook || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add to Favorites'}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

AddFavoriteModal.displayName = 'AddFavoriteModal'

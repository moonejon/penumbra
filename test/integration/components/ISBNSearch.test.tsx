import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Search from '@/app/import/components/search'
import { fetchMetadata } from '@/utils/actions/isbndb/fetchMetadata'
import { checkRecordExists } from '@/utils/actions/books'

// Mock server actions
vi.mock('@/utils/actions/isbndb/fetchMetadata', () => ({
  fetchMetadata: vi.fn()
}))

vi.mock('@/utils/actions/books', () => ({
  checkRecordExists: vi.fn()
}))

const mockFetchMetadata = fetchMetadata as ReturnType<typeof vi.fn>
const mockCheckRecordExists = checkRecordExists as ReturnType<typeof vi.fn>

describe('ISBN Search Component', () => {
  const mockSetBookData = vi.fn()
  const mockSetLoading = vi.fn()
  const mockSetError = vi.fn()

  const mockBookResponse = {
    book: {
      title: 'The Great Gatsby',
      title_long: 'The Great Gatsby: A Novel',
      authors: ['F. Scott Fitzgerald'],
      publisher: 'Scribner',
      isbn10: '0743273567',
      isbn13: '9780743273565',
      pages: 180,
      date_published: '2004-09-30',
      synopsis: 'A classic American novel',
      subjects: ['Fiction', 'Classic Literature'],
      image: 'https://example.com/image-small.jpg',
      image_original: 'https://example.com/image-large.jpg',
      binding: 'Paperback',
      language: 'en',
      edition: '1st'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRecordExists.mockResolvedValue(false)
  })

  describe('Rendering', () => {
    it('should render search form with heading', () => {
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      expect(screen.getByText('Search')).toBeInTheDocument()
    })

    it('should render ISBN input field', () => {
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('inputMode', 'numeric')
    })

    it('should render submit button', () => {
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should have autocomplete disabled', () => {
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const form = screen.getByRole('button', { name: /Submit/i }).closest('form')
      expect(form).toHaveAttribute('autoComplete', 'off')
    })
  })

  describe('Input Validation', () => {
    it('should show error when ISBN is empty', async () => {
      const user = userEvent.setup()
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('ISBN is required')).toBeInTheDocument()
      })
    })

    it('should show error for non-numeric ISBN', async () => {
      const user = userEvent.setup()
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, 'ABC123XYZ')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('ISBN must contain only numbers')).toBeInTheDocument()
      })
    })

    it('should show error for invalid ISBN length', async () => {
      const user = userEvent.setup()
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '12345')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('ISBN must be either 10 or 13 digits')).toBeInTheDocument()
      })
    })

    it('should accept valid ISBN-10', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '0743273567')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetchMetadata).toHaveBeenCalledWith('0743273567')
      })
    })

    it('should accept valid ISBN-13', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetchMetadata).toHaveBeenCalledWith('9780743273565')
      })
    })

    it('should strip hyphens from ISBN', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '978-0-7432-7356-5')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetchMetadata).toHaveBeenCalledWith('9780743273565')
      })
    })

    it('should strip spaces from ISBN', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '978 0 7432 7356 5')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetchMetadata).toHaveBeenCalledWith('9780743273565')
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error for book not found', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue({ book: null })
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Book Not Found')).toBeInTheDocument()
        expect(screen.getByText(/No book found for this ISBN/)).toBeInTheDocument()
      })
    })

    it('should display network error', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockRejectedValue(new Error('Network request failed'))
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Connection Error')).toBeInTheDocument()
        expect(screen.getByText(/Network error/)).toBeInTheDocument()
      })
    })

    it('should display 404 error', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockRejectedValue(new Error('404'))
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Book Not Found')).toBeInTheDocument()
      })
    })

    it('should display rate limit error', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockRejectedValue(new Error('429'))
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument()
        expect(screen.getByText(/Too many requests/)).toBeInTheDocument()
      })
    })

    it('should display timeout error', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve(mockBookResponse), 15000)
        })
      )

      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )

      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')

      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Request Timeout')).toBeInTheDocument()
      }, { timeout: 12000 })
    }, 15000)

    it('should allow dismissing error messages', async () => {
      const user = userEvent.setup()
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('ISBN is required')).toBeInTheDocument()
      })
      
      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)
      
      await waitFor(() => {
        expect(screen.queryByText('ISBN is required')).not.toBeInTheDocument()
      })
    })

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup()
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('ISBN is required')).toBeInTheDocument()
      })
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '1')
      
      await waitFor(() => {
        expect(screen.queryByText('ISBN is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state while searching', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve(mockBookResponse), 500)
        })
      )
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      expect(screen.getByText('Searching...')).toBeInTheDocument()
      expect(mockSetLoading).toHaveBeenCalledWith(true)
    })

    it('should disable input while searching', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve(mockBookResponse), 500)
        })
      )
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      expect(input).toBeDisabled()
    })

    it('should disable submit button while searching', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve(mockBookResponse), 500)
        })
      )
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      expect(submitButton).toBeDisabled()
    })

    it('should show spinner icon while searching', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve(mockBookResponse), 500)
        })
      )
      
      const { container } = render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Successful Search', () => {
    it('should call setBookData with formatted book data', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSetBookData).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'The Great Gatsby',
            authors: ['F. Scott Fitzgerald'],
            isbn13: '9780743273565',
            isbn10: '0743273567',
            publisher: 'Scribner',
            pageCount: 180
          })
        )
      })
    })

    it('should mark book as incomplete when missing required fields', async () => {
      const user = userEvent.setup()
      const incompleteBook = {
        book: {
          ...mockBookResponse.book,
          synopsis: '', // Missing synopsis
          subjects: [] // Empty subjects
        }
      }
      mockFetchMetadata.mockResolvedValue(incompleteBook)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSetBookData).toHaveBeenCalledWith(
          expect.objectContaining({
            isIncomplete: true
          })
        )
      })
    })

    it('should check for duplicates', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      mockCheckRecordExists.mockResolvedValue(true)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockCheckRecordExists).toHaveBeenCalledWith('9780743273565')
        expect(mockSetBookData).toHaveBeenCalledWith(
          expect.objectContaining({
            isDuplicate: true
          })
        )
      })
    })

    it('should clear form on successful submission', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(input).toHaveValue('')
      })
    })

    it('should set loading to false after success', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockResolvedValue(mockBookResponse)
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenLastCalledWith(false)
      })
    })
  })

  describe('Preventing Multiple Submissions', () => {
    it('should prevent multiple simultaneous searches', async () => {
      const user = userEvent.setup()
      mockFetchMetadata.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve(mockBookResponse), 1000)
        })
      )
      
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      await user.type(input, '9780743273565')
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)
      
      // Should only call once
      expect(mockFetchMetadata).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const input = screen.getByPlaceholderText('Enter ISBN number')
      expect(input).toHaveAttribute('id', 'isbn-input')
    })

    it('should mark input as invalid on error', async () => {
      const user = userEvent.setup()
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )
      
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter ISBN number')
        expect(input).toHaveClass('border-red-500/50')
      })
    })

    it('should have role alert for error messages', async () => {
      const user = userEvent.setup()
      render(
        <Search
          setBookData={mockSetBookData}
          setLoading={mockSetLoading}
          setError={mockSetError}
        />
      )

      const submitButton = screen.getByRole('button', { name: /Submit/i })
      await user.click(submitButton)

      // Use findByRole which waits for the element to appear
      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
    })
  })
})

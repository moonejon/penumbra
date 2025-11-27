import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import TextSearch from '@/app/library/components/textSearch'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockGet = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => mockSearchParams),
}))

describe('TextSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('title')
    mockSearchParams.delete('page')
  })

  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('id', 'title-search')
    })

    it('should render with accessible label', () => {
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByLabelText(/title/i)
      expect(input).toBeInTheDocument()
    })

    it('should have proper input attributes', () => {
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      expect(input).toHaveClass('w-full')
    })
  })

  describe('User Interactions', () => {
    it('should accept user input', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'The Great Gatsby')
      
      expect(input).toHaveValue('The Great Gatsby')
    })

    it('should debounce search input (500ms)', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      
      // Type quickly - should not trigger navigation immediately
      await user.type(input, 'Test', { delay: 50 })
      
      // Should not have called push yet
      expect(mockPush).not.toHaveBeenCalled()
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
    })

    it('should handle rapid typing by debouncing', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      
      // Type multiple characters rapidly
      await user.type(input, 'The Great Gatsby', { delay: 50 })
      
      // Wait for debounce to complete
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
      
      // Should only call once after debounce, not for each character
      expect(mockPush).toHaveBeenCalledTimes(1)
    })

    it('should allow clearing input', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Test Query')
      
      expect(input).toHaveValue('Test Query')
      
      await user.clear(input)
      expect(input).toHaveValue('')
    })
  })

  describe('URL Parameter Updates', () => {
    it('should update URL with title parameter on search', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Moby Dick', { delay: 100 })
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('title=Moby+Dick')
        )
      }, { timeout: 600 })
    })

    it('should preserve existing URL parameters except page', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('authors', 'Jane Austen')
      mockSearchParams.set('page', '3')
      
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Pride', { delay: 100 })
      
      await waitFor(() => {
        const callArg = mockPush.mock.calls[0][0]
        expect(callArg).toContain('title=Pride')
        expect(callArg).toContain('authors=Jane+Austen')
        expect(callArg).not.toContain('page=3')
      }, { timeout: 600 })
    })

    it('should delete page parameter when searching', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('page', '5')
      
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Search', { delay: 100 })
      
      await waitFor(() => {
        const callArg = mockPush.mock.calls[0][0]
        expect(callArg).not.toContain('page=')
      }, { timeout: 600 })
    })

    it('should navigate to library route with parameters', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Test', { delay: 100 })
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringMatching(/^library\/\?/)
        )
      }, { timeout: 600 })
    })

    it('should handle empty search input', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Test')
      await user.clear(input)
      
      await waitFor(() => {
        // Should still trigger navigation even with empty value
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
    })

    it('should handle special characters in search', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Harry Potter & The Stone', { delay: 100 })
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
        const callArg = mockPush.mock.calls[0][0]
        expect(callArg).toContain('title=')
      }, { timeout: 600 })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long search queries', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const longQuery = 'A'.repeat(200)
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, longQuery)
      
      expect(input).toHaveValue(longQuery)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
    })

    it('should handle unicode characters', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, '日本語のタイトル', { delay: 100 })
      
      expect(input).toHaveValue('日本語のタイトル')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
    })

    it('should handle whitespace in search', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, '   Spaces   ', { delay: 100 })
      
      expect(input).toHaveValue('   Spaces   ')
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
    })
  })

  describe('Performance', () => {
    it('should only trigger one navigation after debounce period', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      
      // Simulate fast typing
      await user.type(input, 'Quick typing test')
      
      // Wait for all debounces to complete
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Should have been called exactly once
      expect(mockPush).toHaveBeenCalledTimes(1)
    })

    it('should cancel previous debounce when new input arrives', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      
      // Type first query
      await user.type(input, 'First')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Type more before debounce completes
      await user.type(input, ' Query')
      
      // Wait for final debounce
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
      
      // Should only navigate once with final value
      expect(mockPush).toHaveBeenCalledTimes(1)
      const finalCall = mockPush.mock.calls[0][0]
      expect(finalCall).toContain('First+Query')
    })
  })

  describe('Accessibility', () => {
    it('should have proper input label association', () => {
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      expect(input).toHaveAttribute('id', 'title-search')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      
      // Tab to input
      await user.tab()
      expect(input).toHaveFocus()
      
      // Type in input
      await user.keyboard('Test Search')
      expect(input).toHaveValue('Test Search')
    })

    it('should accept Enter key', async () => {
      const user = userEvent.setup()
      render(<TextSearch filterType="title" />)
      
      const input = screen.getByPlaceholderText('Search by title...')
      await user.type(input, 'Search Query{Enter}')
      
      expect(input).toHaveValue('Search Query')
    })
  })
})

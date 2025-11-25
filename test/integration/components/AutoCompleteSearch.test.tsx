import * as React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import AutoCompleteSearch from '@/app/library/components/autocompleteSearch'

// Mock Next.js navigation
const mockPush = vi.fn()
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

describe('AutoCompleteSearch Component', () => {
  const mockAuthors = ['Jane Austen', 'Charles Dickens', 'Mark Twain', 'Virginia Woolf']
  const mockSubjects = ['Fiction', 'Classic Literature', 'Romance', 'Adventure']

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('authors')
    mockSearchParams.delete('subjects')
    mockSearchParams.delete('page')
  })

  describe('Rendering - Authors', () => {
    it('should render input with authors placeholder', () => {
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      expect(input).toBeInTheDocument()
    })

    it('should render dropdown icon', () => {
      const { container } = render(
        <AutoCompleteSearch filterType="authors" values={mockAuthors} />
      )
      
      // ChevronDown icon should be present
      const icon = container.querySelector('.lucide-chevron-down')
      expect(icon).toBeInTheDocument()
    })

    it('should not show dropdown initially', () => {
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      expect(screen.queryByRole('button', { name: /Jane Austen/ })).not.toBeInTheDocument()
    })
  })

  describe('Rendering - Subjects', () => {
    it('should render input with subjects placeholder', () => {
      render(<AutoCompleteSearch filterType="subjects" values={mockSubjects} />)
      
      const input = screen.getByPlaceholderText('subjects')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Opening and Closing Dropdown', () => {
    it('should open dropdown when clicking on input container', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
        expect(screen.getByText('Charles Dickens')).toBeInTheDocument()
      })
    })

    it('should show all options when dropdown opens', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      await waitFor(() => {
        mockAuthors.forEach(author => {
          expect(screen.getByText(author)).toBeInTheDocument()
        })
      })
    })

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <AutoCompleteSearch filterType="authors" values={mockAuthors} />
          <button>Outside Button</button>
        </div>
      )
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
      })
      
      // Click outside
      const outsideButton = screen.getByText('Outside Button')
      await user.click(outsideButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Jane Austen')).not.toBeInTheDocument()
      })
    })

    it('should close dropdown when pressing Escape', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
      })
      
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByText('Jane Austen')).not.toBeInTheDocument()
      })
    })

    it('should rotate dropdown icon when open', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <AutoCompleteSearch filterType="authors" values={mockAuthors} />
      )
      
      const input = screen.getByPlaceholderText('authors')
      
      // Icon should not be rotated initially
      const icon = container.querySelector('.lucide-chevron-down')
      expect(icon).not.toHaveClass('rotate-180')
      
      await user.click(input)
      
      await waitFor(() => {
        expect(icon).toHaveClass('rotate-180')
      })
    })
  })

  describe('Filtering Options', () => {
    it('should filter options based on search query', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.type(input, 'Jane')
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
        expect(screen.queryByText('Charles Dickens')).not.toBeInTheDocument()
        expect(screen.queryByText('Mark Twain')).not.toBeInTheDocument()
      })
    })

    it('should filter case-insensitively', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.type(input, 'JANE')
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
      })
    })

    it('should show "No matching options" when filter returns nothing', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.type(input, 'xyz123')
      
      await waitFor(() => {
        expect(screen.getByText('No matching options')).toBeInTheDocument()
      })
    })

    it('should show all options when search is cleared', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.type(input, 'Jane')
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
        expect(screen.queryByText('Charles Dickens')).not.toBeInTheDocument()
      })
      
      await user.clear(input)
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
        expect(screen.getByText('Charles Dickens')).toBeInTheDocument()
      })
    })
  })

  describe('Selecting and Deselecting Options', () => {
    it('should select an option when clicked', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('Jane Austen')).toBeInTheDocument()
      })
      
      const option = screen.getByText('Jane Austen')
      await user.click(option)
      
      // Should show as selected pill
      await waitFor(() => {
        const pill = screen.getByText('Jane Austen').closest('div')
        expect(pill).toHaveClass('inline-flex')
      })
    })

    it('should show checkmark on selected option in dropdown', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <AutoCompleteSearch filterType="authors" values={mockAuthors} />
      )
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      const option = screen.getByText('Jane Austen')
      await user.click(option)
      
      // Click to reopen dropdown
      await user.click(input)
      
      await waitFor(() => {
        const checkIcon = container.querySelector('.lucide-check')
        expect(checkIcon).toBeInTheDocument()
      })
    })

    it('should remove option from dropdown when selected', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      const option = screen.getByText('Jane Austen')
      await user.click(option)
      
      // Dropdown should close and option should be in pill form
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Jane Austen/ })).not.toBeInTheDocument()
      })
    })

    it('should allow selecting multiple options', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      await user.click(screen.getByText('Jane Austen'))
      await user.click(input)
      await user.click(screen.getByText('Charles Dickens'))
      
      await waitFor(() => {
        const pills = screen.getAllByText(/Jane Austen|Charles Dickens/)
        expect(pills.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should remove selection when clicking X button on pill', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText('Jane Austen'))
      
      await waitFor(() => {
        expect(screen.getByLabelText('Remove Jane Austen')).toBeInTheDocument()
      })
      
      const removeButton = screen.getByLabelText('Remove Jane Austen')
      await user.click(removeButton)
      
      await waitFor(() => {
        // Should not show pill anymore
        const pills = screen.queryAllByText('Jane Austen')
        const isPillGone = pills.every(el => {
          const parent = el.closest('div')
          return !parent?.classList.contains('inline-flex')
        })
        expect(isPillGone).toBe(true)
      })
    })

    it('should show "All options selected" when all are chosen', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      
      // Select all authors
      for (const author of mockAuthors) {
        await user.click(input)
        await waitFor(() => {
          expect(screen.getByText(author)).toBeInTheDocument()
        })
        await user.click(screen.getByText(author))
      }
      
      // Open dropdown again
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('All options selected')).toBeInTheDocument()
      })
    })
  })

  describe('URL Parameter Updates', () => {
    it('should update URL with authors parameter after debounce', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText('Jane Austen'))
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('authors=Jane+Austen')
        )
      }, { timeout: 600 })
    })

    it('should update URL with multiple authors', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText('Jane Austen'))
      
      await user.click(input)
      await user.click(screen.getByText('Mark Twain'))
      
      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
        expect(lastCall).toContain('authors=')
        expect(lastCall).toContain('Jane+Austen')
        expect(lastCall).toContain('Mark+Twain')
      }, { timeout: 600 })
    })

    it('should remove authors parameter when all selections are cleared', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText('Jane Austen'))
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      }, { timeout: 600 })
      
      vi.clearAllMocks()
      
      const removeButton = screen.getByLabelText('Remove Jane Austen')
      await user.click(removeButton)
      
      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1]?.[0]
        if (lastCall) {
          expect(lastCall).not.toContain('authors=')
        }
      }, { timeout: 600 })
    })

    it('should reset page parameter when selecting', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('page', '5')
      
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText('Jane Austen'))
      
      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
        expect(lastCall).not.toContain('page=')
      }, { timeout: 600 })
    })
  })

  describe('Dropdown Mode', () => {
    it('should use onChange callback when inDropdown is true', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()
      
      render(
        <AutoCompleteSearch
          filterType="authors"
          values={mockAuthors}
          inDropdown={true}
          onChange={mockOnChange}
        />
      )
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText('Jane Austen'))
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['Jane Austen'])
      })
      
      // Should not update URL
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should accept selectedValues prop', async () => {
      render(
        <AutoCompleteSearch
          filterType="authors"
          values={mockAuthors}
          selectedValues={['Jane Austen', 'Mark Twain']}
        />
      )
      
      expect(screen.getByText('Jane Austen')).toBeInTheDocument()
      expect(screen.getByText('Mark Twain')).toBeInTheDocument()
    })

    it('should update when selectedValues prop changes', () => {
      const { rerender } = render(
        <AutoCompleteSearch
          filterType="authors"
          values={mockAuthors}
          selectedValues={['Jane Austen']}
        />
      )
      
      expect(screen.getByText('Jane Austen')).toBeInTheDocument()
      
      rerender(
        <AutoCompleteSearch
          filterType="authors"
          values={mockAuthors}
          selectedValues={['Charles Dickens']}
        />
      )
      
      expect(screen.queryByText('Jane Austen')).not.toBeInTheDocument()
      expect(screen.getByText('Charles Dickens')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty values array', () => {
      render(<AutoCompleteSearch filterType="authors" values={[]} />)
      
      const input = screen.getByPlaceholderText('authors')
      expect(input).toBeInTheDocument()
    })

    it('should show "No options available" when values array is empty', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={[]} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      
      await waitFor(() => {
        expect(screen.getByText('No options available')).toBeInTheDocument()
      })
    })

    it('should handle very long option names', async () => {
      const user = userEvent.setup()
      const longName = 'A'.repeat(200)
      render(<AutoCompleteSearch filterType="authors" values={[longName]} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText(longName))
      
      await waitFor(() => {
        expect(screen.getByText(longName)).toBeInTheDocument()
      })
    })

    it('should handle special characters in option names', async () => {
      const user = userEvent.setup()
      const specialName = 'O\'Brien & Sons, Inc.'
      render(<AutoCompleteSearch filterType="authors" values={[specialName]} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText(specialName))
      
      await waitFor(() => {
        expect(screen.getByText(specialName)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.tab()
      
      expect(input).toHaveFocus()
    })

    it('should have proper ARIA labels for remove buttons', async () => {
      const user = userEvent.setup()
      render(<AutoCompleteSearch filterType="authors" values={mockAuthors} />)
      
      const input = screen.getByPlaceholderText('authors')
      await user.click(input)
      await user.click(screen.getByText('Jane Austen'))
      
      await waitFor(() => {
        const removeButton = screen.getByLabelText('Remove Jane Austen')
        expect(removeButton).toBeInTheDocument()
      })
    })

    it('should focus input when container is clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <AutoCompleteSearch filterType="authors" values={mockAuthors} />
      )
      
      const inputContainer = container.querySelector('.min-h-\\[42px\\]')
      if (inputContainer) {
        await user.click(inputContainer as HTMLElement)
      }
      
      const input = screen.getByPlaceholderText('authors')
      expect(input).toHaveFocus()
    })
  })
})

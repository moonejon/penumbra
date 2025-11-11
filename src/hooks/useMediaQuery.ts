'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook to check if a media query matches
 * Replaces MUI's useMediaQuery hook
 *
 * @param query - Media query string (e.g., "(max-width: 640px)")
 * @returns boolean indicating if the media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 640px)')
 * const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`)
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // Create listener
    const listener = () => setMatches(media.matches)

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

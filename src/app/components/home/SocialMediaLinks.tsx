'use client'

import * as React from 'react'
import { Github, Globe, Instagram, Linkedin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/shared.types'

// Custom Letterboxd icon - three overlapping dots with brand colors
const LetterboxdIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <circle cx="5" cy="12" r="4" fill="#00E054" />
    <circle cx="12" cy="12" r="4" fill="#40BCF4" />
    <circle cx="19" cy="12" r="4" fill="#FF8000" />
  </svg>
)

// Custom Spotify icon (official logo)
const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

export interface SocialMediaLinksProps {
  profile: UserProfile
  className?: string
}

interface SocialLink {
  url: string
  icon: React.ReactNode
  label: string
  platform: string
  colorClass: string
}

const SocialMediaLinks = React.forwardRef<HTMLDivElement, SocialMediaLinksProps>(
  ({ profile, className }, ref) => {
    // Build array of social links from profile
    const socialLinks: SocialLink[] = React.useMemo(() => {
      const links: SocialLink[] = []

      // Personal website link always first
      links.push({
        url: 'https://jonathanmooney.me',
        icon: <Globe className="w-5 h-5" />,
        label: 'Website',
        platform: 'website',
        colorClass: 'text-zinc-500 hover:text-zinc-300',
      })

      if (profile.githubUrl) {
        links.push({
          url: profile.githubUrl,
          icon: <Github className="w-5 h-5" />,
          label: 'GitHub',
          platform: 'github',
          colorClass: 'text-zinc-400 hover:text-white',
        })
      }

      if (profile.instagramUrl) {
        links.push({
          url: profile.instagramUrl,
          icon: <Instagram className="w-5 h-5" />,
          label: 'Instagram',
          platform: 'instagram',
          colorClass: 'text-pink-400/70 hover:text-pink-400',
        })
      }

      if (profile.linkedinUrl) {
        links.push({
          url: profile.linkedinUrl,
          icon: <Linkedin className="w-5 h-5" />,
          label: 'LinkedIn',
          platform: 'linkedin',
          colorClass: 'text-blue-400/70 hover:text-blue-400',
        })
      }

      if (profile.letterboxdUrl) {
        links.push({
          url: profile.letterboxdUrl,
          icon: <LetterboxdIcon className="w-5 h-5" />,
          label: 'Letterboxd',
          platform: 'letterboxd',
          colorClass: 'opacity-70 hover:opacity-100',
        })
      }

      if (profile.spotifyUrl) {
        links.push({
          url: profile.spotifyUrl,
          icon: <SpotifyIcon className="w-5 h-5" />,
          label: 'Spotify',
          platform: 'spotify',
          colorClass: 'text-green-400/70 hover:text-green-400',
        })
      }

      return links
    }, [profile])

    // Don't render if no social links
    if (socialLinks.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-4', className)}
        role="list"
        aria-label="Social media links"
      >
        {socialLinks.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group relative flex items-center justify-center',
              'transition-all duration-200 ease-out',
              'hover:scale-110',
              'focus-visible:outline-none',
              'active:scale-95',
              link.colorClass
            )}
            aria-label={`Visit ${link.label} profile`}
            role="listitem"
          >
            {link.icon}

            {/* Tooltip on hover */}
            <span
              className={cn(
                'absolute -bottom-7 left-1/2 -translate-x-1/2',
                'px-2 py-0.5 rounded text-xs',
                'text-white/60',
                'whitespace-nowrap',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200',
                'pointer-events-none'
              )}
              role="tooltip"
            >
              {link.label}
            </span>
          </a>
        ))}
      </div>
    )
  }
)

SocialMediaLinks.displayName = 'SocialMediaLinks'

export { SocialMediaLinks }

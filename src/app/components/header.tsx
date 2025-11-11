'use client';

import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-sm mx-auto px-4">
          <nav className="flex items-center justify-between h-14">
            {/* Brand */}
            <Link
              href="/"
              className="text-xl font-semibold text-zinc-100 hover:text-zinc-400 transition-colors"
            >
              Penumbra
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/library"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Library
              </Link>

              {isLoaded && isSignedIn && (
                <>
                  <Link
                    href="/import"
                    className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    Import
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {/* Auth */}
              {isLoaded && !isSignedIn ? (
                <Link
                  href="/sign-in"
                  className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  sign in
                </Link>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-zinc-100"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950 md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <Link
              href="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-zinc-100 hover:text-zinc-400 transition-colors"
            >
              Library
            </Link>

            {isLoaded && isSignedIn && (
              <>
                <Link
                  href="/import"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-medium text-zinc-100 hover:text-zinc-400 transition-colors"
                >
                  Import
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-medium text-zinc-100 hover:text-zinc-400 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}

            {/* Auth in Mobile Menu */}
            {isLoaded && !isSignedIn ? (
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                sign in
              </Link>
            ) : (
              <div className="mt-4">
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

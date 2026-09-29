"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bookmark, User, Menu, X, Feather } from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Authors", href: "/authors" },
    { label: "Books", href: "/books" },
    { label: "Articles", href: "/articles" },
    { label: "Poems", href: "/poems" },
    { label: "Stories", href: "/stories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const isCMSUser = user && ["SUPER_ADMIN", "EDITOR", "AUTHOR"].includes(user.role);

  return (
    <header className="sticky top-0 z-40 bg-parchment-50/90 dark:bg-ink-950/90 backdrop-blur-md border-b border-parchment-300/70 dark:border-ink-800 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -ml-2 text-ink-700 dark:text-parchment-300 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand Logo */}
        <Logo size="md" showTagline={true} href="/" />

        {/* Desktop Editorial Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-xs uppercase tracking-[0.2em] font-medium text-ink-700 dark:text-parchment-300">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors hover:text-amber-800 dark:hover:text-amber-400 py-1 ${
                  isActive ? "text-amber-800 dark:text-amber-400 border-b border-amber-800 dark:border-amber-400 font-semibold" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/search"
            className="p-2 text-ink-700 dark:text-parchment-300 hover:text-ink-950 dark:hover:text-white transition-colors"
            aria-label="Global Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link
            href="/bookmarks"
            className="p-2 text-ink-700 dark:text-parchment-300 hover:text-ink-950 dark:hover:text-white transition-colors relative"
            aria-label="Reading List / Bookmarks"
          >
            <Bookmark className="h-4 w-4" />
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {isCMSUser && (
                <Link href="/admin">
                  <Button size="sm" variant="gold" className="text-xs gap-1.5 hidden sm:inline-flex">
                    <Feather className="h-3.5 w-3.5" />
                    <span>CMS Studio</span>
                  </Button>
                </Link>
              )}
              <Link href="/admin">
                <div className="w-8 h-8 rounded-full bg-ink-950 dark:bg-parchment-100 text-parchment-50 dark:text-ink-950 flex items-center justify-center font-serif text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm" className="text-xs uppercase tracking-wider hidden sm:inline-flex">
                  Join
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-parchment-300 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3 font-serif text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-ink-800 dark:text-parchment-200 hover:text-amber-800 dark:hover:text-amber-400 py-1 border-b border-parchment-200 dark:border-ink-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {isCMSUser && (
            <div className="pt-2">
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gold" size="md" className="w-full gap-2">
                  <Feather className="h-4 w-4" />
                  Enter CMS Studio
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

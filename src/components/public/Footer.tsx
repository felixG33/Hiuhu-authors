import React from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-parchment-300 dark:border-ink-800 bg-parchment-100 dark:bg-ink-950 text-ink-800 dark:text-parchment-200 mt-20 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showTagline={true} href="/" />
            <p className="font-serif text-sm text-ink-600 dark:text-parchment-400 leading-relaxed max-w-sm mt-3">
              HIUHU is a premier literary publishing sanctuary dedicated to nurturing thoughtful voices, poetic verse, compelling fiction, and groundbreaking essays.
            </p>
            <div className="text-xs font-mono text-ink-500 pt-2">
              EST. 2026 • INDEPENDENT LITERARY PRESS
            </div>
          </div>

          {/* Catalog Columns */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink-400 dark:text-parchment-400 font-semibold">
              Writings
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/articles" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Articles & Essays
                </Link>
              </li>
              <li>
                <Link href="/poems" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Poetry & Verse
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Short Stories
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Book Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Authors & Community */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink-400 dark:text-parchment-400 font-semibold">
              Community
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/authors" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Discover Authors
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Author Submission
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Editorial Masthead
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink-400 dark:text-parchment-400 font-semibold">
              Governance
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  CMS Administration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-parchment-300 dark:border-ink-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-500 font-mono gap-4">
          <p>© {currentYear} HIUHU Publishing Platform. All rights reserved.</p>
          <p>Crafted for literature, typography, and timeless expression.</p>
        </div>
      </div>
    </footer>
  );
}

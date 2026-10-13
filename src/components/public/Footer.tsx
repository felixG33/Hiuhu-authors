import React from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-parchment-300 dark:border-ink-800 bg-parchment-100 dark:bg-ink-950 text-ink-800 dark:text-parchment-200 mt-20 transition-colors">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Author Statement */}
          <div className="space-y-4">
            <Logo size="md" showTagline={true} href="/" />
            <p className="font-serif text-sm text-ink-600 dark:text-parchment-400 leading-relaxed max-w-sm mt-3">
              The personal literary sanctuary of author, poet, and essayist HIUHU. Dedicated to deliberate sentences, evocative poetry, and patient contemplation.
            </p>
            <div className="text-xs font-mono text-ink-500 pt-2">
              EST. 2026 • OFFICIAL AUTHOR FOLIO
            </div>
          </div>

          {/* Catalog Columns */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink-400 dark:text-parchment-400 font-semibold">
              Published Works
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/books" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Books & Editions
                </Link>
              </li>
              <li>
                <Link href="/poems" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Poetry & Verse
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Essays & Dispatches
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Short Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Author & Reader Folio */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink-400 dark:text-parchment-400 font-semibold">
              The Author
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Biography & Manifesto
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Personal Reading List
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Studio */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-ink-400 dark:text-parchment-400 font-semibold">
              Folio
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Terms of Reading
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
                  Author Studio CMS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-parchment-300 dark:border-ink-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-500 font-mono gap-4">
          <p>© {currentYear} HIUHU. All literary rights reserved.</p>
          <p>Crafted for literature, typography, and timeless expression.</p>
        </div>
      </div>
    </footer>
  );
}

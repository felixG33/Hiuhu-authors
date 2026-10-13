"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Bookmark, Clock, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookmarkedItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  authorName?: string;
}

export default function BookmarksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const savedIds: string[] = JSON.parse(localStorage.getItem("hiuhu_bookmarks") || "[]");
        if (savedIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch items
        const res = await fetch("/api/content");
        if (res.ok) {
          const data = await res.json();
          const filtered = (data.items || []).filter((item: any) => savedIds.includes(item.id));
          setItems(filtered);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  const handleRemove = (id: string) => {
    const savedIds: string[] = JSON.parse(localStorage.getItem("hiuhu_bookmarks") || "[]");
    const next = savedIds.filter((item) => item !== id);
    localStorage.setItem("hiuhu_bookmarks", JSON.stringify(next));
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    localStorage.removeItem("hiuhu_bookmarks");
    setItems([]);
  };

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-parchment-300 dark:border-ink-800 pb-4 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold block mb-1">
                Reader Sanctuary
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold">Your Saved Reading List</h1>
            </div>

            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs gap-1.5 text-crimson-600">
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center font-serif text-ink-500">Retrieving saved literature...</div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-parchment-300 dark:border-ink-800 rounded-sm space-y-4">
              <Bookmark className="h-10 w-10 text-amber-800/40 mx-auto" />
              <h3 className="font-serif text-xl font-bold">Your Reading List is Empty</h3>
              <p className="font-serif text-sm text-ink-600 dark:text-parchment-400 max-w-md mx-auto">
                While exploring poems, articles, and stories, click &ldquo;Save to Reading List&rdquo; to collect works for offline contemplation.
              </p>
              <Link href="/articles">
                <Button variant="gold" size="sm">
                  Explore Literature
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-parchment-300 dark:divide-ink-800">
              {items.map((item) => {
                const linkHref =
                  item.type === "POEM"
                    ? `/poems/${item.slug}`
                    : item.type === "STORY"
                    ? `/stories/${item.slug}`
                    : `/articles/${item.slug}`;

                return (
                  <div key={item.id} className="py-6 flex items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-semibold">
                        {item.type}
                      </span>
                      <Link href={linkHref}>
                        <h3 className="font-serif text-xl font-bold hover:text-amber-800 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-ink-500 font-serif">
                        by {item.author?.name || "HIUHU Contributor"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link href={linkHref}>
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                          <span>Read</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-ink-400 hover:text-crimson-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

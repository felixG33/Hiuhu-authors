"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";

export default function NewBookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("HIUHU Press");
  const [publicationDate, setPublicationDate] = useState("");
  const [genre, setGenre] = useState("");
  const [pages, setPages] = useState<number | "">("");
  const [buyUrl, setBuyUrl] = useState("");
  const [readUrl, setReadUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [authorId, setAuthorId] = useState("");

  const [authors, setAuthors] = useState<any[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function loadAuthors() {
      try {
        const res = await fetch("/api/authors");
        if (res.ok) {
          const data = await res.json();
          setAuthors(data.authors || []);
          if (data.authors?.[0]) {
            setAuthorId(data.authors[0].id);
          }
        }
      } catch {
        // ignore
      }
    }
    loadAuthors();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !authorId) {
      setErrorMsg("Title, description, and author attribution are required");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");

      const payload = {
        title,
        slug: slug || slugify(title),
        description,
        cover: cover || null,
        isbn: isbn || null,
        publisher: publisher || null,
        publicationDate: publicationDate ? new Date(publicationDate).toISOString() : null,
        genre: genre || null,
        pages: pages ? Number(pages) : null,
        buyUrl: buyUrl || null,
        readUrl: readUrl || null,
        isFeatured,
        authorId,
      };

      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create book");
      }

      success("Book added to catalog successfully");
      router.push("/admin/books");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add book");
      toastError(err.message || "Error adding book");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/books" className="p-1.5 rounded-sm hover:bg-parchment-200 text-ink-600">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-serif text-2xl font-bold">Add Book to Catalog</h1>
        </div>
      </div>

      {errorMsg && <p className="text-xs text-crimson-600 font-mono">{errorMsg}</p>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
            <Input
              label="Book Title"
              required
              placeholder="e.g. The Silence of Shores"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300 mb-1.5">
                  Author
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full h-10 px-3 rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-sm font-sans"
                >
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Textarea
              label="Synopsis / Book Description"
              required
              rows={5}
              placeholder="Write the full synopsis, critical praise, or description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Genre"
                placeholder="Poetry, Fiction, Memoir"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
              <Input
                label="ISBN"
                placeholder="978-0-123456-78-9"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
              <Input
                label="Publication Date"
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
              <Input
                label="Page Count"
                type="number"
                placeholder="320"
                value={pages}
                onChange={(e) => setPages(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Buy / Acquire URL"
                placeholder="https://store.example.com/book"
                value={buyUrl}
                onChange={(e) => setBuyUrl(e.target.value)}
              />
              <Input
                label="Read Sample URL"
                placeholder="https://..."
                value={readUrl}
                onChange={(e) => setReadUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-3 shadow-xs">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
                Book Jacket Cover
              </h4>

              {cover ? (
                <div className="space-y-2">
                  <div className="relative aspect-[2/3] w-full rounded-xs overflow-hidden border border-ink-200">
                    <img src={cover} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsMediaPickerOpen(true)} className="w-full text-xs">
                    Change Cover
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="w-full text-xs gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Select Cover Art
                </Button>
              )}

              <div className="pt-3 border-t border-parchment-200 dark:border-ink-800">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded-xs border-ink-300 text-amber-700"
                  />
                  <span>Feature on Homepage Gallery</span>
                </label>
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" isLoading={isSaving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Book to Catalog
            </Button>
          </div>
        </div>
      </form>

      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={(url) => setCover(url)}
        title="Select Book Cover Image"
      />
    </div>
  );
}

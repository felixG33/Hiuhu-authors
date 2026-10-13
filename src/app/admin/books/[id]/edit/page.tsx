"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function loadBook() {
      try {
        setIsLoading(true);
        const [bookRes, authorsRes] = await Promise.all([
          fetch(`/api/books/${id}`),
          fetch("/api/authors"),
        ]);

        if (bookRes.ok) {
          const { book } = await bookRes.json();
          setTitle(book.title);
          setSlug(book.slug);
          setDescription(book.description);
          setCover(book.cover || "");
          setIsbn(book.isbn || "");
          setPublisher(book.publisher || "HIUHU Press");
          setPublicationDate(
            book.publicationDate ? new Date(book.publicationDate).toISOString().split("T")[0] : ""
          );
          setGenre(book.genre || "");
          setPages(book.pages || "");
          setBuyUrl(book.buyUrl || "");
          setReadUrl(book.readUrl || "");
          setIsFeatured(book.isFeatured);
          setAuthorId(book.authorId);
        } else {
          toastError("Failed to load book");
        }

        if (authorsRes.ok) {
          const aData = await authorsRes.json();
          setAuthors(aData.authors || []);
        }
      } catch {
        toastError("Error loading book");
      } finally {
        setIsLoading(false);
      }
    }
    loadBook();
  }, [id]);

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
        slug,
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

      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update book");
      }

      success("Book updated successfully");
      router.push("/admin/books");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update book");
      toastError(err.message || "Error updating book");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center font-serif text-ink-500">Loading book record...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/books" className="p-1.5 rounded-sm hover:bg-parchment-200 text-ink-600">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-serif text-2xl font-bold">Edit Book Record</h1>
        </div>
      </div>

      {errorMsg && <p className="text-xs text-crimson-600 font-mono">{errorMsg}</p>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
            <Input
              label="Book Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
              <Input label="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
              <Input
                label="Publication Date"
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
              <Input
                label="Page Count"
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Buy / Acquire URL" value={buyUrl} onChange={(e) => setBuyUrl(e.target.value)} />
              <Input label="Read Sample URL" value={readUrl} onChange={(e) => setReadUrl(e.target.value)} />
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
              Update Book
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

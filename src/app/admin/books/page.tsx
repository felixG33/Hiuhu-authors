"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch {
      toastError("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/books/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Book removed from catalog");
        setDeleteTargetId(null);
        fetchBooks();
      } else {
        const err = await res.json();
        toastError(err.error || "Delete failed");
      }
    } catch {
      toastError("Delete error");
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Title",
      accessorKey: "title",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 rounded-xs overflow-hidden bg-parchment-200 shrink-0 border">
            {row.cover ? (
              <img src={row.cover} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-[10px]">Book</div>
            )}
          </div>
          <div>
            <Link
              href={`/admin/books/${row.id}/edit`}
              className="font-serif font-bold text-sm text-ink-950 dark:text-parchment-50 hover:text-amber-800 transition-colors"
            >
              {row.title}
            </Link>
            <p className="text-[11px] font-mono text-ink-400">ISBN: {row.isbn || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Author",
      cell: (row) => (
        <span className="font-serif text-xs text-ink-800 dark:text-parchment-200">
          {row.author?.name}
        </span>
      ),
    },
    {
      header: "Genre",
      accessorKey: "genre",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs text-ink-600">{row.genre || "—"}</span>,
    },
    {
      header: "Publisher",
      accessorKey: "publisher",
      cell: (row) => <span className="text-xs text-ink-600">{row.publisher || "HIUHU Press"}</span>,
    },
    {
      header: "Publication Date",
      accessorKey: "publicationDate",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-ink-500">{formatDate(row.publicationDate) || "—"}</span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/books/${row.slug}`}
            target="_blank"
            className="p-1 text-ink-400 hover:text-ink-800"
            title="View public page"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/admin/books/${row.id}/edit`}
            className="p-1 text-ink-400 hover:text-amber-800"
            title="Edit"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1 text-ink-400 hover:text-crimson-600"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Books & Editions</h1>
          <p className="text-xs font-mono text-ink-500">
            Manage hardcovers, chapbooks, and published editions in the catalog
          </p>
        </div>

        <Link href="/admin/books/new">
          <Button variant="gold" size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Book Record</span>
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={books}
        searchKey="title"
        searchPlaceholder="Filter books by title or ISBN..."
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Book Record"
        description="Are you sure you want to remove this book from the catalog? This action cannot be undone."
        confirmLabel="Delete Book"
        onConfirm={handleDelete}
      />
    </div>
  );
}

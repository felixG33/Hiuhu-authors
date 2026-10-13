"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/authors");
      if (res.ok) {
        const data = await res.json();
        setAuthors(data.authors || []);
      }
    } catch {
      toastError("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/authors/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Author profile deleted");
        setDeleteTargetId(null);
        fetchAuthors();
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
      header: "Author",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-parchment-200 shrink-0 border">
            {row.photo ? (
              <img src={row.photo} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-xs font-bold">
                {row.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <Link
              href={`/admin/authors/${row.id}/edit`}
              className="font-serif font-bold text-sm text-ink-950 dark:text-parchment-50 hover:text-amber-800 transition-colors"
            >
              {row.name}
            </Link>
            <p className="text-[11px] font-mono text-ink-400">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      accessorKey: "location",
      cell: (row) => (
        <span className="text-xs text-ink-600 flex items-center gap-1">
          {row.location && <MapPin className="h-3 w-3 text-ink-400" />}
          {row.location || "—"}
        </span>
      ),
    },
    {
      header: "Genres",
      accessorKey: "genres",
      cell: (row) => <span className="font-mono text-xs text-ink-500">{row.genres || "General"}</span>,
    },
    {
      header: "Works",
      cell: (row) => (
        <span className="font-mono text-xs text-ink-600">
          {(row._count?.contentItems || 0) + (row._count?.books || 0)} works
        </span>
      ),
    },
    {
      header: "Featured",
      cell: (row) => (
        <span
          className={`px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase ${
            row.isFeatured
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : "text-ink-400"
          }`}
        >
          {row.isFeatured ? "Featured" : "Standard"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/authors/${row.slug}`}
            target="_blank"
            className="p-1 text-ink-400 hover:text-ink-800"
            title="View public profile"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/admin/authors/${row.id}/edit`}
            className="p-1 text-ink-400 hover:text-amber-800"
            title="Edit profile"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            className="p-1 text-ink-400 hover:text-crimson-600"
            title="Delete profile"
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
          <h1 className="font-serif text-3xl font-bold">Authors Roster</h1>
          <p className="text-xs font-mono text-ink-500">
            Manage resident authors, biographies, literary genres, and profiles
          </p>
        </div>

        <Link href="/admin/authors/new">
          <Button variant="gold" size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Author Profile</span>
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={authors}
        searchKey="name"
        searchPlaceholder="Filter authors by name..."
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Author Profile"
        description="Are you sure you want to delete this author profile? All published works linked to this author will be removed."
        confirmLabel="Confirm Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

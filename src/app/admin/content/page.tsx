"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Edit3, Trash2, Eye, Feather, FileText, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export default function AdminContentPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const fetchContent = async () => {
    try {
      setLoading(true);
      const url = initialType ? `/api/content?type=${initialType}` : "/api/content";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      toastError("Failed to load content list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [initialType]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/content/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Publication deleted successfully");
        setDeleteTargetId(null);
        fetchContent();
      } else {
        const err = await res.json();
        toastError(err.error || "Delete failed");
      }
    } catch {
      toastError("An error occurred while deleting");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await fetch(`/api/content/${id}`, { method: "DELETE" });
      }
      success(`Deleted ${ids.length} publications`);
      fetchContent();
    } catch {
      toastError("Bulk delete error");
    }
  };

  const handleBulkPublish = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const item = items.find((i) => i.id === id);
        if (item) {
          await fetch(`/api/content/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, status: "PUBLISHED" }),
          });
        }
      }
      success(`Published ${ids.length} publications`);
      fetchContent();
    } catch {
      toastError("Bulk publish error");
    }
  };

  const columns: Column<any>[] = [
    {
      header: "Title",
      accessorKey: "title",
      sortable: true,
      cell: (row) => (
        <div>
          <Link
            href={`/admin/content/${row.id}/edit`}
            className="font-serif font-bold text-sm text-ink-950 dark:text-parchment-50 hover:text-amber-800 transition-colors line-clamp-1"
          >
            {row.title}
          </Link>
          <span className="text-[11px] font-mono text-ink-400">/{row.slug}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs text-ink-600 dark:text-parchment-300 flex items-center gap-1">
          {row.type === "POEM" && <Feather className="h-3 w-3 text-amber-700" />}
          {row.type === "STORY" && <Bookmark className="h-3 w-3 text-blue-700" />}
          {row.type === "ARTICLE" && <FileText className="h-3 w-3 text-purple-700" />}
          {row.type}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Author",
      accessorKey: "author",
      cell: (row) => (
        <span className="font-serif text-xs text-ink-800 dark:text-parchment-200">
          {row.author?.name || "Unknown"}
        </span>
      ),
    },
    {
      header: "Category",
      cell: (row) => (
        <span className="text-xs text-ink-500 font-mono">
          {row.category?.name || "—"}
        </span>
      ),
    },
    {
      header: "Published",
      accessorKey: "publishedAt",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-ink-500">
          {formatDate(row.publishedAt) || "Unpublished"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => {
        const publicPath =
          row.type === "POEM"
            ? `/poems/${row.slug}`
            : row.type === "STORY"
            ? `/stories/${row.slug}`
            : `/articles/${row.slug}`;

        return (
          <div className="flex items-center gap-2">
            <Link
              href={publicPath}
              target="_blank"
              className="p-1 text-ink-400 hover:text-ink-800 dark:hover:text-parchment-200"
              title="Preview on public site"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/admin/content/${row.id}/edit`}
              className="p-1 text-ink-400 hover:text-amber-800"
              title="Edit in Studio"
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
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Content Manager</h1>
          <p className="text-xs font-mono text-ink-500">
            Publish, edit, preview, and archive articles, poems, and short stories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/content/new">
            <Button variant="gold" size="md" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Publication</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={items}
        searchKey="title"
        searchPlaceholder="Filter publications by title..."
        filterOptions={[
          {
            label: "Status",
            key: "status",
            options: [
              { label: "Published", value: "PUBLISHED" },
              { label: "Draft", value: "DRAFT" },
              { label: "Pending Review", value: "PENDING_REVIEW" },
              { label: "Archived", value: "ARCHIVED" },
            ],
          },
          {
            label: "Type",
            key: "type",
            options: [
              { label: "Articles", value: "ARTICLE" },
              { label: "Poems", value: "POEM" },
              { label: "Stories", value: "STORY" },
            ],
          },
        ]}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Archive / Delete Publication"
        description="Are you sure you want to delete this literary work? It will be archived and removed from public access."
        confirmLabel="Confirm Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

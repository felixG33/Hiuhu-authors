"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { Plus, Edit2, Trash2, Tag, Loader2 } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: {
    contents: number;
  };
}

export default function TagsAdminPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagItem | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const { success, error: toastError } = useToast();

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (err) {
      toastError("Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (t: TagItem) => {
    setEditingTag(t);
    setName(t.name);
    setSlug(t.slug);
    setDescription(t.description || "");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingTag) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        slug: slug || slugify(name),
        description: description || null,
      };

      const url = editingTag ? `/api/tags/${editingTag.id}` : "/api/tags";
      const method = editingTag ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save tag");

      success(editingTag ? "Tag updated" : "Tag created");
      setIsModalOpen(false);
      fetchTags();
    } catch (err: any) {
      toastError(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTag) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/tags/${deletingTag.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete tag");

      success("Tag deleted successfully");
      setDeletingTag(null);
      fetchTags();
    } catch (err: any) {
      toastError(err.message || "Failed to delete tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Tags & Metadata</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Faceted descriptors and keywords for cross-cutting literary exploration.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={openCreateModal} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-parchment-300 rounded-sm">
          <Tag className="h-8 w-8 mx-auto text-ink-300 mb-2" />
          <p className="text-sm text-ink-500 font-serif">No tags registered yet.</p>
        </div>
      ) : (
        <div className="border border-parchment-300 dark:border-ink-800 rounded-sm overflow-hidden bg-white dark:bg-ink-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-parchment-100 dark:bg-ink-800/60 border-b border-parchment-200 dark:border-ink-800 text-ink-600 dark:text-parchment-300 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tag Name</th>
                  <th className="py-3 px-4 font-semibold">Slug</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Assigned Count</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200 dark:divide-ink-800">
                {tags.map((t) => (
                  <tr key={t.id} className="hover:bg-parchment-50/50 dark:hover:bg-ink-800/30 transition-colors">
                    <td className="py-3 px-4 font-serif font-medium text-ink-900 dark:text-parchment-100">
                      <span className="inline-flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-ink-400" />
                        #{t.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-500">/{t.slug}</td>
                    <td className="py-3 px-4 text-ink-600 dark:text-parchment-400 max-w-xs truncate">
                      {t.description || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-parchment-200 dark:bg-ink-800 text-ink-700 dark:text-parchment-300">
                        {t._count?.contents ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 gap-1 text-ink-600"
                          onClick={() => openEditModal(t)}
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-crimson-600 hover:text-crimson-700 hover:bg-crimson-50 dark:hover:bg-crimson-950/30"
                          onClick={() => setDeletingTag(t)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-ink-900 border border-parchment-300 dark:border-ink-800 rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold">{editingTag ? "Edit Tag" : "New Tag"}</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Tag Name"
                required
                placeholder="e.g. existentialism, surrealism"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />

              <Input label="Slug" placeholder="existentialism" value={slug} onChange={(e) => setSlug(e.target.value)} />

              <Textarea
                label="Description"
                rows={3}
                placeholder="Editorial context for this literary tag..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment-200 dark:border-ink-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
                  {editingTag ? "Update Tag" : "Create Tag"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingTag}
        title="Delete Tag"
        description={`Are you sure you want to delete tag "#${deletingTag?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTag(null)}
      />
    </div>
  );
}

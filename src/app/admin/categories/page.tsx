"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { Plus, Edit2, Trash2, FolderPlus, Loader2, Palette } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accentColor: string | null;
  _count?: {
    contentItems: number;
  };
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState("#b45309");

  const { success, error: toastError } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      toastError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setAccentColor("#b45309");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setAccentColor(cat.accentColor || "#b45309");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
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
        accentColor: accentColor || null,
      };

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");

      success(editingCategory ? "Category updated" : "Category created");
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toastError(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");

      success("Category deleted successfully");
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      toastError(err.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Categories & Taxonomy</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Organize articles, poetry, and stories into overarching literary themes.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={openCreateModal} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-parchment-300 rounded-sm">
          <FolderPlus className="h-8 w-8 mx-auto text-ink-300 mb-2" />
          <p className="text-sm text-ink-500 font-serif">No categories created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-black/10"
                      style={{ backgroundColor: cat.accentColor || "#b45309" }}
                    />
                    <h3 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-100">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-parchment-200 dark:bg-ink-800 text-ink-600 dark:text-parchment-300">
                    {cat._count?.contentItems ?? 0} works
                  </span>
                </div>
                <p className="font-mono text-xs text-ink-400 dark:text-ink-500 mb-2">/{cat.slug}</p>
                {cat.description && (
                  <p className="font-serif text-xs text-ink-600 dark:text-parchment-400 line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-parchment-200 dark:border-ink-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 gap-1 text-ink-600"
                  onClick={() => openEditModal(cat)}
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 text-crimson-600 hover:text-crimson-700 hover:bg-crimson-50 dark:hover:bg-crimson-950/30"
                  onClick={() => setDeletingCategory(cat)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-ink-900 border border-parchment-300 dark:border-ink-800 rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold">
              {editingCategory ? "Edit Category" : "New Literary Category"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Category Name"
                required
                placeholder="e.g. Critical Theory, Lyric Poetry"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />

              <Input
                label="URL Slug"
                placeholder="critical-theory"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <Textarea
                label="Description"
                rows={3}
                placeholder="Brief summary of what content belongs in this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div>
                <label className="text-xs font-mono font-semibold uppercase text-ink-700 dark:text-parchment-300 block mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 p-0 border border-parchment-300 rounded cursor-pointer"
                  />
                  <Input
                    className="font-mono text-xs"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment-200 dark:border-ink-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingCategory}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? You can only delete categories with 0 assigned publications.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}

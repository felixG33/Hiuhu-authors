"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { Plus, ArrowUp, ArrowDown, Trash2, Save, Loader2, Link as LinkIcon, ExternalLink } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  location: "HEADER" | "FOOTER";
  order: number;
  isEnabled: boolean;
  openInNewTab: boolean;
}

export default function NavigationAdminPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Item State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("");
  const [newLocation, setNewLocation] = useState<"HEADER" | "FOOTER">("HEADER");
  const [newOpenInNewTab, setNewOpenInNewTab] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchNav = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/navigation");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      toastError("Failed to fetch navigation items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNav();
  }, []);

  const headerItems = items.filter((i) => i.location === "HEADER").sort((a, b) => a.order - b.order);
  const footerItems = items.filter((i) => i.location === "FOOTER").sort((a, b) => a.order - b.order);

  const moveItem = (location: "HEADER" | "FOOTER", index: number, direction: "up" | "down") => {
    const list = location === "HEADER" ? [...headerItems] : [...footerItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // renumber
    list.forEach((item, idx) => {
      item.order = idx + 1;
    });

    const otherList = items.filter((i) => i.location !== location);
    setItems([...otherList, ...list]);
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEnabled: !item.isEnabled } : item))
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update navigation");

      success("Navigation layout saved successfully");
      fetchNav();
    } catch (err: any) {
      toastError(err.message || "Failed to save navigation");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newPath.trim()) return;

    try {
      setSaving(true);
      const maxOrder = items.filter((i) => i.location === newLocation).length;

      const res = await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel,
          path: newPath,
          location: newLocation,
          order: maxOrder + 1,
          isEnabled: true,
          openInNewTab: newOpenInNewTab,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add navigation item");

      success("Navigation item added");
      setNewLabel("");
      setNewPath("");
      setIsAddOpen(false);
      fetchNav();
    } catch (err: any) {
      toastError(err.message || "Failed to add navigation item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/navigation?id=${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete item");

      success("Navigation item deleted");
      setDeletingId(null);
      fetchNav();
    } catch (err: any) {
      toastError(err.message || "Failed to delete item");
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (title: string, list: NavItem[], location: "HEADER" | "FOOTER") => (
    <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-parchment-100">{title}</h3>
        <span className="text-xs font-mono text-ink-400">{list.length} links</span>
      </div>

      {list.length === 0 ? (
        <p className="text-xs text-ink-400 font-serif italic py-4">No navigation links configured.</p>
      ) : (
        <div className="divide-y divide-parchment-200 dark:divide-ink-800 border border-parchment-200 dark:border-ink-800 rounded-sm overflow-hidden">
          {list.map((item, idx) => (
            <div
              key={item.id}
              className={`p-3 flex items-center justify-between text-xs transition-colors ${
                item.isEnabled ? "bg-white dark:bg-ink-900" : "bg-parchment-100/50 dark:bg-ink-950/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-ink-400 w-4">#{item.order}</span>
                <div>
                  <div className="flex items-center gap-1.5 font-serif font-medium text-ink-900 dark:text-parchment-100">
                    <span>{item.label}</span>
                    {item.openInNewTab && <ExternalLink className="h-3 w-3 text-ink-400" />}
                  </div>
                  <p className="font-mono text-[11px] text-ink-500">{item.path}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`px-2 py-1 rounded-xs border text-[11px] font-mono ${
                    item.isEnabled
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-parchment-300 text-ink-500 bg-parchment-100 dark:bg-ink-800"
                  }`}
                >
                  {item.isEnabled ? "Active" : "Disabled"}
                </button>

                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(location, idx, "up")}
                  className="p-1 rounded-xs border border-parchment-300 dark:border-ink-700 hover:bg-parchment-100 dark:hover:bg-ink-800 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  disabled={idx === list.length - 1}
                  onClick={() => moveItem(location, idx, "down")}
                  className="p-1 rounded-xs border border-parchment-300 dark:border-ink-700 hover:bg-parchment-100 dark:hover:bg-ink-800 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingId(item.id)}
                  className="p-1 rounded-xs text-crimson-600 hover:bg-crimson-50 dark:hover:bg-crimson-950/40 ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Navigation Menus</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Configure header masthead and footer catalog navigational pathways.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
          <Button variant="gold" size="sm" onClick={handleSaveAll} isLoading={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {renderSection("Header Masthead Navigation", headerItems, "HEADER")}
          {renderSection("Footer Literary Catalog Navigation", footerItems, "FOOTER")}
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-ink-900 border border-parchment-300 dark:border-ink-800 rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold">Add Navigation Link</h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <Input
                label="Link Label"
                required
                placeholder="e.g. Anthologies, Essays, Archive"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />

              <Input
                label="Target Path / URL"
                required
                placeholder="e.g. /articles or https://..."
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
              />

              <div>
                <label className="text-xs font-mono font-semibold uppercase text-ink-700 dark:text-parchment-300 block mb-1">
                  Menu Location
                </label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value as "HEADER" | "FOOTER")}
                  className="w-full text-xs p-2 rounded-sm border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-950"
                >
                  <option value="HEADER">Header Masthead</option>
                  <option value="FOOTER">Footer Links</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newOpenInNewTab}
                    onChange={(e) => setNewOpenInNewTab(e.target.checked)}
                    className="rounded-xs border-ink-300 text-amber-700"
                  />
                  <span>Open link in new browser tab</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-parchment-200 dark:border-ink-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" size="sm" isLoading={saving}>
                  Create Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        title="Delete Navigation Item"
        description="Are you sure you want to remove this navigation link?"
        confirmLabel="Delete"
        variant="danger"
        isLoading={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

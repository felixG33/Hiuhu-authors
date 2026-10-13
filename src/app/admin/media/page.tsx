"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatBytes } from "@/lib/utils";
import { Upload, Search, Copy, Check, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  caption: string | null;
  createdAt: string;
}

export default function MediaAdminPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { success, error: toastError } = useToast();

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      toastError("Failed to fetch media assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
      }

      success("Media uploaded successfully");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMedia();
    } catch (err: any) {
      toastError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success("Asset URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/media/${deletingItem.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete media");

      success("Media deleted successfully");
      setDeletingItem(null);
      fetchMedia();
    } catch (err: any) {
      toastError(err.message || "Failed to delete media");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Media Repository</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Book covers, author portraits, manuscript plates, and editorial imagery.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
            multiple
          />
          <Button
            variant="gold"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Assets
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <Input
            placeholder="Search filenames..."
            className="pl-9 py-1.5 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-parchment-300 rounded-sm">
          <ImageIcon className="h-10 w-10 mx-auto text-ink-300 mb-3" />
          <p className="text-sm text-ink-500 font-serif">No media items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-xs hover:border-amber-700/50 transition-all flex flex-col"
            >
              <div className="aspect-square w-full bg-parchment-100 dark:bg-ink-950 flex items-center justify-center overflow-hidden relative">
                {item.mimeType.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-ink-400 font-mono text-xs uppercase p-2 text-center">
                    {item.mimeType.split("/")[1] || "FILE"}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyToClipboard(item.url, item.id)}
                    title="Copy URL"
                    className="p-1.5 rounded-full bg-white text-ink-800 hover:bg-parchment-200 shadow-md"
                  >
                    {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    title="Delete Media"
                    className="p-1.5 rounded-full bg-crimson-600 text-white hover:bg-crimson-700 shadow-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <p className="text-[11px] font-mono truncate text-ink-800 dark:text-parchment-200" title={item.originalName}>
                  {item.originalName}
                </p>
                <div className="flex items-center justify-between text-[10px] text-ink-400 font-mono mt-1">
                  <span>{formatBytes(item.size)}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingItem}
        title="Delete Media Asset"
        description={`Permanently remove "${deletingItem?.originalName}" from the media storage and database? Any content referencing this URL may lose its visual plate.`}
        confirmLabel="Delete Asset"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}

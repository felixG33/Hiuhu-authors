"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, Search, Image as ImageIcon, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  title = "Select Media",
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/media?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload file");
      }

      const newMedia = await res.json();
      success("Media uploaded successfully");
      setSelectedUrl(newMedia.item.url);
      fetchMedia();
    } catch (err: any) {
      toastError(err.message || "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Choose an existing image from the media library or upload a new one.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <Input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button type="button" variant="outline" size="md" isLoading={isUploading} className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </label>
        </div>

        {/* Media Grid */}
        <div className="border border-parchment-300 dark:border-ink-800 rounded-sm p-3 min-h-[300px] max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-ink-400">Loading library...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-ink-400 space-y-2">
              <ImageIcon className="h-8 w-8 stroke-1 text-ink-300" />
              <p className="text-sm">No media items found. Upload an image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative aspect-square rounded-xs overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? "border-amber-700 ring-2 ring-amber-700/50 shadow-md"
                        : "border-parchment-200 dark:border-ink-800 hover:border-ink-400"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-amber-700 text-white rounded-full p-1 shadow-xs">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-ink-950/80 p-1 text-[10px] text-parchment-100 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.originalName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="gold" onClick={handleConfirm} disabled={!selectedUrl}>
          Use Selected Image
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

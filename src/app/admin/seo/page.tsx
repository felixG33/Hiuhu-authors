"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { useToast } from "@/components/ui/Toast";
import { Save, Image as ImageIcon, Globe, Search, Loader2 } from "lucide-react";

interface SeoConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultOgImage: string;
  twitterHandle: string;
  schemaOrganization: string;
}

export default function SeoAdminPage() {
  const [config, setConfig] = useState<SeoConfig>({
    defaultTitle: "",
    defaultDescription: "",
    defaultKeywords: "",
    defaultOgImage: "",
    twitterHandle: "",
    schemaOrganization: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function fetchSeo() {
      try {
        setLoading(true);
        const res = await fetch("/api/seo");
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      } catch (err) {
        toastError("Failed to fetch SEO configuration");
      } finally {
        setLoading(false);
      }
    }

    fetchSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update SEO config");

      success("Global SEO and OpenGraph metadata updated successfully");
    } catch (err: any) {
      toastError(err.message || "Failed to update SEO");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Global SEO & Social Graph</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Configure search engine discovery defaults, OpenGraph cards, and structured schema tokens.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={handleSave} isLoading={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-parchment-200 dark:border-ink-800 pb-2">
            <Search className="h-4 w-4 text-amber-700" />
            <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100">
              Search Engine Meta
            </h3>
          </div>

          <Input
            label="Default Document Title"
            value={config.defaultTitle}
            onChange={(e) => setConfig({ ...config, defaultTitle: e.target.value })}
            placeholder="HIUHU — A Literary Sanctuary"
            helperText="Appended or used as fallback across pages missing custom titles."
          />

          <Textarea
            label="Default Meta Description"
            rows={3}
            value={config.defaultDescription}
            onChange={(e) => setConfig({ ...config, defaultDescription: e.target.value })}
            placeholder="An independent publishing platform for discerning authors and readers..."
            helperText="150-160 characters recommended for high-performing SERP snippets."
          />

          <Input
            label="Default Meta Keywords"
            value={config.defaultKeywords}
            onChange={(e) => setConfig({ ...config, defaultKeywords: e.target.value })}
            placeholder="authors, literature, poetry, essays, books, publishing, HIUHU"
          />
        </div>

        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-parchment-200 dark:border-ink-800 pb-2">
            <Globe className="h-4 w-4 text-amber-700" />
            <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100">
              Social Sharing & OpenGraph
            </h3>
          </div>

          <div>
            <label className="text-xs font-mono font-semibold uppercase text-ink-700 dark:text-parchment-300 block mb-1">
              Default OpenGraph Social Card Image (1200x630px recommended)
            </label>
            <div className="flex items-center gap-3">
              <Input
                className="font-mono text-xs flex-1"
                placeholder="https://..."
                value={config.defaultOgImage}
                onChange={(e) => setConfig({ ...config, defaultOgImage: e.target.value })}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMediaPickerOpen(true)}
                className="gap-1 text-xs"
              >
                <ImageIcon className="h-4 w-4" />
                Select
              </Button>
            </div>
            {config.defaultOgImage && (
              <div className="mt-2 w-48 h-24 border border-parchment-300 dark:border-ink-800 rounded-xs overflow-hidden">
                <img src={config.defaultOgImage} alt="OG Card" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Twitter / X Site Handle"
              value={config.twitterHandle}
              onChange={(e) => setConfig({ ...config, twitterHandle: e.target.value })}
              placeholder="@HIUHUpress"
            />

            <Input
              label="Schema.org Organization Entity"
              value={config.schemaOrganization}
              onChange={(e) => setConfig({ ...config, schemaOrganization: e.target.value })}
              placeholder="HIUHU Press"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="gold" size="lg" isLoading={saving} className="gap-2">
            <Save className="h-4 w-4" />
            Save SEO Metadata
          </Button>
        </div>
      </form>

      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={(url) => setConfig({ ...config, defaultOgImage: url })}
        title="Select OpenGraph Social Card"
      />
    </div>
  );
}

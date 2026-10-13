"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { useToast } from "@/components/ui/Toast";
import { ArrowUp, ArrowDown, Eye, EyeOff, Save, Image as ImageIcon, Loader2 } from "lucide-react";

interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface HomepageConfig {
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  sections: SectionConfig[];
}

export default function HomepageAdminPage() {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/homepage");
      const data = await res.json();
      if (data.config) {
        // Sort sections by order
        data.config.sections.sort((a: SectionConfig, b: SectionConfig) => a.order - b.order);
        setConfig(data.config);
      }
    } catch (err) {
      toastError("Failed to fetch homepage configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.sections.length) return;

    const newSections = [...config.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // re-assign order numbers
    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setConfig({ ...config, sections: newSections });
  };

  const toggleSection = (id: string) => {
    if (!config) return;
    const newSections = config.sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setConfig({ ...config, sections: newSections });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      setSaving(true);
      const res = await fetch("/api/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update configuration");

      success("Homepage layout and content saved successfully");
    } catch (err: any) {
      toastError(err.message || "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
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
          <h1 className="font-serif text-2xl font-bold">Homepage Editorial Layout</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Customize the editorial hero showcase and arrange homepage literary modules.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={handleSave} isLoading={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hero Section Card */}
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-parchment-100">
            Masthead & Hero Showcase
          </h3>

          <Input
            label="Hero Headline Title"
            value={config.heroTitle}
            onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
            placeholder="e.g. Where Voices Echo Through Time"
          />

          <Textarea
            label="Hero Literary Statement / Description"
            rows={3}
            value={config.heroDescription}
            onChange={(e) => setConfig({ ...config, heroDescription: e.target.value })}
            placeholder="Short intro describing the publication philosophy..."
          />

          <div>
            <label className="text-xs font-mono font-semibold uppercase text-ink-700 dark:text-parchment-300 block mb-1">
              Background Hero Illustration (Optional)
            </label>
            <div className="flex items-center gap-3">
              <Input
                className="font-mono text-xs flex-1"
                placeholder="https://..."
                value={config.heroImage}
                onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
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
          </div>
        </div>

        {/* Section Ordering & Visibility */}
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-parchment-100">
              Homepage Module Order & Visibility
            </h3>
            <p className="text-xs text-ink-500 font-serif">
              Reorder or hide frontpage curated content sections.
            </p>
          </div>

          <div className="divide-y divide-parchment-200 dark:divide-ink-800 border border-parchment-200 dark:border-ink-800 rounded-sm overflow-hidden">
            {config.sections.map((section, idx) => (
              <div
                key={section.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  section.enabled
                    ? "bg-white dark:bg-ink-900"
                    : "bg-parchment-100/50 dark:bg-ink-950/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink-400 w-6">#{section.order}</span>
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-ink-900 dark:text-parchment-100">
                      {section.name}
                    </h4>
                    <p className="font-mono text-[10px] text-ink-400">ID: {section.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`p-1.5 rounded-sm border text-xs flex items-center gap-1 ${
                      section.enabled
                        ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
                        : "border-parchment-300 text-ink-500 bg-parchment-100 dark:bg-ink-800"
                    }`}
                  >
                    {section.enabled ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-mono">Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-mono">Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, "up")}
                    className="p-1.5 rounded-sm border border-parchment-300 dark:border-ink-700 hover:bg-parchment-100 dark:hover:bg-ink-800 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === config.sections.length - 1}
                    onClick={() => moveSection(idx, "down")}
                    className="p-1.5 rounded-sm border border-parchment-300 dark:border-ink-700 hover:bg-parchment-100 dark:hover:bg-ink-800 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="gold" size="lg" isLoading={saving} className="gap-2">
            <Save className="h-4 w-4" />
            Save Homepage Configuration
          </Button>
        </div>
      </form>

      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={(url) => setConfig({ ...config, heroImage: url })}
        title="Select Hero Artwork"
      />
    </div>
  );
}

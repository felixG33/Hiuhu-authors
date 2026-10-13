"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Save, Settings, Shield, MessageSquare, Globe, Loader2 } from "lucide-react";

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: "HIUHU",
    site_tagline: "Where Voices Echo Through Time",
    site_description: "An independent publishing platform celebrating extraordinary literature and deep contemplation.",
    admin_email: "admin@hiuhu.org",
    comments_enabled: "true",
    comments_require_approval: "true",
    allow_author_registrations: "true",
    footer_copyright: "© 2026 HIUHU Publishing. All rights reserved.",
    social_twitter: "@HIUHUpress",
    social_instagram: "@hiuhu_press",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        toastError("Failed to fetch platform settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      success("Platform settings saved successfully");
    } catch (err: any) {
      toastError(err.message || "Failed to save settings");
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
          <h1 className="font-serif text-2xl font-bold">Platform Configuration</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Global operational controls, publishing parameters, and platform branding.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={handleSave} isLoading={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Identity */}
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-parchment-200 dark:border-ink-800 pb-2">
            <Settings className="h-4 w-4 text-amber-700" />
            <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100">
              Identity & Publishing Name
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Name"
              value={settings.site_name || ""}
              onChange={(e) => handleChange("site_name", e.target.value)}
              placeholder="HIUHU"
            />
            <Input
              label="Contact / Admin Email"
              value={settings.admin_email || ""}
              onChange={(e) => handleChange("admin_email", e.target.value)}
              placeholder="admin@hiuhu.org"
            />
          </div>

          <Input
            label="Tagline / Motto"
            value={settings.site_tagline || ""}
            onChange={(e) => handleChange("site_tagline", e.target.value)}
            placeholder="Where Voices Echo Through Time"
          />

          <Textarea
            label="Platform Editorial Mission"
            rows={3}
            value={settings.site_description || ""}
            onChange={(e) => handleChange("site_description", e.target.value)}
          />

          <Input
            label="Footer Copyright Statement"
            value={settings.footer_copyright || ""}
            onChange={(e) => handleChange("footer_copyright", e.target.value)}
            placeholder="© 2026 HIUHU Publishing. All rights reserved."
          />
        </div>

        {/* Discourse & Comment Policy */}
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-parchment-200 dark:border-ink-800 pb-2">
            <MessageSquare className="h-4 w-4 text-amber-700" />
            <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100">
              Reader Discourse & Moderation Protocols
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={settings.comments_enabled === "true"}
                onChange={(e) => handleChange("comments_enabled", e.target.checked ? "true" : "false")}
                className="rounded-xs border-ink-300 text-amber-700"
              />
              <div>
                <span className="font-serif font-semibold text-ink-900 dark:text-parchment-100 block">
                  Enable Reader Comments & Discourse
                </span>
                <span className="text-[11px] text-ink-500 font-sans">
                  Allows visitors and readers to submit thoughts on articles, poetry, and stories.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={settings.comments_require_approval === "true"}
                onChange={(e) =>
                  handleChange("comments_require_approval", e.target.checked ? "true" : "false")
                }
                className="rounded-xs border-ink-300 text-amber-700"
              />
              <div>
                <span className="font-serif font-semibold text-ink-900 dark:text-parchment-100 block">
                  Require Editorial Approval Before Publishing Comments
                </span>
                <span className="text-[11px] text-ink-500 font-sans">
                  Submitted comments remain in the Moderation Queue until approved by an Editor or Super Admin.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_author_registrations === "true"}
                onChange={(e) =>
                  handleChange("allow_author_registrations", e.target.checked ? "true" : "false")
                }
                className="rounded-xs border-ink-300 text-amber-700"
              />
              <div>
                <span className="font-serif font-semibold text-ink-900 dark:text-parchment-100 block">
                  Allow Public Reader & Author Registration
                </span>
                <span className="text-[11px] text-ink-500 font-sans">
                  Enables the public registration form for new readers to join HIUHU.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Social Presence */}
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-parchment-200 dark:border-ink-800 pb-2">
            <Globe className="h-4 w-4 text-amber-700" />
            <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100">
              Social Channels & Broadcaster Handles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Twitter / X Press Account"
              value={settings.social_twitter || ""}
              onChange={(e) => handleChange("social_twitter", e.target.value)}
              placeholder="@HIUHUpress"
            />
            <Input
              label="Instagram Literary Account"
              value={settings.social_instagram || ""}
              onChange={(e) => handleChange("social_instagram", e.target.value)}
              placeholder="@hiuhu_press"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="gold" size="lg" isLoading={saving} className="gap-2">
            <Save className="h-4 w-4" />
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

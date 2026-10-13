"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EditorField } from "@/components/admin/EditorField";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Save, Send, Image as ImageIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get("type") || "ARTICLE") as "ARTICLE" | "POEM" | "STORY";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"ARTICLE" | "POEM" | "STORY">(defaultType);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PENDING_REVIEW" | "PUBLISHED">("DRAFT");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [allowComments, setAllowComments] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function loadMeta() {
      try {
        const [authRes, authorsRes, catRes, tagRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/authors"),
          fetch("/api/categories"),
          fetch("/api/tags"),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          setCurrentUser(authData.user);
          if (authData.user?.authorProfile?.id) {
            setAuthorId(authData.user.authorProfile.id);
          }
        }
        if (authorsRes.ok) {
          const aData = await authorsRes.json();
          setAuthors(aData.authors || []);
          if (!authorId && aData.authors?.[0]) {
            setAuthorId(aData.authors[0].id);
          }
        }
        if (catRes.ok) {
          const cData = await catRes.json();
          setCategories(cData.categories || []);
        }
        if (tagRes.ok) {
          const tData = await tagRes.json();
          setTags(tData.tags || []);
        }
      } catch {
        // ignore
      }
    }
    loadMeta();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (targetStatus: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED") => {
    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Content body cannot be empty");
      return;
    }
    if (!authorId) {
      setErrorMsg("Please select an author");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");

      const payload = {
        title,
        slug: slug || slugify(title),
        type,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        status: targetStatus,
        authorId,
        categoryId: categoryId || null,
        tagIds: selectedTagIds,
        allowComments,
        isFeatured,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
      };

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save publication");
      }

      success("Publication created successfully", `Saved as ${targetStatus.toLowerCase()}`);
      router.push("/admin/content");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create publication");
      toastError(err.message || "Error creating publication");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/content" className="p-1.5 rounded-sm hover:bg-parchment-200 dark:hover:bg-ink-800 text-ink-600">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold">Editorial Studio</h1>
            <p className="text-xs font-mono text-ink-500">Drafting New Publication</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
            className="gap-1.5 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => handleSave("PUBLISHED")}
            isLoading={isSaving}
            className="gap-1.5 text-xs"
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-sm bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 text-crimson-700 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* Main Studio Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Body Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-5 shadow-xs">
            <Input
              label="Publication Title"
              placeholder="e.g. On the Syntax of Mourning"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-serif"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300 mb-1.5">
                  Content Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-sm font-sans"
                >
                  <option value="ARTICLE">Article / Essay (Long-form prose)</option>
                  <option value="POEM">Poem (Preserves line breaks & verse)</option>
                  <option value="STORY">Short Story / Fiction</option>
                </select>
              </div>

              <Input
                label="URL Slug"
                placeholder="syntax-of-mourning"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <Textarea
              label="Excerpt / Epigraph"
              rows={2}
              placeholder="Brief summary or introductory epigraph for previews..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            {/* Rich Editor / Poetry Editor */}
            <EditorField
              value={content}
              onChange={setContent}
              label={type === "POEM" ? "Poetic Verses & Stanzas" : "Body Content"}
              isPoem={type === "POEM"}
            />
          </div>

          {/* SEO Metadata Box */}
          <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
            <h3 className="font-serif text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-700" />
              SEO & Open Graph Metadata
            </h3>
            <Input
              label="Custom SEO Title"
              placeholder="Defaults to publication title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
            <Textarea
              label="Meta Description"
              rows={2}
              placeholder="Defaults to excerpt"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
            <Input
              label="Keywords (Comma separated)"
              placeholder="solitude, memory, woolf, literary criticism"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Options Box */}
          <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
              Taxonomy & Author
            </h4>

            {/* Author selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300 mb-1">
                Author Attribution
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full h-10 px-3 rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-sm font-sans"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-sm font-sans"
              >
                <option value="">None / General</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags selection */}
            {tags.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 border border-ink-200 dark:border-ink-800 rounded-sm">
                  {tags.map((t) => {
                    const isSelected = selectedTagIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() =>
                          setSelectedTagIds((prev) =>
                            isSelected ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                          )
                        }
                        className={`px-2 py-0.5 rounded-xs text-xs font-mono transition-colors ${
                          isSelected
                            ? "bg-amber-800 text-white"
                            : "bg-parchment-200 dark:bg-ink-800 text-ink-700 dark:text-parchment-300"
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Featured toggle & Comments toggle */}
            <div className="space-y-3 pt-2 border-t border-parchment-200 dark:border-ink-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded-xs border-ink-300 text-amber-700 focus:ring-amber-700"
                />
                <span>Feature on Homepage Showcase</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="rounded-xs border-ink-300 text-amber-700 focus:ring-amber-700"
                />
                <span>Enable Reader Comments & Discourse</span>
              </label>
            </div>
          </div>

          {/* Cover Image Picker */}
          <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-3 shadow-xs">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
              Cover Image
            </h4>

            {coverImage ? (
              <div className="space-y-2">
                <div className="relative aspect-[16/9] w-full rounded-xs overflow-hidden border border-ink-200">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setIsMediaPickerOpen(true)} className="text-xs">
                    Change
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCoverImage("")} className="text-xs text-crimson-600">
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsMediaPickerOpen(true)}
                className="w-full text-xs gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Select Cover Image
              </Button>
            )}
          </div>
        </div>
      </div>

      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={(url) => setCoverImage(url)}
        title="Select Cover Image"
      />
    </div>
  );
}

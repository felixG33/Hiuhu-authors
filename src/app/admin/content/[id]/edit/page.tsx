"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { EditorField } from "@/components/admin/EditorField";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save, Send, Image as ImageIcon, Sparkles, Eye } from "lucide-react";
import Link from "next/link";

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"ARTICLE" | "POEM" | "STORY">("ARTICLE");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED">("DRAFT");
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

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { success, error: toastError } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [itemRes, authorsRes, catRes, tagRes] = await Promise.all([
          fetch(`/api/content/${id}`),
          fetch("/api/authors"),
          fetch("/api/categories"),
          fetch("/api/tags"),
        ]);

        if (itemRes.ok) {
          const { item } = await itemRes.json();
          setTitle(item.title);
          setSlug(item.slug);
          setType(item.type);
          setExcerpt(item.excerpt || "");
          setContent(item.content);
          setCoverImage(item.coverImage || "");
          setStatus(item.status);
          setAuthorId(item.authorId);
          setCategoryId(item.categoryId || "");
          setSelectedTagIds((item.tags || []).map((t: any) => t.tagId || t.tag?.id));
          setAllowComments(item.allowComments);
          setIsFeatured(item.isFeatured);
          setSeoTitle(item.seoTitle || "");
          setSeoDescription(item.seoDescription || "");
          setSeoKeywords(item.seoKeywords || "");
        } else {
          toastError("Failed to load publication");
        }

        if (authorsRes.ok) {
          const aData = await authorsRes.json();
          setAuthors(aData.authors || []);
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
        toastError("Error loading publication data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSave = async (targetStatus?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED") => {
    const finalStatus = targetStatus || status;

    if (!title.trim() || !content.trim() || !authorId) {
      setErrorMsg("Please provide title, author, and content body.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");

      const payload = {
        title,
        slug,
        type,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        status: finalStatus,
        authorId,
        categoryId: categoryId || null,
        tagIds: selectedTagIds,
        allowComments,
        isFeatured,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
      };

      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update publication");
      }

      setStatus(finalStatus);
      success("Changes saved successfully");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save publication");
      toastError(err.message || "Save error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center font-serif text-ink-500">Loading publication...</div>;
  }

  const publicUrl =
    type === "POEM"
      ? `/poems/${slug}`
      : type === "STORY"
      ? `/stories/${slug}`
      : `/articles/${slug}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/content" className="p-1.5 rounded-sm hover:bg-parchment-200 dark:hover:bg-ink-800 text-ink-600">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold">Edit Publication</h1>
            <p className="text-xs font-mono text-ink-500">Editing /{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={publicUrl} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              Preview Public View
            </Button>
          </Link>
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
            Update & Publish
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-sm bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 text-crimson-700 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-5 shadow-xs">
            <Input
              label="Publication Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                  <option value="ARTICLE">Article / Essay</option>
                  <option value="POEM">Poem (Verse formatting)</option>
                  <option value="STORY">Short Story / Fiction</option>
                </select>
              </div>

              <Input label="URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>

            <Textarea
              label="Excerpt / Epigraph"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            <EditorField
              value={content}
              onChange={setContent}
              label={type === "POEM" ? "Poetic Verses & Stanzas" : "Body Content"}
              isPoem={type === "POEM"}
            />
          </div>

          <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
            <h3 className="font-serif text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-700" />
              SEO & Metadata
            </h3>
            <Input
              label="Custom SEO Title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
            <Textarea
              label="Meta Description"
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
            <Input
              label="Keywords (Comma separated)"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
              Publication Settings
            </h4>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300 mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-sm border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-sm font-sans"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

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

          {/* Cover Image */}
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
        title="Change Cover Image"
      />
    </div>
  );
}

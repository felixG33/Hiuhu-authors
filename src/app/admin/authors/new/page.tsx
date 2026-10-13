"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";

export default function NewAuthorPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [genres, setGenres] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { success, error: toastError } = useToast();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Author name is required");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");

      const payload = {
        name,
        slug: slug || slugify(name),
        bio: bio || null,
        photo: photo || null,
        location: location || null,
        website: website || null,
        twitter: twitter || null,
        instagram: instagram || null,
        genres: genres || null,
        isFeatured,
      };

      const res = await fetch("/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create author profile");
      }

      success("Author profile created successfully");
      router.push("/admin/authors");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create author profile");
      toastError(err.message || "Error creating author");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/authors" className="p-1.5 rounded-sm hover:bg-parchment-200 text-ink-600">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-serif text-2xl font-bold">Add Author Profile</h1>
        </div>
      </div>

      {errorMsg && <p className="text-xs text-crimson-600 font-mono">{errorMsg}</p>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-4 shadow-xs">
            <Input
              label="Author Full Name"
              required
              placeholder="e.g. Gabriel Santos"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <Input label="Profile URL Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />

            <Textarea
              label="Biography"
              rows={6}
              placeholder="Write the author biography, literary history, awards..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location / City"
                placeholder="Paris, France"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                label="Genres (Comma separated)"
                placeholder="Poetry, Essays, Fiction"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Website URL"
                placeholder="https://author.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <Input
                label="Twitter / X Handle"
                placeholder="@author"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
              <Input
                label="Instagram"
                placeholder="@author_lit"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-3 shadow-xs">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
                Author Portrait Photo
              </h4>

              {photo ? (
                <div className="space-y-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-ink-200 mx-auto">
                    <img src={photo} alt="Portrait preview" className="w-full h-full object-cover" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsMediaPickerOpen(true)} className="w-full text-xs">
                    Change Photo
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="w-full text-xs gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Select Portrait
                </Button>
              )}

              <div className="pt-3 border-t border-parchment-200 dark:border-ink-800">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded-xs border-ink-300 text-amber-700"
                  />
                  <span>Feature on Homepage Masthead</span>
                </label>
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" isLoading={isSaving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Author Profile
            </Button>
          </div>
        </div>
      </form>

      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={(url) => setPhoto(url)}
        title="Select Author Portrait"
      />
    </div>
  );
}

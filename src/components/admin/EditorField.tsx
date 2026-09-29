"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Edit3,
  Feather,
  AlignLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaPickerModal } from "./MediaPickerModal";
import { calculateReadingTime } from "@/lib/utils";

interface EditorFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  isPoem?: boolean;
}

export function EditorField({
  value,
  onChange,
  label = "Content Body",
  error,
  isPoem = false,
}: EditorFieldProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousValue = textarea.value;
    const selected = previousValue.substring(start, end);

    const replacement = `${before}${selected}${after}`;
    const newValue =
      previousValue.substring(0, start) +
      replacement +
      previousValue.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  const handleInsertImage = (url: string) => {
    insertText(`\n![Image description](${url})\n`);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readingTime = calculateReadingTime(value);

  return (
    <div className="w-full space-y-2">
      {/* Label and Tabs */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-parchment-300">
          {label} {isPoem && <span className="text-amber-700 normal-case">(Poetry Layout Mode Active)</span>}
        </label>
        <div className="flex items-center space-x-1 border border-ink-200 dark:border-ink-800 rounded-sm p-0.5 bg-parchment-100 dark:bg-ink-950">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xs transition-colors ${
              activeTab === "edit"
                ? "bg-white dark:bg-ink-800 text-ink-950 dark:text-parchment-100 shadow-xs"
                : "text-ink-600 dark:text-parchment-400 hover:text-ink-900"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xs transition-colors ${
              activeTab === "preview"
                ? "bg-white dark:bg-ink-800 text-ink-950 dark:text-parchment-100 shadow-xs"
                : "text-ink-600 dark:text-parchment-400 hover:text-ink-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="border border-ink-200 dark:border-ink-800 rounded-sm overflow-hidden bg-white dark:bg-ink-950">
        {/* Editorial Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-parchment-50 dark:bg-ink-900/60 border-b border-ink-200 dark:border-ink-800 text-ink-700 dark:text-parchment-300">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("**", "**")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("*", "*")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="h-4 w-[1px] bg-ink-200 dark:bg-ink-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("## ")}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("### ")}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <div className="h-4 w-[1px] bg-ink-200 dark:bg-ink-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("> ")}
            title="Blockquote / Epigraph"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("- ")}
            title="List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("1. ")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="h-4 w-[1px] bg-ink-200 dark:bg-ink-700 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-800 dark:text-amber-400"
            onClick={() => insertText("\n\n---\n\n")}
            title="Stanza Break / Section Divider"
          >
            <Feather className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => insertText("[", "](https://)")}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMediaPickerOpen(true)}
            title="Insert Image from Media Library"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Edit or Preview Pane */}
        {activeTab === "edit" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isPoem
                ? "Enter poetry verses here... Line breaks and stanzas are preserved faithfully."
                : "Begin composing your literary work or long-form prose..."
            }
            className={`w-full min-h-[380px] p-5 font-serif text-base text-ink-950 dark:text-parchment-100 bg-transparent resize-y focus:outline-none placeholder:text-ink-400/70 ${
              isPoem ? "whitespace-pre font-serif leading-relaxed" : "leading-relaxed"
            }`}
          />
        ) : (
          <div className="min-h-[380px] p-6 font-serif max-w-prose mx-auto prose dark:prose-invert">
            {isPoem ? (
              <div className="font-serif whitespace-pre-wrap leading-relaxed text-ink-900 dark:text-parchment-100 text-lg border-l-2 border-amber-700/50 pl-6 py-2">
                {value || <span className="text-ink-400 italic">No verses written yet...</span>}
              </div>
            ) : (
              <div className="space-y-4 text-ink-900 dark:text-parchment-100 leading-relaxed text-base whitespace-pre-line">
                {value || <span className="text-ink-400 italic">No content written yet...</span>}
              </div>
            )}
          </div>
        )}

        {/* Footer Meta */}
        <div className="flex items-center justify-between px-4 py-2 bg-parchment-100/60 dark:bg-ink-900/40 border-t border-ink-100 dark:border-ink-800 text-xs text-ink-500 font-mono">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>~{readingTime} min read</span>
          </div>
          <div>{isPoem ? "Poetry Formatting: Preserved Whitespace" : "Markdown / Editorial Text"}</div>
        </div>
      </div>

      {error && <p className="text-xs text-crimson-600">{error}</p>}

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={handleInsertImage}
        title="Insert Image into Content"
      />
    </div>
  );
}

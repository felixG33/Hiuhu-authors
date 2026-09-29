"use client";

import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";

interface CommentItem {
  id: string;
  content: string;
  authorName?: string | null;
  createdAt: Date | string;
  user?: {
    name: string;
    avatar?: string | null;
  } | null;
}

interface CommentSectionProps {
  contentItemId: string;
  comments: CommentItem[];
  allowComments?: boolean;
}

export function CommentSection({ contentItemId, comments, allowComments = true }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-spam bot trap
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!allowComments) {
    return (
      <section className="mt-16 pt-8 border-t border-parchment-300 dark:border-ink-800 text-center text-xs font-mono text-ink-500">
        Comments have been closed for this publication by the editorial board.
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bot

    if (!commentText.trim()) {
      setErrorMsg("Please enter your thoughts before submitting.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentItemId,
          content: commentText,
          authorName: name || "Anonymous Reader",
          authorEmail: email || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit comment");
      }

      setSubmitted(true);
      setCommentText("");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while submitting your comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-parchment-300 dark:border-ink-800 space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-parchment-300 dark:border-ink-800 pb-4">
        <h3 className="font-serif text-2xl font-semibold text-ink-950 dark:text-parchment-50 flex items-center gap-2.5">
          <MessageSquare className="h-5 w-5 text-amber-800 dark:text-amber-400" />
          <span>Reader Discourse ({comments.length})</span>
        </h3>
        <span className="text-xs font-mono text-ink-500 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Moderated
        </span>
      </div>

      {/* Existing Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="font-serif italic text-sm text-ink-500 text-center py-6">
            No reflections have been published yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-sm border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-semibold text-sm text-ink-900 dark:text-parchment-100">
                  {item.user?.name || item.authorName || "Reader"}
                </span>
                <span className="text-[11px] font-mono text-ink-400">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <p className="font-serif text-sm text-ink-700 dark:text-parchment-300 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Submission Form */}
      <div className="rounded-sm border border-parchment-300 dark:border-ink-800 bg-parchment-50/70 dark:bg-ink-900/60 p-6 space-y-4">
        <h4 className="font-serif text-lg font-medium text-ink-950 dark:text-parchment-100">
          Leave a Thought or Critique
        </h4>

        {submitted ? (
          <div className="flex items-center gap-3 p-4 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-serif">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              Your commentary has been received and queued for editorial moderation. Thank you for contributing thoughtfully.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field for anti-spam */}
            <input
              type="text"
              name="hp_field"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                placeholder="Pen name or reader name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email (Kept Confidential)"
                type="email"
                placeholder="reader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Textarea
              label="Comment"
              placeholder="Reflect on this work, its themes, or its language..."
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              error={errorMsg}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-ink-400">
                All submissions are moderated per HIUHU community standards.
              </span>
              <Button type="submit" variant="gold" size="sm" isLoading={loading} className="gap-2">
                <Send className="h-3.5 w-3.5" />
                Submit for Review
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

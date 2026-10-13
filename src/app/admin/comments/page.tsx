"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CommentStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { Check, X, ShieldAlert, Trash2, MessageSquare, Loader2, ExternalLink } from "lucide-react";

interface CommentRecord {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string | null;
  status: CommentStatus;
  createdAt: string;
  contentItem: {
    id: string;
    title: string;
    slug: string;
    type: string;
  };
  user?: {
    id: string;
    name: string;
  } | null;
}

export default function CommentsAdminPage() {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  const [deletingComment, setDeletingComment] = useState<CommentRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.set("status", filterStatus);

      const res = await fetch(`/api/comments?${params.toString()}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      toastError("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filterStatus]);

  const updateStatus = async (id: string, status: CommentStatus) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update comment");

      success(`Comment marked as ${status.toLowerCase()}`);
      fetchComments();
    } catch (err: any) {
      toastError(err.message || "Failed to update comment status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingComment) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/comments/${deletingComment.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");

      success("Comment removed permanently");
      setDeletingComment(null);
      fetchComments();
    } catch (err: any) {
      toastError(err.message || "Failed to delete comment");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: CommentStatus) => {
    switch (status) {
      case CommentStatus.APPROVED:
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">APPROVED</span>;
      case CommentStatus.PENDING:
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">PENDING REVIEW</span>;
      case CommentStatus.REJECTED:
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-crimson-100 text-crimson-800 dark:bg-crimson-950/60 dark:text-crimson-300">REJECTED</span>;
      case CommentStatus.SPAM:
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300">SPAM</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Reader Discourse Moderation</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Review literary feedback, approve reader observations, and eliminate spam.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-serif text-ink-600 dark:text-parchment-400">Queue Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-sm border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900"
          >
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved Discourse</option>
            <option value="REJECTED">Rejected</option>
            <option value="SPAM">Flagged as Spam</option>
            <option value="ALL">All Entries</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-parchment-300 rounded-sm">
          <MessageSquare className="h-8 w-8 mx-auto text-ink-300 mb-2" />
          <p className="text-sm text-ink-500 font-serif">No comments found for status &quot;{filterStatus}&quot;.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-parchment-200 dark:border-ink-800 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-parchment-200 dark:bg-ink-800 flex items-center justify-center font-serif font-bold text-xs">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-ink-900 dark:text-parchment-100 text-sm">
                      {c.authorName}
                    </span>
                    {c.authorEmail && (
                      <span className="text-xs text-ink-400 font-mono ml-2">({c.authorEmail})</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(c.status)}
                  <span className="text-[11px] font-mono text-ink-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-ink-500 font-serif">
                Publication:{" "}
                <Link
                  href={`/${c.contentItem.type.toLowerCase()}s/${c.contentItem.slug}`}
                  target="_blank"
                  className="font-medium text-amber-800 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  {c.contentItem.title}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <p className="text-sm font-serif text-ink-800 dark:text-parchment-200 bg-parchment-50 dark:bg-ink-950 p-3 rounded-xs border-l-2 border-amber-700/60 leading-relaxed whitespace-pre-wrap">
                {c.content}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                {c.status !== CommentStatus.APPROVED && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    disabled={isProcessing}
                    onClick={() => updateStatus(c.id, CommentStatus.APPROVED)}
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </Button>
                )}

                {c.status !== CommentStatus.REJECTED && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1 text-crimson-700 border-crimson-300 hover:bg-crimson-50 dark:hover:bg-crimson-950/40"
                    disabled={isProcessing}
                    onClick={() => updateStatus(c.id, CommentStatus.REJECTED)}
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                )}

                {c.status !== CommentStatus.SPAM && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1 text-ink-500 hover:text-ink-700"
                    disabled={isProcessing}
                    onClick={() => updateStatus(c.id, CommentStatus.SPAM)}
                  >
                    <ShieldAlert className="h-3 w-3" />
                    Spam
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 text-crimson-600 hover:text-crimson-700 hover:bg-crimson-50 dark:hover:bg-crimson-950/30"
                  disabled={isProcessing}
                  onClick={() => setDeletingComment(c)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingComment}
        title="Delete Reader Comment"
        description="Permanently delete this reader response from the database?"
        confirmLabel="Delete"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleDelete}
        onCancel={() => setDeletingComment(null)}
      />
    </div>
  );
}

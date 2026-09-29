"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookmarkButtonProps {
  contentItemId: string;
  title: string;
}

export function BookmarkButton({ contentItemId, title }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hiuhu_bookmarks") || "[]");
      setIsBookmarked(saved.includes(contentItemId));
    } catch {
      // ignore
    }
  }, [contentItemId]);

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("hiuhu_bookmarks") || "[]");
      let next: string[];
      if (saved.includes(contentItemId)) {
        next = saved.filter((id) => id !== contentItemId);
        setIsBookmarked(false);
      } else {
        next = [...saved, contentItemId];
        setIsBookmarked(true);
      }
      localStorage.setItem("hiuhu_bookmarks", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleBookmark}
      className={`text-xs gap-1.5 transition-colors ${
        isBookmarked ? "text-amber-800 border-amber-800 bg-amber-50/50" : ""
      }`}
      title={isBookmarked ? "Remove from Reading List" : "Save to Reading List"}
    >
      <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-800" : ""}`} />
      <span>{isBookmarked ? "Saved to List" : "Save to Reading List"}</span>
    </Button>
  );
}

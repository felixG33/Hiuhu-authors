import React from "react";
import { Badge } from "@/components/ui/Badge";
import { ContentStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: ContentStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return <Badge variant="success">Published</Badge>;
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "PENDING_REVIEW":
      return <Badge variant="warning">In Review</Badge>;
    case "SCHEDULED":
      return <Badge variant="gold">Scheduled</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

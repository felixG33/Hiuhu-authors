import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Role } from "@prisma/client";

interface RoleBadgeProps {
  role: Role | string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "SUPER_ADMIN":
      return <Badge variant="gold">HIUHU Admin</Badge>;
    case "EDITOR":
      return <Badge variant="default">Editor</Badge>;
    case "AUTHOR":
      return <Badge variant="secondary">Author</Badge>;
    case "READER":
      return <Badge variant="outline">Reader</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

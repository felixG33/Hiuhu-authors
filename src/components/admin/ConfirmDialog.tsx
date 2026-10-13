"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "danger" | "default" | "gold";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleClose = () => {
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };

  const buttonVariant = variant === "danger" ? "destructive" : variant;

  return (
    <Dialog open={open} onOpenChange={onOpenChange || ((val) => { if (!val && onCancel) onCancel(); })}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={buttonVariant}
          onClick={async () => {
            await onConfirm();
            handleClose();
          }}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

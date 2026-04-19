"use client"

/**
 * AlertDialog - built on top of the existing Dialog primitives so no new
 * Radix package is required. API mirrors shadcn/ui's alert-dialog.
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"

// ── Root ──────────────────────────────────────────────────────────────────────
function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

// ── Content ───────────────────────────────────────────────────────────────────
function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <DialogContent showCloseButton={false} className={cn("max-w-md", className)} {...(props as any)}>
      {children}
    </DialogContent>
  )
}

// ── Header / Title / Description - thin wrappers ─────────────────────────────
function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <DialogHeader className={cn(className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <DialogTitle className={cn("text-lg font-semibold", className)} {...(props as any)} />
  )
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <DialogDescription className={cn(className)} {...(props as any)} />
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <DialogFooter className={cn("gap-2 sm:gap-2", className)} {...props} />
  )
}

// ── Cancel ────────────────────────────────────────────────────────────────────
function AlertDialogCancel({
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Button
      variant="outline"
      className={cn(className)}
      onClick={onClick}
      {...(props as any)}
    >
      {children ?? "Cancel"}
    </Button>
  )
}

// ── Action (confirm) ──────────────────────────────────────────────────────────
function AlertDialogAction({
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Button
      className={cn(className)}
      onClick={onClick}
      {...(props as any)}
    >
      {children ?? "Continue"}
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
}

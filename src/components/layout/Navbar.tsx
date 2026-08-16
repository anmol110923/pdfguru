"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "landing" | "editor";
  title?: string;
  pageCount?: number;
  onExport?: () => void;
  exportDisabled?: boolean;
  exporting?: boolean;
}

export function Navbar({
  variant = "landing",
  title,
  pageCount,
  onExport,
  exportDisabled,
  exporting,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-sm">
      <div
        className={cn(
          "flex h-14 items-center justify-between gap-4 px-4 sm:px-6",
          variant === "landing" && "mx-auto max-w-5xl"
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-3.5" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">PDFguru</span>
            {variant === "landing" ? (
              <span className="text-[11px] text-muted-foreground">by MeraIPU</span>
            ) : null}
          </span>
        </Link>

        {variant === "landing" ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="#how-it-works"
              className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground sm:inline-flex"
            >
              How it works
            </a>
            <a
              href="#privacy"
              className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground sm:inline-flex"
            >
              Privacy
            </a>
            <Button nativeButton={false} render={<Link href="/create" />} size="sm">
              Create PDF
            </Button>
          </nav>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 md:flex">
              <span className="truncate text-sm text-muted-foreground">
                {title?.trim() || "Untitled"}
              </span>
              {typeof pageCount === "number" && pageCount > 0 ? (
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
                  {pageCount} {pageCount === 1 ? "page" : "pages"}
                </span>
              ) : null}
            </div>
            <Button
              onClick={onExport}
              disabled={exportDisabled}
              size="sm"
              className="min-w-24"
            >
              {exporting ? "Exporting…" : "Export PDF"}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

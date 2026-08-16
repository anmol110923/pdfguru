"use client";

import { Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  title: string;
  pageCount: number;
  onDownload: () => void;
  onCreateAnother: () => void;
  onStartOver: () => void;
}

export function SuccessScreen({
  title,
  pageCount,
  onDownload,
  onCreateAnother,
  onStartOver,
}: SuccessScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary duration-200 animate-in fade-in zoom-in-95">
        <Check className="size-5" aria-hidden />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Your PDF is ready</h1>
      <p className="mt-2 text-sm text-muted-foreground">{title.trim() || "Untitled"}</p>
      <p className="text-sm text-muted-foreground">
        {pageCount} {pageCount === 1 ? "page" : "pages"}
      </p>
      <div className="mt-6 flex w-full max-w-xs items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
          <FileText className="size-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title.trim() || "Untitled"}</p>
          <p className="text-xs text-muted-foreground">PDF document</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button size="lg" className="h-10 px-5" onClick={onDownload}>
          Download PDF
        </Button>
        <Button variant="outline" onClick={onCreateAnother}>
          Create another PDF
        </Button>
        <button
          type="button"
          className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          onClick={onStartOver}
        >
          Start over
        </button>
      </div>
    </div>
  );
}

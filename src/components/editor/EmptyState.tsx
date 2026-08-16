"use client";

import { UploadZone } from "@/components/editor/UploadZone";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <p className="mb-2 text-lg font-semibold tracking-tight">Ready when you are.</p>
      <p className="mb-8 text-sm text-muted-foreground">
        Drop your study screenshots here to get started.
      </p>
      <UploadZone />
      <p className="mt-6 text-xs text-muted-foreground">You can also paste with ⌘V or Ctrl+V.</p>
    </div>
  );
}

"use client";

import { Progress } from "@/components/ui/progress";
import type { ExportStatus } from "@/lib/store/types";

interface ExportProgressProps {
  status: ExportStatus;
  message: string;
  progress: number;
}

export function ExportProgress({ status, message, progress }: ExportProgressProps) {
  if (status !== "preparing" && status !== "generating") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-md">
        <p className="text-sm font-medium">{message}</p>
        <Progress value={progress} className="mt-4" />
      </div>
    </div>
  );
}

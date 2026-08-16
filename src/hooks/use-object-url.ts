"use client";

import { useEffect } from "react";

export function useObjectUrl(blob: Blob | null) {
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    return () => URL.revokeObjectURL(url);
  }, [blob]);
}

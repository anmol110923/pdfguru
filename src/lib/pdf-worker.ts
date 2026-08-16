/// <reference lib="webworker" />

import { generatePdf } from "@/lib/pdf";
import type { PdfSettings, ScreenshotItem } from "@/lib/store/types";

export interface PdfWorkerRequest {
  items: ScreenshotItem[];
  settings: PdfSettings;
}

/**
 * PDF assembly is isolated here so it can later move fully into a Worker.
 * jsPDF needs DOM canvas APIs, so the current runtime still executes on the
 * main thread via generatePdf() with cooperative yielding.
 */
export async function runPdfJob(request: PdfWorkerRequest) {
  return generatePdf(request.items, request.settings);
}

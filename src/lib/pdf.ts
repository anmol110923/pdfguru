import { jsPDF } from "jspdf";
import { PAGE_MARGIN_MM, PAGE_NUMBER_OFFSET_MM, QUALITY_MAP } from "@/lib/constants";
import { applyTransform, canvasToJpeg } from "@/lib/image-processing";
import type { PdfSettings, ScreenshotItem } from "@/lib/store/types";
import { splitTitleLines } from "@/lib/utils";

export interface PdfProgress {
  phase: "preparing" | "generating";
  current: number;
  total: number;
}

const A4 = { width: 210, height: 297 };
const LETTER = { width: 215.9, height: 279.4 };

function pageSizeMm(settings: PdfSettings, imageWidth: number, imageHeight: number) {
  if (settings.pageSize === "letter") return LETTER;
  if (settings.pageSize === "a4") return A4;
  const width = (imageWidth / 96) * 25.4;
  const height = (imageHeight / 96) * 25.4;
  return {
    width: Math.max(80, Math.min(width, 420)),
    height: Math.max(80, Math.min(height, 594)),
  };
}

function orientationFor(
  settings: PdfSettings,
  imageWidth: number,
  imageHeight: number,
  base: { width: number; height: number }
): "portrait" | "landscape" {
  if (settings.orientation === "portrait") return "portrait";
  if (settings.orientation === "landscape") return "landscape";
  if (settings.pageSize === "original") {
    return imageWidth >= imageHeight ? "landscape" : "portrait";
  }
  const imageLandscape = imageWidth >= imageHeight;
  const pageLandscape = base.width >= base.height;
  return imageLandscape === pageLandscape
    ? base.width >= base.height
      ? "landscape"
      : "portrait"
    : imageLandscape
      ? "landscape"
      : "portrait";
}

function orientedSize(
  base: { width: number; height: number },
  orientation: "portrait" | "landscape"
) {
  const portrait = base.width <= base.height ? base : { width: base.height, height: base.width };
  if (orientation === "portrait") return portrait;
  return { width: portrait.height, height: portrait.width };
}

function yieldToMain() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 0);
  });
}

function addCoverPage(pdf: jsPDF, settings: PdfSettings, size: { width: number; height: number }) {
  const { heading, subheading } = splitTitleLines(settings.title || "Study Notes");
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  pdf.setFillColor(250, 250, 252);
  pdf.rect(0, 0, size.width, size.height, "F");
  pdf.setDrawColor(230, 230, 235);
  pdf.setLineWidth(0.4);
  pdf.rect(14, 14, size.width - 28, size.height - 28);

  pdf.setTextColor(30, 32, 40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.text(heading, size.width / 2, size.height / 2 - 18, { align: "center" });

  if (subheading || settings.subject) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(16);
    pdf.setTextColor(70, 74, 86);
    pdf.text(subheading || settings.subject, size.width / 2, size.height / 2 - 4, {
      align: "center",
    });
  }

  pdf.setFontSize(12);
  pdf.setTextColor(110, 114, 126);
  pdf.text("Study Notes", size.width / 2, size.height / 2 + 14, { align: "center" });
  pdf.setFontSize(10);
  pdf.text(date, size.width / 2, size.height / 2 + 24, { align: "center" });
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function generatePdf(
  items: ScreenshotItem[],
  settings: PdfSettings,
  onProgress?: (progress: PdfProgress) => void
) {
  const quality = QUALITY_MAP[settings.quality];
  const prepared: { dataUrl: string; width: number; height: number }[] = [];

  for (let i = 0; i < items.length; i += 1) {
    onProgress?.({ phase: "preparing", current: i + 1, total: items.length });
    const canvas = await applyTransform(items[i]);
    const jpeg = await canvasToJpeg(canvas, quality);
    const dataUrl = await blobToDataUrl(jpeg);
    prepared.push({ dataUrl, width: canvas.width, height: canvas.height });
    await yieldToMain();
  }

  onProgress?.({ phase: "generating", current: 0, total: prepared.length });

  const first = prepared[0];
  const firstBase = pageSizeMm(settings, first.width, first.height);
  const firstOrientation = orientationFor(settings, first.width, first.height, firstBase);
  const firstSize = orientedSize(firstBase, firstOrientation);

  const pdf = new jsPDF({
    unit: "mm",
    format: [firstSize.width, firstSize.height],
    orientation: firstOrientation,
    compress: settings.quality !== "high",
  });

  if (settings.coverPage) {
    addCoverPage(pdf, settings, firstSize);
  }

  for (let i = 0; i < prepared.length; i += 1) {
    onProgress?.({ phase: "generating", current: i + 1, total: prepared.length });
    const page = prepared[i];
    const base = pageSizeMm(settings, page.width, page.height);
    const orientation = orientationFor(settings, page.width, page.height, base);
    const size = orientedSize(base, orientation);

    if (i > 0 || settings.coverPage) {
      pdf.addPage([size.width, size.height], orientation);
    } else {
      pdf.setPage(1);
    }

    const margin = settings.pageSize === "original" ? 0 : PAGE_MARGIN_MM;
    const availableW = size.width - margin * 2;
    const availableH = size.height - margin * 2 - (settings.pageNumbers ? 8 : 0);
    const ratio = Math.min(availableW / page.width, availableH / page.height);
    const drawW = page.width * ratio;
    const drawH = page.height * ratio;
    const x = (size.width - drawW) / 2;
    const y = margin + (availableH - drawH) / 2;

    pdf.addImage(page.dataUrl, "JPEG", x, y, drawW, drawH, undefined, "FAST");

    if (settings.pageNumbers) {
      const number = settings.coverPage ? i + 2 : i + 1;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(120, 124, 136);
      pdf.text(String(number), size.width / 2, size.height - PAGE_NUMBER_OFFSET_MM, {
        align: "center",
      });
    }

    await yieldToMain();
  }

  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

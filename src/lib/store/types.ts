export type Rotation = 0 | 90 | 180 | 270;

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenshotItem {
  id: string;
  file: File;
  originalUrl: string;
  thumbnailUrl: string;
  rotation: Rotation;
  crop: CropRect | null;
  selected: boolean;
  width: number;
  height: number;
}

export interface PdfSettings {
  title: string;
  subject: string;
  pageSize: "a4" | "letter" | "original";
  orientation: "auto" | "portrait" | "landscape";
  quality: "high" | "medium" | "compressed";
  pageNumbers: boolean;
  coverPage: boolean;
}

export type ExportStatus = "idle" | "preparing" | "generating" | "ready" | "error";

export const defaultPdfSettings: PdfSettings = {
  title: "",
  subject: "",
  pageSize: "a4",
  orientation: "auto",
  quality: "high",
  pageNumbers: false,
  coverPage: false,
};

import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGE_PIXELS,
  THUMBNAIL_MAX_WIDTH,
} from "@/lib/constants";
import type { CropRect, Rotation, ScreenshotItem } from "@/lib/store/types";

export type FileRejectReason =
  | "unsupported"
  | "too-large"
  | "too-many-pixels"
  | "unreadable";

export interface FileReject {
  name: string;
  reason: FileRejectReason;
}

export function rejectMessage(reason: FileRejectReason) {
  switch (reason) {
    case "unsupported":
      return "Try uploading a PNG or JPG instead.";
    case "too-large":
      return "This image is too large to process. Try a smaller screenshot.";
    case "too-many-pixels":
      return "This image is too large to process. Try a smaller screenshot.";
    case "unreadable":
      return "This image couldn't be processed.";
  }
}

export function isAcceptedImage(file: File) {
  if (ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    return true;
  }
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("unreadable"));
    img.src = src;
  });
}

export async function createThumbnailUrl(source: CanvasImageSource, width: number, height: number) {
  const scale = THUMBNAIL_MAX_WIDTH / Math.max(width, 1);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("unreadable");
  ctx.drawImage(source, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.72)
  );
  if (!blob) throw new Error("unreadable");
  return URL.createObjectURL(blob);
}

export async function processImageFile(file: File): Promise<ScreenshotItem> {
  if (!isAcceptedImage(file)) {
    throw Object.assign(new Error("unsupported"), { reason: "unsupported" as const });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw Object.assign(new Error("too-large"), { reason: "too-large" as const });
  }

  const originalUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(originalUrl);
    if (img.naturalWidth * img.naturalHeight > MAX_IMAGE_PIXELS) {
      URL.revokeObjectURL(originalUrl);
      throw Object.assign(new Error("too-many-pixels"), { reason: "too-many-pixels" as const });
    }
    const thumbnailUrl = await createThumbnailUrl(img, img.naturalWidth, img.naturalHeight);
    return {
      id: crypto.randomUUID(),
      file,
      originalUrl,
      thumbnailUrl,
      rotation: 0,
      crop: null,
      selected: false,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  } catch (error) {
    URL.revokeObjectURL(originalUrl);
    if (error && typeof error === "object" && "reason" in error) throw error;
    throw Object.assign(new Error("unreadable"), { reason: "unreadable" as const });
  }
}

export async function processImageFiles(files: File[]) {
  const accepted: ScreenshotItem[] = [];
  const rejected: FileReject[] = [];

  for (const file of files) {
    try {
      accepted.push(await processImageFile(file));
    } catch (error) {
      const reason =
        error && typeof error === "object" && "reason" in error
          ? (error.reason as FileRejectReason)
          : "unreadable";
      rejected.push({ name: file.name, reason });
    }
  }

  return { accepted, rejected };
}

function rotatedSize(width: number, height: number, rotation: Rotation) {
  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}

export function drawRotatedImage(
  img: HTMLImageElement,
  rotation: Rotation
) {
  const { width, height } = rotatedSize(img.naturalWidth, img.naturalHeight, rotation);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("unreadable");
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return canvas;
}

export function cropCanvas(source: HTMLCanvasElement, crop: CropRect | null) {
  if (!crop) return source;
  const sx = Math.max(0, (crop.x / 100) * source.width);
  const sy = Math.max(0, (crop.y / 100) * source.height);
  const sw = Math.min(source.width - sx, (crop.width / 100) * source.width);
  const sh = Math.min(source.height - sy, (crop.height / 100) * source.height);
  if (sw < 2 || sh < 2) return source;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw));
  canvas.height = Math.max(1, Math.round(sh));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("unreadable");
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function applyTransform(item: ScreenshotItem) {
  const img = await loadImage(item.originalUrl);
  const rotated = drawRotatedImage(img, item.rotation);
  return cropCanvas(rotated, item.crop);
}

export async function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("unreadable");
  return blob;
}

function channelVariance(values: number[]) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

function sampleRow(data: Uint8ClampedArray, width: number, y: number) {
  const lumas: number[] = [];
  const step = Math.max(1, Math.floor(width / 80));
  for (let x = 0; x < width; x += step) {
    const i = (y * width + x) * 4;
    lumas.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
  }
  return lumas;
}

function sampleCol(data: Uint8ClampedArray, width: number, height: number, x: number) {
  const lumas: number[] = [];
  const step = Math.max(1, Math.floor(height / 80));
  for (let y = 0; y < height; y += step) {
    const i = (y * width + x) * 4;
    lumas.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
  }
  return lumas;
}

function isBorderBand(lumas: number[]) {
  const mean = lumas.reduce((sum, value) => sum + value, 0) / lumas.length;
  const variance = channelVariance(lumas);
  const isNearWhite = mean > 235 && variance < 40;
  const isNearBlack = mean < 28 && variance < 40;
  const isNearGray = mean > 245 || mean < 18 ? false : variance < 8 && (mean > 220 || mean < 40);
  return isNearWhite || isNearBlack || isNearGray;
}

export function autoDetectCrop(imageData: ImageData): CropRect | null {
  const { data, width, height } = imageData;
  const maxCropX = Math.floor(width * 0.35);
  const maxCropY = Math.floor(height * 0.35);

  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;

  while (top < maxCropY && isBorderBand(sampleRow(data, width, top))) top += 1;
  while (bottom > height - maxCropY && isBorderBand(sampleRow(data, width, bottom))) bottom -= 1;
  while (left < maxCropX && isBorderBand(sampleCol(data, width, height, left))) left += 1;
  while (right > width - maxCropX && isBorderBand(sampleCol(data, width, height, right))) right -= 1;

  const pad = 2;
  top = Math.max(0, top - pad);
  left = Math.max(0, left - pad);
  bottom = Math.min(height - 1, bottom + pad);
  right = Math.min(width - 1, right + pad);

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;
  const trimmed =
    left > width * 0.015 ||
    top > height * 0.015 ||
    width - cropW > width * 0.015 ||
    height - cropH > height * 0.015;

  if (!trimmed || cropW < width * 0.4 || cropH < height * 0.4) {
    return null;
  }

  return {
    x: (left / width) * 100,
    y: (top / height) * 100,
    width: (cropW / width) * 100,
    height: (cropH / height) * 100,
  };
}

export async function detectAutoCrop(item: ScreenshotItem) {
  const img = await loadImage(item.originalUrl);
  const rotated = drawRotatedImage(img, item.rotation);
  const ctx = rotated.getContext("2d");
  if (!ctx) return null;
  const imageData = ctx.getImageData(0, 0, rotated.width, rotated.height);
  return autoDetectCrop(imageData);
}

export function revokeItemUrls(item: ScreenshotItem) {
  URL.revokeObjectURL(item.originalUrl);
  URL.revokeObjectURL(item.thumbnailUrl);
}

export function nextRotation(current: Rotation, direction: 1 | -1): Rotation {
  const value = (current + direction * 90 + 360) % 360;
  return value as Rotation;
}

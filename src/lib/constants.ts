export const ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

export const ACCEPT_ATTR = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const THUMBNAIL_MAX_WIDTH = 220;
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.1;

export const QUALITY_MAP = {
  high: 0.92,
  medium: 0.75,
  compressed: 0.55,
} as const;

export const PAGE_MARGIN_MM = 8;
export const PAGE_NUMBER_OFFSET_MM = 6;

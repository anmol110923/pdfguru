import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugifyFilename(title: string) {
  const slug = title
    .trim()
    .replace(/[—–]/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "study-notes"}.pdf`;
}

export function formatPageNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function splitTitleLines(title: string) {
  const parts = title.split(/\s+[—–-]\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { heading: parts[0], subheading: parts.slice(1).join(" — ") };
  }
  return { heading: title.trim() || "Study Notes", subheading: "" };
}

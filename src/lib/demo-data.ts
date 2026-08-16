import { processImageFile } from "@/lib/image-processing";
import type { ScreenshotItem } from "@/lib/store/types";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDemoPage(index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 1664;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create demo page");

  ctx.fillStyle = "#e8eaef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, 56);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "500 18px Inter, sans-serif";
  ctx.fillText("Lecture notes  ·  sample page", 28, 36);

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 48, 96, canvas.width - 96, canvas.height - 180, 18);
  ctx.fill();

  const titles = [
    "Operating Systems — Processes",
    "CPU Scheduling — Round Robin",
    "Memory Management — Paging",
    "File Systems — Inodes",
    "Deadlocks — Banker's Algorithm",
  ];
  const bullets = [
    ["A process is a program in execution.", "PCB stores PID, state, registers, and memory info.", "Context switching saves and restores CPU state."],
    ["Ready queue holds processes waiting for the CPU.", "Time quantum keeps scheduling fair.", "Higher waiting time can appear with a small quantum."],
    ["Virtual addresses map to physical frames.", "A page table tracks the mapping.", "Thrashing happens when paging is excessive."],
    ["Files are described by inodes, not names.", "Directories map names to inode numbers.", "Links can share the same underlying file."],
    ["Four conditions are required for deadlock.", "Hold-and-wait is one of them.", "Banker's algorithm avoids unsafe states."],
  ];

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 42px Inter, sans-serif";
  ctx.fillText(titles[index] ?? `Sample notes ${index + 1}`, 88, 190);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 20px Inter, sans-serif";
  ctx.fillText("Generated demo page — not real course material", 88, 232);

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(88, 258, 420, 3);

  ctx.font = "400 28px Inter, sans-serif";
  ctx.fillStyle = "#1e293b";
  (bullets[index] ?? bullets[0]).forEach((line, i) => {
    ctx.fillText(`•  ${line}`, 88, 340 + i * 64);
  });

  ctx.fillStyle = "#f1f5f9";
  roundRect(ctx, 88, 560, canvas.width - 176, 420, 16);
  ctx.fill();
  ctx.fillStyle = "#334155";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.fillText("Quick recap", 120, 610);
  ctx.font = "400 22px Inter, sans-serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("Use this page to try reorder, crop, rotate, and export.", 120, 656);
  ctx.fillText("Your own screenshots stay on this device.", 120, 696);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 16px Inter, sans-serif";
  ctx.fillText(`${index + 1} / 5`, canvas.width - 140, canvas.height - 48);

  return canvas;
}

export async function createDemoScreenshots(): Promise<ScreenshotItem[]> {
  const items: ScreenshotItem[] = [];
  for (let i = 0; i < 5; i += 1) {
    const canvas = drawDemoPage(i);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("Could not create demo page"));
      }, "image/png");
    });
    const file = new File([blob], `demo-notes-${i + 1}.png`, { type: "image/png" });
    items.push(await processImageFile(file));
  }
  return items;
}

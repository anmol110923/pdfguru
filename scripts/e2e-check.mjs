import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const errors = [];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

async function makePng(color, label) {
  return page.evaluate(
    async ({ color: fill, label: text }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, 800, 40);
      ctx.fillStyle = fill;
      ctx.fillRect(20, 60, 760, 900);
      ctx.fillStyle = "#fff";
      ctx.font = "32px sans-serif";
      ctx.fillText(text, 60, 160);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const buf = await blob.arrayBuffer();
      return Array.from(new Uint8Array(buf));
    },
    { color, label }
  );
}

try {
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const hero = await page.getByRole("heading", {
    name: "Turn your study screenshots into clean PDFs.",
  }).isVisible();
  if (!hero) throw new Error("Landing hero missing");

  await page.getByRole("link", { name: "Try with demo screenshots" }).click();
  await page.waitForURL(/\/create/);
  await page.getByText("Pages", { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText("05").first().waitFor();

  await page.getByLabel("Delete page 05").click();
  await page.getByText("04").first().waitFor();

  await page.getByLabel("Rotate right").click();
  await page.getByLabel("Crop").click();
  await page.getByRole("button", { name: "Apply crop" }).click();
  await page.getByLabel("Document title").fill("Operating Systems — Unit 3");
  await page.getByRole("switch", { name: "Page numbers" }).click();
  await page.getByRole("switch", { name: "Cover page" }).click();

  await page.getByRole("button", { name: "Export PDF" }).click();
  await page.getByRole("heading", { name: "Your PDF is ready" }).waitFor({ timeout: 60000 });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 15000 }),
    page.getByRole("button", { name: "Download PDF" }).click(),
  ]);

  const out = join(tmpdir(), download.suggestedFilename());
  await download.saveAs(out);
  const size = (await download.path()) ? 1 : 0;
  writeFileSync("/tmp/pdfguru-download-name.txt", `${download.suggestedFilename()} ${out} ${size}`);

  if (download.suggestedFilename() !== "Operating-Systems-Unit-3.pdf") {
    throw new Error(`Unexpected filename ${download.suggestedFilename()}`);
  }

  await page.getByRole("button", { name: "Create another PDF" }).click();
  await page.getByRole("button", { name: "Export PDF" }).waitFor();

  const png = Uint8Array.from(await makePng("#334155", "Extra page"));
  await page.setInputFiles('input[type="file"]', {
    name: "extra.png",
    mimeType: "image/png",
    buffer: Buffer.from(png),
  });
  await page.getByText("05").first().waitFor({ timeout: 10000 });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "PDF settings" }).waitFor();

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("http://127.0.0.1:3000/create");
  await page.getByText("Ready when you are.").waitFor();

  const bad = Uint8Array.from([1, 2, 3, 4]);
  await page.setInputFiles('input[type="file"]', {
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(bad),
  });
  await page.getByText("Try uploading a PNG or JPG instead.").waitFor({ timeout: 8000 });

  const many = [];
  for (let i = 0; i < 20; i += 1) {
    const bytes = Uint8Array.from(await makePng("#3b4252", `Batch ${i + 1}`));
    many.push({
      name: `batch-${i + 1}.png`,
      mimeType: "image/png",
      buffer: Buffer.from(bytes),
    });
  }
  await page.setInputFiles('input[type="file"]', many);
  await page.getByText("20", { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByLabel("Document title").fill("Batch Notes");
  await page.getByRole("button", { name: "Export PDF" }).click();
  await page.getByRole("heading", { name: "Your PDF is ready" }).waitFor({ timeout: 120000 });


  if (errors.length) {
    throw new Error(`Console errors:\n${errors.join("\n")}`);
  }
  console.log("E2E passed");
} catch (error) {
  await page.screenshot({ path: "/tmp/pdfguru-e2e.png", fullPage: true });
  console.error(await page.content().then((html) => html.slice(0, 2000)));
  throw error;
} finally {
  await browser.close();
}

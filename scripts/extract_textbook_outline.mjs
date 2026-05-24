import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

globalThis.DOMMatrix ??= class {};
globalThis.ImageData ??= class {};
globalThis.Path2D ??= class {};

const pdfjsPath = pathToFileURL(
  "C:/Users/cavendish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/legacy/build/pdf.mjs"
).href;
const pdfjs = await import(pdfjsPath);

const [,, pdfPath, mode = "outline", from = "1", to = from] = process.argv;
if (!pdfPath) {
  console.error("Usage: node scripts/extract_textbook_outline.mjs <pdf-path> [outline|pages] [from] [to]");
  process.exit(1);
}

const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, disableWorker: true }).promise;

async function destinationPageNumber(destination) {
  if (!destination) return null;
  const dest = typeof destination === "string" ? await doc.getDestination(destination) : destination;
  if (!Array.isArray(dest) || !dest[0]) return null;
  const pageIndex = await doc.getPageIndex(dest[0]);
  return pageIndex + 1;
}

async function flattenOutline(items, depth = 0, rows = []) {
  for (const item of items ?? []) {
    rows.push({
      depth,
      title: String(item.title ?? "").replace(/\s+/g, " ").trim(),
      page: await destinationPageNumber(item.dest)
    });
    await flattenOutline(item.items ?? [], depth + 1, rows);
  }
  return rows;
}

async function pageText(pageNumber) {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  return content.items
    .map((item) => item.str)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function dumpPages(outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const stream = fs.createWriteStream(outputPath, { encoding: "utf8" });
  for (let page = 1; page <= doc.numPages; page += 1) {
    const text = await pageText(page);
    stream.write(JSON.stringify({ page, text }) + "\n");
  }
  await new Promise((resolve, reject) => {
    stream.end(resolve);
    stream.on("error", reject);
  });
  console.log(JSON.stringify({ outputPath, pages: doc.numPages }, null, 2));
}

if (mode === "outline" || mode === "find") {
  const meta = await doc.getMetadata().catch(() => ({}));
  const rows = await flattenOutline(await doc.getOutline());
  if (mode === "find") {
    const query = String(from ?? "").toLowerCase();
    console.log(JSON.stringify(rows.filter((row) => row.title.toLowerCase().includes(query)), null, 2));
  } else {
  console.log(JSON.stringify({
    file: path.basename(pdfPath),
    pages: doc.numPages,
    title: meta.info?.Title ?? null,
    author: meta.info?.Author ?? null,
    outline: rows
  }, null, 2));
  }
} else if (mode === "pages") {
  const start = Math.max(1, Number(from));
  const end = Math.min(doc.numPages, Number(to));
  const rows = [];
  for (let page = start; page <= end; page += 1) {
    rows.push({ page, text: await pageText(page) });
  }
  console.log(JSON.stringify(rows, null, 2));
} else if (mode === "dump") {
  await dumpPages(from);
} else {
  throw new Error(`Unknown mode: ${mode}`);
}

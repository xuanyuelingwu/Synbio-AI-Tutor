import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const kbPath = path.join(root, "data", "knowledge_base.json");
const outDir = path.join(root, "data", "raw_sources");

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const kb = JSON.parse(await fs.readFile(kbPath, "utf8"));
await fs.mkdir(outDir, { recursive: true });

for (const source of kb.sources) {
  const response = await fetch(source.url);
  if (!response.ok) {
    console.warn(`Skip ${source.id}: ${response.status}`);
    continue;
  }
  const html = await response.text();
  const text = toText(html).slice(0, 20000);
  const filePath = path.join(outDir, `${source.id}.txt`);
  await fs.writeFile(filePath, `${source.title}\n${source.publisher}\n${source.url}\n\n${text}`, "utf8");
  console.log(`Saved ${filePath}`);
}

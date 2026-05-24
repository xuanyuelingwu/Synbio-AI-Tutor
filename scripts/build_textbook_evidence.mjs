import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

globalThis.DOMMatrix ??= class {};
globalThis.ImageData ??= class {};
globalThis.Path2D ??= class {};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kbPath = path.join(root, "data", "knowledge_base.json");
const outDir = path.join(root, "data", "textbooks");

const pdfjsPath = pathToFileURL(
  "C:/Users/cavendish/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/legacy/build/pdf.mjs"
).href;
const pdfjs = await import(pdfjsPath);

const textbooks = [
  {
    key: "meyers",
    source_id: "local-meyers-synbio-textbook",
    book_title: "Synthetic Biology",
    author: "Robert A. Meyers",
    pdf_path: "C:/Users/cavendish/Downloads/Synthetic Biology (Robert A. Meyers) (z-library.sk, 1lib.sk, z-lib.sk).pdf"
  },
  {
    key: "braman",
    source_id: "local-braman-synbio-methods",
    book_title: "Synthetic Biology",
    author: "Jeffrey Carl Braman",
    pdf_path: "C:/Users/cavendish/Downloads/Synthetic Biology (Jeffrey Carl Braman) (z-library.sk, 1lib.sk, z-lib.sk).pdf"
  }
];

const moduleRules = [
  ["foundations-life-systems", ["first cells", "cell", "gene expression", "rna splicing", "protein", "nucleotides", "chromatin", "mitochondria", "chloroplast"]],
  ["biology-to-engineering", ["implications", "uses", "modular", "parts", "standard", "refactoring", "platform organism", "chassis", "seva", "biobrick"]],
  ["reading-writing-dna", ["dna assembly", "dna synthesis", "molecular assembly", "genome editing", "crispr", "cas9", "plasmid", "vector", "cloning", "mutation", "synthetic genome"]],
  ["gene-regulation-circuits", ["gene circuit", "gene circuits", "regulatory", "regulation", "operon", "feedback", "logic", "microRNA", "mirna", "rna interference", "efflux pump", "transcriptional control"]],
  ["modeling-design-tools", ["model", "simulation", "computing", "algorithmic", "sbol", "sbml", "genotype specification", "gsl", "dnaplotlib", "visualization", "design language", "workflow"]],
  ["biosensors-signal-processing", ["biosensor", "sensor", "detection", "reporter", "actuator", "inverter", "signal"]],
  ["metabolic-engineering-cell-factories", ["metabolic", "pathway", "glycolytic", "catabolism", "flux", "enzyme", "biofuel", "fermentation", "biomass", "antibiotic production", "chemical", "feedstock"]],
  ["cell-free-synthetic-cells", ["cell-free", "txtl", "synthetic cell", "compartment", "co-localization", "minimal genome"]],
  ["biomedical-frontier-applications", ["therapeutic", "mammalian", "antibiotic", "vaccine", "protein expression", "dna-based analog", "nanostructure", "hydrogel", "living material"]],
  ["safety-ethics-public-trust", ["societal", "challenge", "biosecurity", "biosafety", "responsible", "ethic", "dual use", "public"]]
];

const moduleToDocs = {
  "foundations-life-systems": ["cell-basics", "dna-rna-protein-flow", "gene-expression-regulation"],
  "biology-to-engineering": ["synbio-definition", "parts-devices-systems", "standardization-reuse"],
  "reading-writing-dna": ["dna-synthesis-assembly", "genome-editing-concepts", "sequencing-reading-dna"],
  "gene-regulation-circuits": ["genetic-circuits", "operons-feedback", "logic-gates-information", "rnai-synthetic-logic"],
  "modeling-design-tools": ["network-dynamics", "bio-cad-design-language", "computer-simulation-cells"],
  "biosensors-signal-processing": ["biosensors", "sensor-input-modules", "signal-processing-output"],
  "metabolic-engineering-cell-factories": ["pathways-flux", "microbial-cell-factories", "biofuels-chemicals-materials"],
  "cell-free-synthetic-cells": ["cell-free-synthetic-biology", "minimal-genome", "compartmentalization-synthetic-cells"],
  "biomedical-frontier-applications": ["biomedical-synbio", "regenerative-cell-therapy", "engineered-living-materials"],
  "safety-ethics-public-trust": ["ethics-safety", "biosecurity-risk-assessment", "technology-stewardship-public-trust"]
};

const proceduralPattern = /\b(materials?|methods?|notes?|protocol|prepar|transformation|cloning|pcr|assay|reaction|reagents?|primers?|oligonucleotides?|media|cultivat|electroporation|plasmid preparation|working conditions|data analysis|installation|terminal|equipment)\b/i;
const skipPattern = /^(cover|title page|copyright|contents|contributors|preface|references|index|eula|acknowledgments?)$/i;

function cleanTitle(title) {
  return String(title ?? "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function destinationPageNumber(doc, destination) {
  if (!destination) return null;
  const dest = typeof destination === "string" ? await doc.getDestination(destination) : destination;
  if (!Array.isArray(dest) || !dest[0]) return null;
  const pageIndex = await doc.getPageIndex(dest[0]);
  return pageIndex + 1;
}

async function flattenOutline(doc, items, depth = 0, pathParts = [], rows = []) {
  for (const item of items ?? []) {
    const title = cleanTitle(item.title);
    const page = await destinationPageNumber(doc, item.dest);
    const sectionPath = [...pathParts, title].filter(Boolean);
    rows.push({ depth, title, page, section_path: sectionPath });
    await flattenOutline(doc, item.items ?? [], depth + 1, sectionPath, rows);
  }
  return rows;
}

function inferModules(title, pathText) {
  const lower = `${title} ${pathText}`.toLowerCase();
  const matches = [];
  for (const [moduleId, keywords] of moduleRules) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) score += keyword.length > 8 ? 2 : 1;
    }
    if (score > 0) matches.push({ moduleId, score });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.length ? matches.slice(0, 2).map((match) => match.moduleId) : ["biology-to-engineering"];
}

function teachingSummary(row, modules, procedural) {
  const title = row.title.replace(/^\d+(\.\d+)*\s+/, "");
  if (procedural) {
    return `Textbook locator for "${title}". This section appears to contain methods, materials, software, or other operational details, so the tutor indexes only the citation location and uses it for safe high-level orientation rather than procedural instruction.`;
  }
  return `Textbook citation-level support for "${title}". The tutor uses this section as a page-level locator for teaching context in ${modules.join(", ")} and answers with original, high-level explanations rather than reproducing textbook prose.`;
}

async function buildForBook(book) {
  const data = new Uint8Array(fs.readFileSync(book.pdf_path));
  const doc = await pdfjs.getDocument({ data, disableWorker: true }).promise;
  const outline = await flattenOutline(doc, await doc.getOutline());
  const rows = outline
    .filter((row) => row.title && row.page && !skipPattern.test(row.title))
    .sort((a, b) => a.page - b.page || a.depth - b.depth);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${book.key}.outline.json`), `${JSON.stringify({
    source_id: book.source_id,
    book_title: book.book_title,
    author: book.author,
    pages: doc.numPages,
    outline: rows
  }, null, 2)}\n`, "utf8");

  return rows.map((row, index) => {
    const next = rows.slice(index + 1).find((candidate) => candidate.page > row.page);
    const pageEnd = next ? Math.max(row.page, next.page - 1) : row.page;
    const pathText = row.section_path.join(" > ");
    const modules = inferModules(row.title, pathText);
    const procedural = proceduralPattern.test(row.title) || proceduralPattern.test(pathText);
    const docIds = [...new Set(modules.flatMap((moduleId) => moduleToDocs[moduleId] ?? []))].slice(0, 4);

    return {
      id: `${book.key}-${String(index + 1).padStart(4, "0")}`,
      source_id: book.source_id,
      source_tier: "local_textbook_reference",
      book_title: book.book_title,
      author: book.author,
      title: row.title,
      section_path: row.section_path,
      page_start: row.page,
      page_end: pageEnd,
      module_ids: modules,
      document_ids: docIds,
      evidence_scope: procedural ? "locator_only_operational_content_excluded" : "citation_level_teaching_summary",
      teaching_summary: teachingSummary(row, modules, procedural),
      safety_note: procedural
        ? "Operational details from this section are intentionally excluded from generated answers and from the public knowledge card text."
        : "Use for non-operational teaching context and citation-level grounding only.",
      keywords: [
        ...new Set([
          ...row.title.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2),
          ...modules,
          ...docIds
        ])
      ].slice(0, 18)
    };
  });
}

const kb = JSON.parse(fs.readFileSync(kbPath, "utf8"));
const allEvidence = [];
for (const book of textbooks) {
  if (!fs.existsSync(book.pdf_path)) {
    console.warn(`Missing PDF: ${book.pdf_path}`);
    continue;
  }
  allEvidence.push(...await buildForBook(book));
}

kb.textbook_evidence = allEvidence;
kb.updated_at = "2026-05-24";
fs.writeFileSync(kbPath, `${JSON.stringify(kb, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  textbookEvidence: allEvidence.length,
  bySource: textbooks.map((book) => ({
    source_id: book.source_id,
    count: allEvidence.filter((item) => item.source_id === book.source_id).length
  })),
  operationalLocatorOnly: allEvidence.filter((item) => item.evidence_scope === "locator_only_operational_content_excluded").length
}, null, 2));

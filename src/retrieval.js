import fs from "node:fs";

const CJK_RANGE = /[\u3400-\u9fff]/;
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "what", "why", "how", "are", "is", "to", "of",
  "a", "an", "in", "on", "吗", "呢", "的", "了", "和", "与", "及", "请", "什么"
]);

export function loadKnowledgeBase(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

export function tokenize(input = "") {
  const lower = input.toLowerCase();
  const latin = lower.match(/[a-z0-9][a-z0-9-]{1,}/g) ?? [];
  const cjk = [];
  const chars = Array.from(lower).filter((char) => CJK_RANGE.test(char));

  for (let size of [2, 3, 4]) {
    for (let i = 0; i <= chars.length - size; i += 1) {
      cjk.push(chars.slice(i, i + size).join(""));
    }
  }

  return [...latin, ...cjk].filter((token) => !STOP_WORDS.has(token));
}

export function searchDocuments(kb, query, limit = 4) {
  const queryTokens = tokenize(query);
  const querySet = new Set(queryTokens);

  const scored = kb.documents.map((doc) => {
    const haystack = [
      doc.title,
      doc.topic,
      doc.level,
      doc.summary,
      doc.analogy,
      ...(doc.keywords ?? []),
      ...(doc.facts ?? [])
    ].join(" ");
    const docTokens = tokenize(haystack);
    let score = 0;

    for (const token of docTokens) {
      if (querySet.has(token)) score += token.length > 2 ? 2 : 1;
    }

    for (const keyword of doc.keywords ?? []) {
      if (query.toLowerCase().includes(keyword.toLowerCase())) score += 5;
    }

    return { doc, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function hydrateSources(kb, sourceIds = []) {
  const sourceMap = new Map(kb.sources.map((source) => [source.id, source]));
  return sourceIds.map((id) => sourceMap.get(id)).filter(Boolean);
}

export function uniqueSourcesForDocs(kb, docs) {
  const ids = new Set();
  for (const { doc } of docs) {
    for (const id of doc.source_ids ?? []) ids.add(id);
  }
  return hydrateSources(kb, [...ids]);
}

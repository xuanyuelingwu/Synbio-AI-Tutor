import fs from "node:fs";

const CJK_RANGE = /[\u3400-\u9fff]/;
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "what", "why", "how", "are", "is", "to", "of",
  "a", "an", "in", "on", "吗", "呢", "的", "了", "和", "与", "及", "请", "什么",
  "一个", "一下", "可以", "为什么", "怎么", "如何"
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

function learningModuleOrder(kb, moduleId) {
  return kb.learning_path?.find((module) => module.id === moduleId)?.order ?? null;
}

function applyLearningBoost(kb, chunk, score, options = {}) {
  const learningMode = options.learningMode !== false;
  if (!learningMode) {
    return { boostedScore: score, boostReason: "free_ask" };
  }

  const reasons = [];
  let multiplier = 1;

  if (options.activeDocumentId && chunk.doc_id === options.activeDocumentId) {
    multiplier *= 2.2;
    reasons.push("active_document");
  }

  if (options.activeModuleId && chunk.module_id === options.activeModuleId) {
    multiplier *= 1.6;
    reasons.push("active_module");
  } else if (options.activeModuleId && chunk.module_id) {
    const activeOrder = learningModuleOrder(kb, options.activeModuleId);
    const chunkOrder = learningModuleOrder(kb, chunk.module_id);
    if (activeOrder && chunkOrder && chunkOrder < activeOrder) {
      multiplier *= 1.15;
      reasons.push("prerequisite_review");
    }
  }

  return {
    boostedScore: score * multiplier,
    boostReason: reasons.length ? reasons.join("+") : "none"
  };
}

function contextualPrior(query, chunk, options = {}) {
  const learningMode = options.learningMode !== false;
  if (!learningMode || !options.activeModuleId || chunk.module_id !== options.activeModuleId) return 0;
  if (!/(这个|这种|该|它|当前|刚才|this|it|current)/i.test(query)) return 0;
  if (options.activeDocumentId && chunk.doc_id === options.activeDocumentId) return 18;
  return 12;
}

export function searchDocuments(kb, query, limit = 4, options = {}) {
  const evidence = searchEvidence(kb, query, limit * 3, options);
  const docsById = new Map();

  for (const item of evidence) {
    const current = docsById.get(item.doc.id);
    if (!current) {
      docsById.set(item.doc.id, {
        doc: item.doc,
        score: item.score,
        evidence: [item]
      });
      continue;
    }

    current.score += item.score * 0.55;
    const hasCitationEvidence = current.evidence.some((evidenceItem) => evidenceItem.citation);
    if (current.evidence.length < 3 || (item.citation && !hasCitationEvidence && current.evidence.length < 4)) {
      current.evidence.push(item);
    }
  }

  return [...docsById.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildEvidenceChunks(kb) {
  const documentMap = new Map(kb.documents.map((doc) => [doc.id, doc]));
  const documentChunks = kb.documents.flatMap((doc) => {
    const common = {
      doc,
      doc_id: doc.id,
      title: doc.title,
      topic: doc.topic,
      level: doc.level,
      module_id: doc.module_id,
      order: doc.order,
      source_ids: doc.source_ids ?? [],
      keywords: doc.keywords ?? []
    };

    const chunks = [
      {
        ...common,
        id: `${doc.id}:summary`,
        kind: "summary",
        text: doc.summary,
        weight: 1.35
      },
      ...(doc.facts ?? []).map((fact, index) => ({
        ...common,
        id: `${doc.id}:fact:${index + 1}`,
        kind: "fact",
        text: fact,
        weight: 1.2
      })),
      {
        ...common,
        id: `${doc.id}:analogy`,
        kind: "analogy",
        text: doc.analogy,
        weight: 0.75
      }
    ];

    return chunks
      .filter((chunk) => chunk.text)
      .map((chunk) => ({
        ...chunk,
        tokens: tokenize([
          chunk.title,
          chunk.topic,
          chunk.text,
          ...(chunk.keywords ?? [])
        ].join(" "))
      }));
  });

  const textbookChunks = (kb.textbook_evidence ?? []).map((item) => {
    const docId = item.document_ids?.find((id) => documentMap.has(id)) ?? item.document_ids?.[0];
    const doc = documentMap.get(docId) ?? {
      id: docId ?? item.id,
      title: item.title,
      topic: item.module_ids?.[0] ?? "Textbook Reference",
      level: "beginner",
      module_id: item.module_ids?.[0],
      source_ids: [item.source_id],
      keywords: item.keywords ?? []
    };
    const moduleId = item.module_ids?.[0] ?? doc.module_id;
    const isLocatorOnly = item.evidence_scope === "locator_only_operational_content_excluded";

    const chunk = {
      doc,
      doc_id: doc.id,
      title: item.title,
      topic: doc.topic,
      level: doc.level,
      module_id: moduleId,
      order: doc.order,
      source_ids: [item.source_id],
      keywords: item.keywords ?? [],
      id: `${item.id}:textbook`,
      kind: isLocatorOnly ? "textbook_locator" : "textbook_reference",
      text: item.teaching_summary,
      weight: isLocatorOnly ? 0.14 : 0.74,
      citation: {
        source_id: item.source_id,
        book_title: item.book_title,
        author: item.author,
        section: item.title,
        page_start: item.page_start,
        page_end: item.page_end,
        evidence_scope: item.evidence_scope
      }
    };

    return {
      ...chunk,
      tokens: tokenize([
        chunk.title,
        chunk.topic,
        item.section_path?.join(" "),
        chunk.text,
        item.book_title,
        item.author,
        ...(chunk.keywords ?? [])
      ].join(" "))
    };
  });

  return [...documentChunks, ...textbookChunks];
}

export function searchEvidence(kb, query, limit = 8, options = {}) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const querySet = new Set(queryTokens);
  const chunks = buildEvidenceChunks(kb);
  const avgLength = chunks.reduce((sum, chunk) => sum + chunk.tokens.length, 0) / Math.max(1, chunks.length);
  const documentFrequency = new Map();

  for (const chunk of chunks) {
    const unique = new Set(chunk.tokens);
    for (const token of unique) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  const lowerQuery = query.toLowerCase();
  const scored = chunks.map((chunk) => {
    const frequencies = new Map();
    for (const token of chunk.tokens) {
      frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    }

    const matchedTokens = new Set();
    let score = 0;
    const k1 = 1.35;
    const b = 0.72;

    for (const token of querySet) {
      const frequency = frequencies.get(token) ?? 0;
      if (!frequency) continue;

      const df = documentFrequency.get(token) ?? 0;
      const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));
      const lengthPenalty = k1 * (1 - b + b * (chunk.tokens.length / Math.max(1, avgLength)));
      score += idf * ((frequency * (k1 + 1)) / (frequency + lengthPenalty));
      matchedTokens.add(token);
    }

    for (const keyword of chunk.keywords ?? []) {
      if (keyword && lowerQuery.includes(keyword.toLowerCase())) {
        score += 3.5;
        for (const token of tokenize(keyword)) matchedTokens.add(token);
      }
    }

    if (lowerQuery.includes(chunk.title.toLowerCase())) score += 4;
    if (lowerQuery.includes(chunk.topic.toLowerCase())) score += 2;
    if (chunk.citation) {
      const author = String(chunk.citation.author ?? "").toLowerCase();
      const authorLastName = author.split(/\s+/).filter(Boolean).at(-1) ?? "";
      if (lowerQuery.includes("textbook") || lowerQuery.includes("教材") || lowerQuery.includes("课本")) score += 18;
      if (authorLastName && lowerQuery.includes(authorLastName)) score += 55;
    }
    score += (matchedTokens.size / Math.max(1, querySet.size)) * 2.25;
    score *= chunk.weight;
    score += contextualPrior(query, chunk, options);
    const baseScore = score;
    const { boostedScore, boostReason } = applyLearningBoost(kb, chunk, baseScore, options);

    return {
      id: chunk.id,
      kind: chunk.kind,
      doc: chunk.doc,
      title: chunk.title,
      topic: chunk.topic,
      module_id: chunk.module_id,
      text: chunk.text,
      citation: chunk.citation,
      source_ids: chunk.source_ids,
      score: Number(boostedScore.toFixed(4)),
      base_score: Number(baseScore.toFixed(4)),
      boosted_score: Number(boostedScore.toFixed(4)),
      boost_reason: boostReason,
      matched_tokens: [...matchedTokens].slice(0, 12)
    };
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
  for (const { doc, evidence = [] } of docs) {
    for (const id of doc.source_ids ?? []) ids.add(id);
    for (const item of evidence) {
      for (const id of item.source_ids ?? []) ids.add(id);
    }
  }
  return hydrateSources(kb, [...ids]);
}

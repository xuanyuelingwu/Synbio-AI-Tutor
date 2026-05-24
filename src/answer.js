import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assessSafety, safetyRedirect } from "./safety.js";
import { searchDocuments, uniqueSourcesForDocs } from "./retrieval.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function topEvidence(matches, limit = 6) {
  const seen = new Set();
  const evidence = [];

  for (const match of matches) {
    for (const item of match.evidence ?? []) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      evidence.push(item);
    }
  }

  return evidence
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}

function sourceIndexMap(sources) {
  return new Map(sources.map((source, index) => [source.id, index + 1]));
}

function sourceRefs(sourceIds = [], indexMap) {
  return sourceIds
    .map((id) => indexMap.get(id))
    .filter(Boolean)
    .map((index) => `[${index}]`)
    .join(" ");
}

function chineseKeywords(doc, limit = 3) {
  return (doc.keywords ?? [])
    .filter((keyword) => /[\u3400-\u9fff]/.test(keyword))
    .slice(0, limit)
    .join("、");
}

function publicEvidence(matches, limit = 6) {
  return topEvidence(matches, limit).map((item) => ({
    id: item.id,
    doc_id: item.doc.id,
    title: item.title,
    topic: item.topic,
    module_id: item.module_id,
    kind: item.kind,
    text: item.text,
    score: item.score,
    base_score: item.base_score,
    boosted_score: item.boosted_score,
    boost_reason: item.boost_reason,
    citation: item.citation,
    source_ids: item.source_ids
  }));
}

function buildFallbackAnswer(matches, sources) {
  if (matches.length === 0) {
    return [
      "这个问题我在当前知识库里没有找到足够贴近的材料，所以先给一个谨慎回答：",
      "",
      "合成生物学通常关心如何用工程化思路理解、设计和改造生物系统。为了保持准确，我建议把问题拆成一个更具体的主题，比如“遗传线路”“生物传感器”“AI 如何辅助设计”“伦理与安全”或“合成生物学和基因编辑的区别”。",
      "",
      "小小的科学火花：这个领域最迷人的地方，是它把生命从“只能阅读的自然史”变成“可以负责任地设计的工程语言”。"
    ].join("\n");
  }

  const primary = matches[0].doc;
  const primaryChinese = chineseKeywords(primary);
  const primaryLabel = primaryChinese ? `${primary.title}（${primaryChinese}）` : primary.title;
  const indexMap = sourceIndexMap(sources);
  const evidence = topEvidence(matches, 5)
    .map((item) => {
      const refs = sourceRefs(item.source_ids, indexMap);
      const citation = item.citation
        ? ` (${item.citation.author}, ${item.citation.book_title}, pp. ${item.citation.page_start}-${item.citation.page_end})`
        : "";
      return `- ${item.text}${citation}${refs ? ` ${refs}` : ""}`;
    })
    .join("\n");

  const sourceLine = sources
    .slice(0, 3)
    .map((source, index) => `[${index + 1}] ${source.publisher}`)
    .join("、");

  return [
    `可以。围绕“${primaryLabel}”，最核心的理解是：${primary.summary}`,
    "",
    evidence ? `当前知识库命中的证据：\n${evidence}` : "",
    "",
    `有趣一点说：${primary.analogy}`,
    "",
    sourceLine ? `我主要参考了 ${sourceLine} 的公开资料。` : "",
    "",
    "提醒：如果问题涉及真实实验、释放到环境、病原体、毒素或可操作构建设计，需要走正规实验室、生物安全和伦理审查流程。"
  ].filter(Boolean).join("\n");
}

function sourceBlocks(sources) {
  if (!sources.length) return "当前检索没有命中可引用来源。";
  return sources.map((source, index) => (
    `[${index + 1}] ${source.title} - ${source.publisher}\n${source.url}`
  )).join("\n\n");
}

function buildInstructions(kb) {
  const promptPath = path.join(root, "data", "deepseek_system_prompt.md");
  const basePrompt = fs.existsSync(promptPath)
    ? fs.readFileSync(promptPath, "utf8")
    : "你是合成生物学 AI 助教。请准确、有趣、可追溯地回答，并遵守生物安全边界。";

  return [
    basePrompt,
    "",
    "## 当前项目安全策略",
    `安全边界：${JSON.stringify(kb.safety_policy)}`
  ].join("\n");
}

function buildContext(matches, sources, options = {}) {
  const indexMap = sourceIndexMap(sources);
  const evidence = topEvidence(matches, 8).map((item, index) => {
    const refs = sourceRefs(item.source_ids, indexMap) || "未匹配来源编号";
    return [
      `证据 ${index + 1}: ${item.title}`,
      `主题: ${item.topic}`,
      `学习模块: ${item.module_id ?? "未标注"}`,
      `类型: ${item.kind}`,
      `内容: ${item.text}`,
      item.citation
        ? `教材定位: ${item.citation.author}, ${item.citation.book_title}, pp. ${item.citation.page_start}-${item.citation.page_end}; section: ${item.citation.section}; scope: ${item.citation.evidence_scope}`
        : "",
      `检索加权: ${item.boost_reason ?? "none"}`,
      `来源: ${refs}`
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  const docs = matches.map(({ doc }, index) => (
    `资料 ${index + 1}: ${doc.title}\n主题: ${doc.topic}\n摘要: ${doc.summary}\n事实: ${(doc.facts ?? []).join("；")}\n类比: ${doc.analogy}\n来源ID: ${(doc.source_ids ?? []).join(", ")}`
  )).join("\n\n");

  return [
    "优先依据这些证据片段回答，并在关键判断后使用来源编号。",
    options.learningMode !== false && (options.activeModuleId || options.activeDocumentId)
      ? "当前处于学习上下文加权检索：请优先围绕当前知识点解释，但若需要可回顾前置基础。"
      : "当前处于自由提问或普通检索模式。",
    evidence || "没有命中证据片段。",
    "",
    "相关知识卡:",
    docs || "无。",
    "",
    "来源清单:",
    sourceBlocks(sources)
  ].join("\n");
}

async function callDeepSeek({ question, kb, matches, sources, options }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const payload = {
    model,
    messages: [
      {
        role: "system",
        content: buildInstructions(kb)
      },
      {
        role: "user",
        content: [
          `用户问题：${question}`,
          "",
          "请严格依据以下检索资料回答。若资料不足，不要编造；请说明当前知识库不足，并给出安全的学习方向。",
          "回答要保持中文、准确、可追溯，同时有合成生物学科普的趣味和魅力。",
          "",
          buildContext(matches, sources, options)
        ].join("\n")
      }
    ],
    max_tokens: 1200,
    thinking: {
      type: process.env.DEEPSEEK_THINKING || "disabled"
    }
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function answerQuestion(kb, question, options = {}) {
  const safety = assessSafety(question);
  const matches = searchDocuments(kb, question, 4, options);
  const sources = uniqueSourcesForDocs(kb, matches);

  if (!safety.allowed) {
    return {
      answer: safetyRedirect(),
      mode: "safety_redirect",
      confidence: 0.8,
      matches: [],
      sources: sources.length ? sources : kb.sources.filter((source) => source.id === "who-responsible-life-sciences"),
      evidence: []
    };
  }

  try {
    const modelAnswer = await callDeepSeek({ question, kb, matches, sources, options });
    if (modelAnswer) {
      return {
        answer: modelAnswer,
        mode: "deepseek_rag",
        context_weighted: options.learningMode !== false && Boolean(options.activeModuleId || options.activeDocumentId),
        confidence: matches.length ? 0.86 : 0.45,
        matches: matches.map(({ doc, score }) => ({ id: doc.id, title: doc.title, topic: doc.topic, score })),
        sources,
        evidence: publicEvidence(matches)
      };
    }
  } catch (error) {
    console.warn(error.message);
  }

  return {
    answer: buildFallbackAnswer(matches, sources),
    mode: "local_rag_fallback",
    context_weighted: options.learningMode !== false && Boolean(options.activeModuleId || options.activeDocumentId),
    confidence: matches.length ? 0.72 : 0.35,
    matches: matches.map(({ doc, score }) => ({ id: doc.id, title: doc.title, topic: doc.topic, score })),
    sources,
    evidence: publicEvidence(matches)
  };
}

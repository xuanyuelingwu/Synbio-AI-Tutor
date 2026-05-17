import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assessSafety, safetyRedirect } from "./safety.js";
import { searchDocuments, uniqueSourcesForDocs } from "./retrieval.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

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
  const supporting = matches.slice(1, 3).map(({ doc }) => doc);
  const facts = [primary, ...supporting]
    .flatMap((doc) => doc.facts ?? [])
    .slice(0, 5)
    .map((fact) => `- ${fact}`)
    .join("\n");

  const sourceLine = sources
    .slice(0, 3)
    .map((source) => source.publisher)
    .join("、");

  return [
    `可以。围绕“${primary.title}”，最核心的理解是：${primary.summary}`,
    "",
    facts ? `关键点：\n${facts}` : "",
    "",
    `有趣一点说：${primary.analogy}`,
    "",
    sourceLine ? `我主要参考了 ${sourceLine} 的公开资料。` : "",
    "",
    "提醒：如果问题涉及真实实验、释放到环境、病原体、毒素或可操作构建设计，需要走正规实验室、生物安全和伦理审查流程。"
  ].filter(Boolean).join("\n");
}

function sourceBlocks(sources) {
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

function buildContext(matches, sources) {
  const docs = matches.map(({ doc }, index) => (
    `资料 ${index + 1}: ${doc.title}\n主题: ${doc.topic}\n摘要: ${doc.summary}\n事实: ${(doc.facts ?? []).join("；")}\n类比: ${doc.analogy}\n来源ID: ${(doc.source_ids ?? []).join(", ")}`
  )).join("\n\n");

  return `${docs}\n\n来源清单:\n${sourceBlocks(sources)}`;
}

async function callDeepSeek({ question, kb, matches, sources }) {
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
          buildContext(matches, sources)
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

export async function answerQuestion(kb, question) {
  const safety = assessSafety(question);
  const matches = searchDocuments(kb, question, 4);
  const sources = uniqueSourcesForDocs(kb, matches);

  if (!safety.allowed) {
    return {
      answer: safetyRedirect(),
      mode: "safety_redirect",
      confidence: 0.8,
      matches: [],
      sources: sources.length ? sources : kb.sources.filter((source) => source.id === "who-responsible-life-sciences")
    };
  }

  try {
    const modelAnswer = await callDeepSeek({ question, kb, matches, sources });
    if (modelAnswer) {
      return {
        answer: modelAnswer,
        mode: "deepseek_rag",
        confidence: matches.length ? 0.86 : 0.45,
        matches: matches.map(({ doc, score }) => ({ id: doc.id, title: doc.title, topic: doc.topic, score })),
        sources
      };
    }
  } catch (error) {
    console.warn(error.message);
  }

  return {
    answer: buildFallbackAnswer(matches, sources),
    mode: "local_rag_fallback",
    confidence: matches.length ? 0.72 : 0.35,
    matches: matches.map(({ doc, score }) => ({ id: doc.id, title: doc.title, topic: doc.topic, score })),
    sources
  };
}

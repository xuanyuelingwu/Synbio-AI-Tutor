const chatLog = document.querySelector("#chatLog");
const askForm = document.querySelector("#askForm");
const input = document.querySelector("#questionInput");
const askButton = document.querySelector("#askButton");
const promptRow = document.querySelector("#promptRow");
const sourceList = document.querySelector("#sourceList");
const topicBoard = document.querySelector("#topicBoard");
const systemMode = document.querySelector("#systemMode");
const confidence = document.querySelector("#confidence");

const topicColors = ["#2f6f8f", "#5f7786", "#13202a", "#7a8d98", "#3e6578", "#8796a0"];
const topicNames = {
  "基础概念": "Basic Concepts / 基础概念",
  "工程方法": "Engineering Methods / 工程方法",
  "核心案例": "Core Cases / 核心案例",
  "应用案例": "Applications / 应用案例",
  "AI融合": "AI Fusion / AI融合",
  "安全治理": "Safety Governance / 安全治理",
  "前沿话题": "Frontier Topics / 前沿话题"
};

const documentNames = {
  "synbio-definition": "What Is Synthetic Biology / 什么是合成生物学",
  "synbio-vs-editing": "Synthetic Biology vs. Genome Editing / 合成生物学和基因编辑的区别",
  "design-build-test-learn": "Design-Build-Test-Learn Cycle / 设计-构建-测试-学习循环",
  "parts-devices-systems": "Parts, Devices, and Systems / 生物部件、装置和系统",
  "genetic-circuits": "Genetic Circuits / 遗传线路：开关、振荡器和逻辑门",
  "biosensors": "Biosensors / 生物传感器",
  "applications": "Applications of Synthetic Biology / 合成生物学能做什么",
  "ai-and-genomics": "AI and Genomic Data / AI 与基因组数据",
  "ethics-safety": "Ethics, Safety, and Responsible Innovation / 伦理、安全与负责任创新",
  "whole-genome-synthesis": "Whole-Genome Synthesis / 全基因组合成",
  "biomedical-synbio": "Biomedical Applications / 合成生物学在医学中的应用",
  "measurement-standards-biofoundry": "Measurement, Standards, and Biofoundries / 测量、标准化和生物铸造厂",
  "cell-free-synthetic-biology": "Cell-Free Synthetic Biology / 细胞自由合成生物学",
  "protein-engineering": "Protein Engineering / 蛋白工程与合成生物学",
  "biosecurity-risk-assessment": "Biosecurity Risk Assessment / 合成生物学的生物安保风险评估",
  "technology-stewardship-public-trust": "Technology Stewardship and Public Trust / 技术治理、公众信任与负责任创新"
};

const levelNames = {
  beginner: "Beginner / 入门",
  intermediate: "Intermediate / 进阶",
  advanced: "Advanced / 高阶"
};

function topicLabel(topic) {
  return topicNames[topic] ?? topic;
}

function documentLabel(doc) {
  return documentNames[doc.id] ?? doc.title;
}

function escapeHtml(value) {
  const text = String(value ?? "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function splitBilingual(value) {
  const text = String(value ?? "");
  const separator = " / ";
  if (!text.includes(separator)) return { en: text, zh: "" };
  const [en, ...rest] = text.split(separator);
  return { en, zh: rest.join(separator) };
}

function bilingualHtml(value) {
  const { en, zh } = splitBilingual(value);
  if (!zh) return `<span class="label-en">${escapeHtml(en)}</span>`;
  return `<span class="label-en">${escapeHtml(en)}</span><span class="label-zh">${escapeHtml(zh)}</span>`;
}

function bilingualPlain(value) {
  const { en, zh } = splitBilingual(value);
  return zh ? `${en} ${zh}` : en;
}

function setBilingual(element, value) {
  element.innerHTML = bilingualHtml(value);
}

function protectMath(text) {
  const math = [];
  const protectedText = String(text ?? "").replace(
    /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g,
    (match) => {
      const index = math.push(match) - 1;
      return `@@MATH_${index}@@`;
    }
  );

  return { protectedText, math };
}

function restoreMath(html, math) {
  return html.replace(/@@MATH_(\d+)@@/g, (_, index) => escapeHtml(math[Number(index)] ?? ""));
}

function formatInline(text, math) {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  html = html.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");

  return restoreMath(html, math);
}

function formatAnswer(text) {
  const { protectedText, math } = protectMath(text);
  const lines = protectedText.split(/\r?\n/);
  const html = [];
  let listType = null;

  function closeList() {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(4, heading[1].length + 1);
      html.push(`<h${level}>${formatInline(heading[2], math)}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${formatInline(unordered[1], math)}</li>`);
      continue;
    }

    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${formatInline(ordered[1], math)}</li>`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${formatInline(quote[1], math)}</blockquote>`);
      continue;
    }

    closeList();
    html.push(`<p>${formatInline(line, math)}</p>`);
  }

  closeList();
  return html.join("");
}

function typesetMath(container, attempts = 0) {
  if (!window.MathJax?.typesetPromise) {
    if (attempts < 20) window.setTimeout(() => typesetMath(container, attempts + 1), 150);
    return;
  }

  window.MathJax.typesetPromise([container]).catch((error) => {
    console.warn("MathJax typeset failed", error);
  });
}

function appendMessage(role, content, sources = [], evidence = []) {
  const article = document.createElement("article");
  article.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "你" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = role === "assistant" ? formatAnswer(content) : `<p>${escapeHtml(content)}</p>`;

  if (sources.length) {
    const sourceBox = document.createElement("div");
    sourceBox.className = "sources";
    sourceBox.innerHTML = sources
      .slice(0, 4)
      .map((source, index) => `<a href="${source.url}" target="_blank" rel="noreferrer">[${index + 1}] ${escapeHtml(source.title)} · ${escapeHtml(source.publisher)}</a>`)
      .join("");
    bubble.append(sourceBox);
  }

  if (role === "assistant" && evidence.length) {
    const evidenceBox = document.createElement("details");
    evidenceBox.className = "evidence";
    evidenceBox.innerHTML = `
      <summary><span class="label-en">Evidence Hits · ${evidence.length}</span><span class="label-zh">命中证据 · ${evidence.length}</span></summary>
      <div>
        ${evidence.slice(0, 5).map((item) => `
          <section>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.text)}</p>
            <span class="evidence-meta">${bilingualHtml(topicLabel(item.topic))}</span>
            <span class="score-meta">${escapeHtml(item.kind)} · ${Math.round((item.score ?? 0) * 10) / 10}</span>
          </section>
        `).join("")}
      </div>
    `;
    bubble.append(evidenceBox);
  }

  article.append(avatar, bubble);
  chatLog.append(article);
  if (role === "assistant") typesetMath(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function ask(question) {
  appendMessage("user", question);
  askButton.disabled = true;
  setBilingual(askButton.querySelector("span"), "Thinking / 思考中");

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "请求失败");

    appendMessage("assistant", data.answer, data.sources ?? [], data.evidence ?? []);
    setBilingual(systemMode, data.mode === "deepseek_rag" ? "Model evidence mode / 模型增强证据检索" : data.mode === "safety_redirect" ? "Safety boundary / 安全边界模式" : "Local evidence mode / 本地证据检索");
    setBilingual(confidence, `Evidence ${Math.round((data.confidence ?? 0) * 100)}% / 证据置信度`);
  } catch (error) {
    appendMessage("assistant", `Error\n出错了：${error.message}`);
  } finally {
    askButton.disabled = false;
    setBilingual(askButton.querySelector("span"), "Send / 发送");
  }
}

askForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  input.value = "";
  ask(question);
});

promptRow.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-question]");
  if (!button) return;
  ask(button.dataset.question);
});

topicBoard.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-document-id]");
  if (!button) return;
  showKnowledgeCard(button.dataset.documentId);
});

async function showKnowledgeCard(documentId) {
  try {
    const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Document request failed");

    const doc = data.document;
    const titleParts = splitBilingual(documentLabel(doc));
    const topicParts = splitBilingual(topicLabel(doc.topic));
    const levelParts = splitBilingual(levelNames[doc.level] ?? doc.level);
    const facts = (doc.facts ?? []).map((fact) => `- ${fact}`).join("\n");
    const sourceLines = (data.sources ?? [])
      .map((source, index) => `- [${index + 1}] ${source.title} · ${source.publisher}\n  ${source.url}`)
      .join("\n");

    appendMessage("assistant", [
      `### ${titleParts.en}`,
      titleParts.zh,
      "",
      "**Topic**",
      topicParts.en,
      `主题：${topicParts.zh || doc.topic}`,
      "",
      "**Level**",
      levelParts.en,
      `难度：${levelParts.zh || doc.level}`,
      "",
      "**Summary**",
      "摘要：",
      doc.summary,
      "",
      facts ? `**Key Facts**\n关键事实：\n${facts}` : "",
      "",
      "**Analogy**",
      "类比：",
      doc.analogy,
      "",
      sourceLines ? `**Sources**\n来源：\n${sourceLines}` : ""
    ].filter(Boolean).join("\n"));
  } catch (error) {
    appendMessage("assistant", `Error\n出错了：${error.message}`);
  }
}

async function loadMeta() {
  const [health, sources, topics] = await Promise.all([
    fetch("/api/health").then((res) => res.json()),
    fetch("/api/sources").then((res) => res.json()),
    fetch("/api/topics").then((res) => res.json())
  ]);

  setBilingual(systemMode, health.mode === "deepseek_rag" ? `Model linked${health.model ? ` · ${health.model}` : ""} / 模型已连接` : "Local evidence mode / 本地证据模式");

  sourceList.innerHTML = sources.sources
    .slice(0, 5)
    .map((source) => `<a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.publisher)} · ${escapeHtml(source.title)}</a>`)
    .join("");

  topicBoard.innerHTML = topics.documents
    .map((doc, index) => `
      <button class="topic-card" type="button" data-document-id="${escapeHtml(doc.id)}" aria-label="Open ${escapeHtml(documentLabel(doc))}">
        <i style="background:${topicColors[index % topicColors.length]}"></i>
        <div>
          <strong>${bilingualHtml(documentLabel(doc))}</strong>
          <span class="card-meta">
            <span>${bilingualHtml(topicLabel(doc.topic))}</span>
            <span>${bilingualHtml(levelNames[doc.level] ?? doc.level)}</span>
          </span>
        </div>
        <em>${String(index + 1).padStart(2, "0")}</em>
      </button>
    `)
    .join("");
}

function drawPhaseCanvas() {
  const canvas = document.querySelector("#phaseCanvas");
  const ctx = canvas.getContext("2d");
  const dpi = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let tick = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
  }

  function render() {
    tick += 0.006;
    ctx.clearRect(0, 0, width, height);

    const centerX = width * 0.77;
    const centerY = height * 0.48;
    const radius = Math.min(width, height) * 0.24;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(19, 32, 42, 0.12)";
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius + i * 18, (radius + i * 18) * 0.72, 0.12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(47, 111, 143, 0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(width * 0.45, height * 0.72);
    ctx.bezierCurveTo(width * 0.58, height * 0.58, width * 0.62, height * 0.38, centerX - radius * 0.38, centerY);
    ctx.stroke();

    const particles = 18;
    for (let i = 0; i < particles; i += 1) {
      const phase = tick + i * 0.58;
      const orbit = radius * (0.36 + (i % 4) * 0.08);
      const x = centerX + Math.cos(phase) * orbit + Math.sin(i) * 8;
      const y = centerY + Math.sin(phase * 0.82) * orbit * 0.62;
      const size = 2.4 + (i % 5) * 0.72;

      ctx.fillStyle = i % 5 === 0 ? "rgba(19, 32, 42, 0.34)" : "rgba(47, 111, 143, 0.28)";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  resize();
  render();
  window.addEventListener("resize", resize);
}

loadMeta();
drawPhaseCanvas();

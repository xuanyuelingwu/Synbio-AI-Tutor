const chatLog = document.querySelector("#chatLog");
const askForm = document.querySelector("#askForm");
const input = document.querySelector("#questionInput");
const askButton = document.querySelector("#askButton");
const promptRow = document.querySelector("#promptRow");
const sourceList = document.querySelector("#sourceList");
const topicBoard = document.querySelector("#topicBoard");
const systemMode = document.querySelector("#systemMode");
const confidence = document.querySelector("#confidence");
const contextChip = document.querySelector("#contextChip");
const freeAskButton = document.querySelector("#freeAskButton");

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
  "technology-stewardship-public-trust": "Technology Stewardship and Public Trust / 技术治理、公众信任与负责任创新",
  "cell-basics": "Cells as Life Systems / 细胞是生命系统的基本单位",
  "dna-rna-protein-flow": "DNA, RNA, and Protein Information Flow / DNA、RNA 和蛋白质的信息流",
  "genes-regulatory-elements": "Genes and Regulatory Elements / 基因和调控元件",
  "gene-expression-regulation": "Gene Expression Regulation / 基因表达调控",
  "host-chassis": "Hosts and Chassis Cells / 宿主和底盘细胞",
  "abstraction-hierarchy": "Abstraction Hierarchy / 抽象分层",
  "standardization-reuse": "Standardization and Reusable Parts / 标准化和可复用部件",
  "sequencing-reading-dna": "Sequencing: Reading DNA / 测序：读取 DNA 信息",
  "dna-synthesis-assembly": "DNA Synthesis and Assembly / DNA 合成和组装",
  "genome-editing-concepts": "Genome Editing Concepts / 基因组编辑的高层概念",
  "genetic-code-expansion": "Genetic Alphabet and Code Expansion / 遗传字母和遗传密码扩展",
  "operons-feedback": "Operons, Feedback, and Regulatory Logic / 操纵子、反馈和调控逻辑",
  "logic-gates-information": "Logic Gates and Cellular Information Processing / 逻辑门和细胞信息处理",
  "noise-burden-context": "Noise, Burden, and Context Dependence / 噪声、负担和上下文依赖",
  "network-dynamics": "Biomolecular Network Dynamics / 生物分子网络动态",
  "computer-simulation-cells": "Computer Simulation of Cells / 细胞计算模拟",
  "bio-cad-design-language": "Bio-CAD and Design Languages / 生物 CAD 和设计语言",
  "sensor-input-modules": "Sensor Input Modules / 传感输入模块",
  "signal-processing-output": "Signal Processing and Output Modules / 信号处理与输出模块",
  "specificity-sensitivity": "Specificity and Sensitivity / 特异性和灵敏度",
  "pathways-flux": "Metabolic Pathways and Flux / 代谢通路和通量",
  "microbial-cell-factories": "Microbial Cell Factories / 微生物细胞工厂",
  "biofuels-chemicals-materials": "Biofuels, Chemicals, and Materials / 燃料、化学品和材料生产",
  "minimal-genome": "Minimal Genomes / 最小基因组",
  "compartmentalization-synthetic-cells": "Compartmentalization and Synthetic Cells / 隔室化和合成细胞",
  "rnai-synthetic-logic": "RNAi and Synthetic Logic / RNAi 和合成逻辑",
  "regenerative-cell-therapy": "Regenerative Medicine and Cell Therapy / 再生医学和细胞治疗",
  "vaccines-immunology-synbio": "Vaccines and Immunology Applications / 疫苗和免疫相关应用",
  "dna-origami-nanostructures": "DNA Origami and Nanostructures / DNA 折纸和纳米结构",
  "engineered-living-materials": "Engineered Living Materials / 工程活细胞材料",
  "dual-use-biosecurity": "Dual Use and Biosecurity / 双重用途和生物安保",
  "biosafety-biosecurity-difference": "Biosafety vs. Biosecurity / 生物安全和生物安保的区别",
  "public-dialogue-responsibility": "Public Dialogue and Responsible Innovation / 公众对话和责任创新"
};

const levelNames = {
  beginner: "Beginner / 入门",
  intermediate: "Intermediate / 进阶",
  advanced: "Advanced / 高阶"
};

let learningModules = [];
let activeModuleId = null;
let activeDocumentId = null;
let activeDocumentLabel = null;

function topicLabel(topic) {
  return topicNames[topic] ?? topic;
}

function documentLabel(doc) {
  return documentNames[doc.id] ?? doc.title;
}

function moduleLabel(module) {
  return `${module.title_en} / ${module.title_zh}`;
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

function sourceTierLabel(source) {
  if (source.source_tier === "local_textbook_reference") return "Local textbook reference / 本地教材参考";
  return "Public authority source / 公开权威来源";
}

function sourceLinkHtml(source, index = null) {
  const prefix = index === null ? "" : `[${index + 1}] `;
  const label = `${prefix}${source.title} · ${source.publisher}`;
  const tier = sourceTierLabel(source);
  if (source.source_tier === "local_textbook_reference") {
    return `<span class="source-link textbook-source">${escapeHtml(label)}<small>${bilingualHtml(tier)}</small></span>`;
  }
  return `<a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(label)}<small>${bilingualHtml(tier)}</small></a>`;
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
      .map((source, index) => sourceLinkHtml(source, index))
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
            <span class="score-meta">${escapeHtml(item.module_id ?? "unscoped")} · ${escapeHtml(item.boost_reason ?? "none")} · ${escapeHtml(item.kind)} · ${Math.round((item.score ?? 0) * 10) / 10}</span>
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
      body: JSON.stringify({
        question,
        activeModuleId,
        activeDocumentId,
        learningMode: Boolean(activeModuleId || activeDocumentId)
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "请求失败");

    appendMessage("assistant", data.answer, data.sources ?? [], data.evidence ?? []);
    if (data.context_weighted) appendContextNotice();
    setBilingual(systemMode, data.mode === "deepseek_rag" ? "Model evidence mode / 模型增强证据检索" : data.mode === "safety_redirect" ? "Safety boundary / 安全边界模式" : "Local evidence mode / 本地证据检索");
    setBilingual(confidence, `Evidence ${Math.round((data.confidence ?? 0) * 100)}% / 证据置信度`);
  } catch (error) {
    appendMessage("assistant", `Error\n出错了：${error.message}`);
  } finally {
    askButton.disabled = false;
    setBilingual(askButton.querySelector("span"), "Send / 发送");
  }
}

function appendContextNotice() {
  const article = document.createElement("article");
  article.className = "message assistant compact";
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "AI";
  const bubble = document.createElement("div");
  bubble.className = "bubble context-notice";
  bubble.innerHTML = '<p><span class="label-en">Context-weighted retrieval</span><span class="label-zh">已基于当前知识点加权检索</span></p>';
  article.append(avatar, bubble);
  chatLog.append(article);
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
  setActiveContext(button.dataset.moduleId, button.dataset.documentId, button.dataset.documentLabel);
  showKnowledgeCard(button.dataset.documentId);
});

freeAskButton.addEventListener("click", () => {
  activeModuleId = null;
  activeDocumentId = null;
  activeDocumentLabel = null;
  renderContextChip();
  appendMessage("assistant", [
    "### Free Ask",
    "自由提问",
    "",
    "已清除当前学习知识点。现在会按全知识库进行普通证据检索。"
  ].join("\n"));
});

function setActiveContext(moduleId, documentId, label) {
  activeModuleId = moduleId || null;
  activeDocumentId = documentId || null;
  activeDocumentLabel = label || null;
  renderContextChip();
}

function renderContextChip() {
  if (!activeDocumentId) {
    contextChip.innerHTML = '<span class="label-en">Free Ask</span><span class="label-zh">自由提问</span>';
    document.querySelectorAll(".topic-card.active").forEach((item) => item.classList.remove("active"));
    return;
  }

  contextChip.innerHTML = `<span class="label-en">Current Topic</span><span class="label-zh">当前知识点：${escapeHtml(activeDocumentLabel ?? activeDocumentId)}</span>`;
  document.querySelectorAll(".topic-card.active").forEach((item) => item.classList.remove("active"));
  document.querySelector(`[data-document-id="${CSS.escape(activeDocumentId)}"]`)?.classList.add("active");
}

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
    const objectives = (doc.learning_objectives ?? []).map((item) => `- ${item}`).join("\n");
    const terms = (doc.core_terms ?? []).map((item) => `- ${item}`).join("\n");
    const misconceptions = (doc.misconceptions ?? []).map((item) => `- ${item}`).join("\n");
    const questions = (doc.student_questions ?? []).map((item) => `- ${item}`).join("\n");
    const sourceLines = (data.sources ?? [])
      .map((source, index) => {
        const localNote = source.source_tier === "local_textbook_reference"
          ? "Local textbook reference / 本地教材参考"
          : source.url;
        return `- [${index + 1}] ${source.title} · ${source.publisher}\n  ${localNote}`;
      })
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
      objectives ? `**Learning Objectives**\n学习目标：\n${objectives}` : "",
      "",
      terms ? `**Core Terms**\n核心术语：\n${terms}` : "",
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
      misconceptions ? `**Common Misconceptions**\n常见误区：\n${misconceptions}` : "",
      "",
      questions ? `**Suggested Questions**\n推荐提问：\n${questions}` : "",
      "",
      sourceLines ? `**Sources**\n来源：\n${sourceLines}` : ""
    ].filter(Boolean).join("\n"));
  } catch (error) {
    appendMessage("assistant", `Error\n出错了：${error.message}`);
  }
}

async function loadMeta() {
  const [health, sources, topics, learningPath] = await Promise.all([
    fetch("/api/health").then((res) => res.json()),
    fetch("/api/sources").then((res) => res.json()),
    fetch("/api/topics").then((res) => res.json()),
    fetch("/api/learning-path").then((res) => res.json())
  ]);
  learningModules = learningPath.modules ?? [];

  setBilingual(systemMode, health.mode === "deepseek_rag" ? `Model linked${health.model ? ` · ${health.model}` : ""} / 模型已连接` : "Local evidence mode / 本地证据模式");

  sourceList.innerHTML = sources.sources
    .filter((source) => source.source_tier === "local_textbook_reference")
    .concat(sources.sources.filter((source) => source.source_tier !== "local_textbook_reference"))
    .slice(0, 7)
    .map((source) => sourceLinkHtml(source))
    .join("");

  topicBoard.innerHTML = learningModules
    .map((module, moduleIndex) => `
      <details class="learning-module" ${moduleIndex === 0 ? "open" : ""}>
        <summary>
          <span>${bilingualHtml(moduleLabel(module))}</span>
          <em>${String(module.order).padStart(2, "0")}</em>
        </summary>
        <div class="module-documents">
          ${(module.documents ?? []).map((doc, index) => {
            const label = splitBilingual(documentLabel(doc)).zh || doc.title;
            return `
              <button class="topic-card" type="button" data-module-id="${escapeHtml(module.id)}" data-document-id="${escapeHtml(doc.id)}" data-document-label="${escapeHtml(label)}" aria-label="Open ${escapeHtml(documentLabel(doc))}">
                <i style="background:${topicColors[index % topicColors.length]}"></i>
                <div>
                  <strong>${bilingualHtml(documentLabel(doc))}</strong>
                  <span class="card-meta">
                    <span>${bilingualHtml(topicLabel(doc.topic))}</span>
                    <span>${bilingualHtml(levelNames[doc.level] ?? doc.level)}</span>
                    ${doc.source_tier === "local_textbook_reference" ? `<span class="source-badge">${bilingualHtml("Textbook / 教材参考")}</span>` : ""}
                  </span>
                </div>
                <em>${String(index + 1).padStart(2, "0")}</em>
              </button>
            `;
          }).join("")}
        </div>
      </details>
    `)
    .join("");
  renderContextChip();
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

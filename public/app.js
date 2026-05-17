const chatLog = document.querySelector("#chatLog");
const askForm = document.querySelector("#askForm");
const input = document.querySelector("#questionInput");
const askButton = document.querySelector("#askButton");
const promptRow = document.querySelector("#promptRow");
const sourceList = document.querySelector("#sourceList");
const topicBoard = document.querySelector("#topicBoard");
const systemMode = document.querySelector("#systemMode");
const confidence = document.querySelector("#confidence");

const topicColors = ["#0f8b8d", "#e85d4f", "#3566a5", "#f4b740", "#5a9b54", "#8a5a9b"];

function escapeHtml(value) {
  const text = String(value ?? "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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

function appendMessage(role, content, sources = []) {
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

  article.append(avatar, bubble);
  chatLog.append(article);
  if (role === "assistant") typesetMath(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function ask(question) {
  appendMessage("user", question);
  askButton.disabled = true;
  askButton.querySelector("span").textContent = "思考中";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "请求失败");

    appendMessage("assistant", data.answer, data.sources ?? []);
    systemMode.textContent = data.mode === "deepseek_rag" ? "DeepSeek V4 增强回答" : data.mode === "safety_redirect" ? "安全边界模式" : "本地知识库回答";
    confidence.textContent = `置信度 ${Math.round((data.confidence ?? 0) * 100)}%`;
  } catch (error) {
    appendMessage("assistant", `出错了：${error.message}`);
  } finally {
    askButton.disabled = false;
    askButton.querySelector("span").textContent = "发送";
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

async function loadMeta() {
  const [health, sources, topics] = await Promise.all([
    fetch("/api/health").then((res) => res.json()),
    fetch("/api/sources").then((res) => res.json()),
    fetch("/api/topics").then((res) => res.json())
  ]);

  systemMode.textContent = health.mode === "deepseek_rag" ? `DeepSeek 已连接${health.model ? ` · ${health.model}` : ""}` : "本地知识库待命";

  sourceList.innerHTML = sources.sources
    .slice(0, 5)
    .map((source) => `<a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.publisher)} · ${escapeHtml(source.title)}</a>`)
    .join("");

  const counts = topics.documents.reduce((acc, doc) => {
    acc.set(doc.topic, (acc.get(doc.topic) ?? 0) + 1);
    return acc;
  }, new Map());

  topicBoard.innerHTML = [...counts.entries()]
    .map(([topic, count], index) => `
      <div class="topic-card">
        <i style="background:${topicColors[index % topicColors.length]}"></i>
        <div>
          <strong>${escapeHtml(topic)}</strong>
          <span>${count} 条知识卡</span>
        </div>
        <em>${String(index + 1).padStart(2, "0")}</em>
      </div>
    `)
    .join("");
}

function drawBioCanvas() {
  const canvas = document.querySelector("#bioCanvas");
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
    tick += 0.008;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1.4;

    const centerX = width * 0.72;
    const top = height * 0.08;
    const bottom = height * 0.92;
    const steps = 28;
    const spacing = (bottom - top) / steps;

    for (let i = 0; i <= steps; i += 1) {
      const y = top + spacing * i;
      const phase = tick + i * 0.52;
      const x1 = centerX + Math.sin(phase) * 72;
      const x2 = centerX + Math.sin(phase + Math.PI) * 72;
      const hue = i % 3 === 0 ? "#0f8b8d" : i % 3 === 1 ? "#e85d4f" : "#f4b740";

      ctx.strokeStyle = "rgba(22, 33, 31, 0.16)";
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      ctx.fillStyle = hue;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(x1, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(render);
  }

  resize();
  render();
  window.addEventListener("resize", resize);
}

loadMeta();
drawBioCanvas();

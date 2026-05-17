import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { answerQuestion } from "./answer.js";
import { loadKnowledgeBase } from "./retrieval.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, ".env"));

const kb = loadKnowledgeBase(path.join(root, "data", "knowledge_base.json"));
const port = Number(process.env.PORT || 3000);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"]
]);

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

async function parseJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(publicDir, requestedPath));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": mimeTypes.get(ext) || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        app: "synbio-ai-tutor",
        updated_at: kb.updated_at,
        mode: process.env.DEEPSEEK_API_KEY ? "deepseek_rag" : "local_rag_fallback",
        model: process.env.DEEPSEEK_API_KEY ? (process.env.DEEPSEEK_MODEL || "deepseek-v4-flash") : null
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/sources") {
      sendJson(res, 200, { sources: kb.sources });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/topics") {
      const topics = [...new Set(kb.documents.map((doc) => doc.topic))];
      sendJson(res, 200, { topics, documents: kb.documents.map(({ id, title, topic, level }) => ({ id, title, topic, level })) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/ask") {
      const body = await parseJson(req);
      const question = String(body.question ?? "").trim();

      if (question.length < 2) {
        sendJson(res, 400, { error: "请输入一个更具体的问题。" });
        return;
      }

      const result = await answerQuestion(kb, question);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "GET") {
      serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`SynBio AI Tutor running at http://localhost:${port}`);
  console.log(process.env.DEEPSEEK_API_KEY ? `Using DeepSeek-backed RAG with ${process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"}.` : "Using local RAG fallback. Set DEEPSEEK_API_KEY for model answers.");
});

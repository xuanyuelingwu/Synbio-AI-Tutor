import fs from "node:fs";

function loadEnv(filePath) {
  const env = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    env[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
  }

  return env;
}

const env = loadEnv(".env");
const baseUrl = (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
const model = env.DEEPSEEK_MODEL || "deepseek-v4-flash";

if (!env.DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY is missing in .env");
}

const response = await fetch(`${baseUrl}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
  },
  body: JSON.stringify({
    model,
    messages: [
      { role: "system", content: "You are a concise API verification assistant." },
      { role: "user", content: "Reply with exactly: OK" }
    ],
    max_tokens: 20,
    thinking: { type: "disabled" }
  })
});

const text = await response.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

if (!response.ok) {
  console.error(JSON.stringify({
    ok: false,
    status: response.status,
    statusText: response.statusText,
    body
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  status: response.status,
  model,
  answer: body.choices?.[0]?.message?.content ?? null
}, null, 2));

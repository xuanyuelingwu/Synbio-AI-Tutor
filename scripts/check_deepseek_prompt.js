import assert from "node:assert/strict";
import path from "node:path";
import { answerQuestion } from "../src/answer.js";
import { loadKnowledgeBase } from "../src/retrieval.js";

process.env.DEEPSEEK_API_KEY = "test-key";
process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

let captured;
global.fetch = async (url, options) => {
  captured = { url, body: JSON.parse(options.body) };
  return {
    ok: true,
    async json() {
      return { choices: [{ message: { content: "mocked model answer" } }] };
    }
  };
};

const kb = loadKnowledgeBase(path.join(process.cwd(), "data", "knowledge_base.json"));
const result = await answerQuestion(kb, "合成生物学为什么像工程？");

assert.equal(result.mode, "deepseek_rag");
assert.equal(captured.url, "https://api.deepseek.com/chat/completions");
assert.equal(captured.body.model, "deepseek-v4-flash");
assert.equal(captured.body.thinking.type, "disabled");
assert.ok(captured.body.messages[0].content.includes("FACT_ACCURACY_RULES"));
assert.ok(captured.body.messages[0].content.includes("STYLE_RULES"));
assert.ok(captured.body.messages[0].content.includes("SAFETY_BOUNDARIES"));
assert.ok(captured.body.messages[1].content.includes("检索资料"));

console.log("DeepSeek prompt check passed.");

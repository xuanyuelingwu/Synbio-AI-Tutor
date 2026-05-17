import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("public/app.js", "utf8");
const helpers = source.slice(
  source.indexOf("function escapeHtml"),
  source.indexOf("function appendMessage")
);

const formatAnswer = Function(`${helpers}; return formatAnswer;`)();
const html = formatAnswer([
  "### 关键点",
  "",
  "这是 **加粗** 和 *斜体*。",
  "- 第一条含有 \\(E = mc^2\\)",
  "- 第二条含有 $$x^2 + y^2$$"
].join("\n"));

assert.ok(html.includes("<h4>关键点</h4>"));
assert.ok(html.includes("<strong>加粗</strong>"));
assert.ok(html.includes("<em>斜体</em>"));
assert.ok(html.includes("<ul>"));
assert.ok(html.includes("\\(E = mc^2\\)"));
assert.ok(html.includes("$$x^2 + y^2$$"));
assert.ok(!html.includes("###"));
assert.ok(!html.includes("**加粗**"));

const escaped = formatAnswer("<script>alert(1)</script>");
assert.ok(escaped.includes("&lt;script&gt;"));

console.log("Frontend render check passed.");

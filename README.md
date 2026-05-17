# 合成生物学 AI 助教系统

一个面向科普问答和趣味体验的合成生物学 AI 助教原型。系统内置权威来源知识库，默认可离线用本地 RAG 模板回答；配置 `DEEPSEEK_API_KEY` 后，会把检索到的知识片段交给 DeepSeek V4 API 生成更自然的回答。

## 为什么用 RAG，而不是只微调

科学事实需要可追溯、可更新。这个项目把“知识准确性”放在可审计知识库和检索增强上，把“有趣表达风格”放在提示词与可选微调样例上。也就是说：

- RAG 负责事实、引用、更新和安全边界。
- 微调更适合训练语气、讲解节奏、类比风格和拒答方式。
- 涉及生物安全、伦理或真实实验的问题，会转向安全的概念层面。

## 权威知识源

当前知识库整理自：

- NHGRI/NIH: Synthetic Biology  
  https://www.genome.gov/about-genomics/policy-issues/synthetic-biology
- NCBI Bookshelf / National Academies: Biotechnology in the Age of Synthetic Biology  
  https://www.ncbi.nlm.nih.gov/books/NBK535871/
- NCBI Bookshelf / National Academies: Synthetic Biology: Science and Technology for the New Millennium  
  https://www.ncbi.nlm.nih.gov/books/NBK202049/
- NCBI Bookshelf / National Academies: Synthetic Biology: Applications Come of Age  
  https://www.ncbi.nlm.nih.gov/sites/books/NBK84446/
- NCBI Bookshelf / National Academies: Synthetic Biology and the Art of Biosensor Design  
  https://www.ncbi.nlm.nih.gov/books/NBK84465/
- WHO: Global Guidance Framework for the Responsible Use of the Life Sciences  
  https://www.who.int/publications-detail-redirect/9789240056107/
- NHGRI/NIH: Artificial Intelligence, Machine Learning and Genomics  
  https://www.genome.gov/about-genomics/educational-resources/fact-sheets/artificial-intelligence-machine-learning-and-genomics

## 运行

最简单的方式是双击：

```text
start_synbio_tutor.cmd
```

这个脚本不依赖 PowerShell，会自动寻找 Codex 自带的 Node.js 或系统 PATH 里的 Node.js。

如果你的系统已经安装并配置了 Node.js，也可以用：

```powershell
node src/server.js
```

如果你偏好 PowerShell，也保留了这个启动脚本：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start_server.ps1
```

打开：

```text
http://localhost:3000
```

接入 DeepSeek V4：

复制 `.env.example` 为 `.env`，填入：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=3000
```

然后启动：

```text
start_synbio_tutor.cmd
```

官方 DeepSeek API 当前使用 OpenAI 兼容的 `https://api.deepseek.com/chat/completions`。`deepseek-v4-flash` 适合日常科普问答，`deepseek-v4-pro` 更适合复杂推理和审校。旧模型名 `deepseek-chat` 和 `deepseek-reasoner` 官方标注会在 2026-07-24 后废弃。

可选参数：

```powershell
$env:DEEPSEEK_BASE_URL="https://api.deepseek.com"
$env:DEEPSEEK_THINKING="disabled"
```

本项目默认关闭 thinking 模式，减少延迟和 token 消耗；需要更强推理时可设为 `enabled`。

## 项目结构

```text
data/knowledge_base.json          权威知识库与安全策略
data/deepseek_system_prompt.md    DeepSeek V4 前置系统提示词
data/fine_tune_style_examples.jsonl  风格微调样例
public/                           前端界面
src/                              RAG、问答与安全边界
scripts/ingest_sources.js         拉取来源网页文本的采集脚本
scripts/check_deepseek_prompt.js  DeepSeek 请求体和前置提示词检查
scripts/verify_deepseek_api.js    DeepSeek API Key 与模型直连验证
scripts/verify_app_deepseek.ps1   完整应用链路验证
scripts/smoke_test.js             基础冒烟测试
scripts/start_server.ps1          Windows 启动脚本
```

## API

```http
GET /api/health
GET /api/sources
GET /api/topics
POST /api/ask
```

`POST /api/ask` 示例：

```json
{
  "question": "合成生物学和基因编辑有什么区别？"
}
```

## 后续可扩展方向

- 增加中文权威教材、综述和政策文件，经人工审校后进入知识库。
- 把 `data/raw_sources` 接入向量数据库，替换当前关键词检索。
- 为不同年龄层增加回答风格：小学生、大学通识、科研入门。
- 增加教师后台：来源审校、知识卡版本管理、风险问题记录。

## GitHub 同步注意

`.env` 已经写入 `.gitignore`，正常用 Git 同步时不会提交 API Key。可以提交 `.env.example`，不要提交 `.env`。

如果 `.env` 曾经被 Git 跟踪过，需要先从索引里移除但保留本地文件：

```bash
git rm --cached .env
```

如果要打包整个文件夹发给别人，记得删除或清空 `.env`。

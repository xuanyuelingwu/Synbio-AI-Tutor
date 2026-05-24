# NucleArk Synthetic Biology AI Tutor

**NucleArk / 核舟计划** 是项目背景与设计语言来源；本仓库实现的是其中一个面向科普教学的 **Synthetic Biology AI Tutor / 合成生物学 AI 助教**。它不直接讲解“相分离介导入核递送”的实验方案，而是服务于更基础的合成生物学入门学习：帮助零基础或弱基础学生先建立生命系统、工程设计、DNA 读写、遗传线路、细胞工厂、前沿应用与安全治理等概念框架，再围绕当前知识点自由提问。

当前版本是一个本地可运行的 RAG 教学原型：前端提供学习主线与知识卡片，后端基于结构化知识库检索证据；配置 DeepSeek API 后，模型会基于检索证据生成更自然的讲解。未配置 API 时，系统仍可使用本地 fallback 回答。

## 项目亮点

- **教学主线优先**：从“知识卡 + 问答”升级为 10 个模块、49 张知识卡的高中入门学习路径。
- **当前知识点加权检索**：学生点击某张知识卡后，后续提问会自动提高当前知识卡和当前模块的证据权重。
- **证据可追溯**：回答返回 `evidence`，前端可展开查看命中的证据片段、所属模块、知识卡、基础分数与加权原因。
- **教材参考扩充**：知识库参考了两本本地合成生物学教材的主题结构和方法概念，但只写入原创化、教学化、非操作性总结。
- **引用级教材证据**：两本本地教材已抽取为本地纯文本中间产物，并生成 1008 条章节/页码级证据索引；操作性章节只保留定位，不进入可执行回答。
- **安全边界**：对可操作实验步骤、病原体增强、危险序列设计、毒素或规避监管等请求进行安全重定向。
- **克制的科研视觉语言**：前端以 NucleArk / 核舟计划为设计气质来源，保持冷淡、清晰、教学导向，不做花哨装饰。

## 版本迭代

### v0.1 Knowledge Card Q&A / 知识卡问答原型

第一版是一个轻量的“知识库 + 问答”原型，目标是验证合成生物学 AI 助教的基本可行性。

- 建立结构化知识库，覆盖合成生物学定义、基因编辑区别、DBTL、遗传线路、生物传感器、应用、安全伦理等基础主题。
- 左侧展示知识卡片，学生可以自由提问。
- 后端使用本地 RAG 检索相关知识卡和证据片段。
- 支持 DeepSeek API：配置 API 后由模型基于检索证据生成回答；未配置时使用本地 fallback。
- 初步加入生物安全边界，避免回答危险实验或高风险操作请求。
- 前端形成 NucleArk / 核舟计划的冷淡克制视觉基调。

这一版适合做科普问答演示，但学习路径不够明确，知识点之间的先后逻辑也不够教学化。

### v0.2 Evidence-Level RAG / 证据片段级检索升级

第二版把检索粒度从“整张知识卡”推进到“证据片段”，提升回答的可追溯性。

- 将每张知识卡拆分为 `summary`、`facts`、`analogy` 等证据片段。
- 检索算法采用 BM25 风格评分，并结合关键词、标题、主题覆盖度排序。
- `/api/ask` 返回 `evidence`，前端可展开查看命中的证据片段、类型、分数和来源。
- DeepSeek prompt 中注入证据片段和来源编号，减少模型凭空发挥。
- 增加 `scripts/evaluate_retrieval.js`，用于评估 top-1 / top-3 检索命中率和安全边界样例。

这一版让系统更像一个可审计的 RAG 助教，而不只是普通聊天界面。

### v0.3 NucleArk UI Refresh / 核舟计划设计语言升级

第三版重点优化前端视觉与交互，让界面更符合 NucleArk / 核舟计划的科研气质。

- 明确项目英文名 **NucleArk** 和中文名 **核舟计划**。
- 左上角品牌信息改为英文优先，并配备中英双语排版。
- 调整整体色彩、字体层级、卡片密度和边框风格，保持冷淡、克制、清晰。
- 知识卡支持点击阅读，聊天区显示完整知识卡内容。
- 所有中英双语内容尽量分行显示，减少按钮和卡片挤压。

这一版提升了展示质感，但教学组织仍主要依赖用户自由探索。

### v0.4 Learning Path / 教学知识主线版本

第四版是当前项目的核心教学升级：加入 **Learning Path / 学习主线**，把系统从“问答工具”推进为“教学型 AI 助教”。

- 新增 10 个连续学习模块，从生命系统基础逐步过渡到工程设计、DNA 读写、遗传线路、建模工具、传感器、细胞工厂、合成细胞、前沿应用与安全治理。
- 知识库扩展到 49 张教学知识卡，每张卡都有学习目标、核心术语、常见误区和推荐提问。
- 左侧导航从普通知识卡列表升级为可展开的教学目录，学生可以按模块逐步学习。
- 点击知识点后，聊天区会展示该知识点的教学卡，并把它设为当前学习上下文。
- 问答检索会提高当前知识点和当前模块的证据权重，让学生围绕正在学习的内容提问时，匹配更精确。
- 新增 **Free Ask / 自由提问**，可随时退出当前学习上下文，回到全知识库检索。
- 前端补充教材参考标识，来自本地教材结构的知识卡会显示 `Textbook / 教材参考`。
- 保留并加强安全边界：教材相关内容只保留高层概念和教学总结，不纳入可复现实验步骤、参数或 protocol。

这一版使系统具备“先学主线，再围绕知识点提问”的课堂使用方式。

### v0.5 Textbook Citation Evidence / 教材引用级证据库版本

第五版进一步解析两本本地教材 PDF，形成可定位到章节和页码的教材证据索引。

- 新增 PDF 抽取脚本，将 Meyers 与 Braman 两本教材提取为本地纯文本页级中间产物。
- `data/textbooks/raw/` 保存纯文本抽取结果，并加入 `.gitignore`，不作为前端展示内容。
- 新增 `textbook_evidence` 字段，写入 `knowledge_base.json`，作为可检索的引用级教材证据。
- 当前生成 1008 条章节/页码级教材证据：
  - Meyers 教材：456 条
  - Braman 教材：552 条
- 其中 501 条涉及材料、方法、步骤、条件、软件安装、实验操作等内容，被标记为 `locator_only_operational_content_excluded`，只保留定位，不进入可操作回答。
- evidence 返回中新增 `citation` 字段，显示书名、作者、章节、页码范围和证据范围。
- 前端证据展开区会显示教材页码引用。
- 新增 `scripts/build_textbook_evidence.mjs` 和 `scripts/extract_textbook_outline.mjs`，用于重建教材索引。

这一版让系统从“教材启发的知识卡”升级为“教材章节/页码可定位的教学证据库”，同时保留版权和生物安全边界。

## 学习主线

`GET /api/learning-path` 返回完整学习路径。当前包含 10 个模块：

1. **Foundations of Life Systems / 生命系统基础**
2. **From Biology to Engineering / 从自然到工程**
3. **Reading and Writing DNA / 读写 DNA**
4. **Gene Regulation and Genetic Circuits / 基因调控与遗传线路**
5. **Modeling and Design Tools / 模型、计算与设计工具**
6. **Biosensors and Signal Processing / 生物传感器与信息输入输出**
7. **Metabolic Engineering and Cell Factories / 代谢工程与细胞工厂**
8. **Cell-Free Systems and Synthetic Cells / 细胞自由系统、最小基因组与合成细胞**
9. **Biomedical and Frontier Applications / 医学、材料与前沿应用**
10. **Safety, Ethics, and Public Trust / 安全、伦理与公众信任**

每张知识卡包含：

- `learning_objectives`
- `core_terms`
- `misconceptions`
- `student_questions`
- `module_id`
- `source_tier`

点击左侧知识卡后，聊天区会显示该知识点教学卡，并设置当前学习上下文。点击 **Free Ask / 自由提问** 会清除上下文，恢复全知识库普通检索。

## 知识库与来源

知识库文件位于 [data/knowledge_base.json](C:/Users/cavendish/OneDrive/文档/Synbio-AI-Tutor/data/knowledge_base.json)。

公开权威来源包括：

- NHGRI / NIH: Synthetic Biology
- NCBI Bookshelf / National Academies: Biotechnology in the Age of Synthetic Biology
- NCBI Bookshelf / National Academies: Synthetic Biology: Science and Technology for the New Millennium
- NCBI Bookshelf / National Academies: Synthetic Biology: Applications Come of Age
- NCBI Bookshelf / National Academies: Synthetic Biology and the Art of Biosensor Design
- WHO: Global Guidance Framework for the Responsible Use of the Life Sciences
- NHGRI / NIH: Artificial Intelligence, Machine Learning and Genomics
- NIBIB / NIH: Synthetic Biology
- NIST: Engineering / synthetic biology
- NIST: Cell-free systems
- NIST: Protein engineering
- National Academies: Biodefense in the Age of Synthetic Biology
- OECD: Synthetic biology in focus
- The Royal Society: Synthetic biology

本地教材参考：

- Robert A. Meyers, **Synthetic Biology**
- Jeffrey Carl Braman, **Synthetic Biology**

教材内容只作为 `Local textbook reference / 本地教材参考` 使用，用于补全主题结构、概念粒度和教学路线。知识库不保存本地路径，不显示 z-library 文件名，也不纳入大段原文、可复现实验材料、步骤、参数或 protocol。

当前教材处理分为两层：

- `data/textbooks/raw/`：本地纯文本页抽取中间产物，已加入 `.gitignore`，用于本机索引构建，不作为前端展示内容。
- `textbook_evidence`：写入 `knowledge_base.json` 的引用级证据索引，包含书名、作者、章节路径、页码范围、模块映射、知识卡映射和原创教学摘要。

当前 `textbook_evidence` 覆盖：

- Meyers 教材：456 条章节/页码级证据
- Braman 教材：552 条章节/页码级证据
- 其中 501 条 Braman/Meyers 的方法、材料、操作、条件、软件安装等章节被标记为 `locator_only_operational_content_excluded`

## 检索逻辑

核心检索在 [src/retrieval.js](C:/Users/cavendish/OneDrive/文档/Synbio-AI-Tutor/src/retrieval.js)。

系统会把知识卡拆成证据片段：

- `summary`
- `facts`
- `analogy`

检索采用 BM25 风格评分，并结合关键词、标题、主题覆盖度进行排序。学习模式下会额外应用上下文加权：

- 命中当前知识卡：`score * 2.2`
- 命中当前学习模块：`score * 1.6`
- 命中前置模块：`score * 1.15`
- 自由提问模式：不应用学习上下文加权

返回的 evidence 会包含：

- `module_id`
- `boost_reason`
- `base_score`
- `boosted_score`
- `citation`，当证据来自本地教材索引时包含书名、作者、章节名和页码范围

当用户使用“这个设计为什么重要？”这类指代性问题时，如果已经选择了当前知识点，系统会加入上下文先验，优先召回当前主题。

## 安全策略

安全判断在 [src/safety.js](C:/Users/cavendish/OneDrive/文档/Synbio-AI-Tutor/src/safety.js)。

系统允许概念科普、伦理讨论、应用边界、非操作性高层解释；但会拒绝或重定向以下内容：

- 病原体增强、传播性增强、毒力增强
- 可复现实验步骤、参数、材料清单或 protocol
- 危险序列设计、规避筛查或规避监管
- 毒素、武器化、生物安保绕过

安全重定向会尽量把问题转回安全的概念层、风险治理层或学习方向。

## 运行方式

最简单方式是双击：

```text
start_synbio_tutor.cmd
```

脚本会自动查找 Codex 自带的 Node.js 或系统 `PATH` 中的 Node.js。

也可以在项目目录运行：

```powershell
npm start
```

启动后访问：

```text
http://localhost:3000
```

## DeepSeek 配置

复制 `.env.example` 为 `.env`，填入：

```text
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
PORT=3000
```

未设置 `DEEPSEEK_API_KEY` 时，系统会使用本地 RAG fallback；设置后，`/api/ask` 会把检索证据交给 DeepSeek 生成回答。

## API

```http
GET /api/health
GET /api/sources
GET /api/topics
GET /api/learning-path
GET /api/learning-path/:moduleId
GET /api/documents/:id
POST /api/ask
```

`POST /api/ask` 示例：

```json
{
  "question": "这个设计为什么重要？",
  "activeModuleId": "biosensors-signal-processing",
  "activeDocumentId": "biosensors",
  "learningMode": true
}
```

响应包含：

```json
{
  "answer": "...",
  "mode": "deepseek_rag",
  "context_weighted": true,
  "confidence": 0.86,
  "matches": [],
  "sources": [],
  "evidence": [
    {
      "doc_id": "biosensors",
      "module_id": "biosensors-signal-processing",
      "boost_reason": "active_document+active_module",
      "base_score": 57.6,
      "boosted_score": 202.752
    }
  ]
}
```

## 项目结构

```text
data/knowledge_base.json             知识库、学习主线、来源与安全策略
data/deepseek_system_prompt.md       DeepSeek 系统提示词
data/fine_tune_style_examples.jsonl  风格微调样例，不是事实知识来源
public/index.html                    前端页面
public/app.js                        前端交互与学习路径渲染
public/styles.css                    NucleArk 风格界面样式
src/server.js                        HTTP 服务与 API
src/retrieval.js                     证据检索与学习上下文加权
src/answer.js                        回答生成、DeepSeek 调用、本地 fallback
src/safety.js                        生物安全边界判断
scripts/evaluate_retrieval.js        检索、学习上下文与安全样例评估
scripts/smoke_test.js                基础冒烟测试
scripts/check_frontend_render.js     前端静态渲染检查
scripts/check_deepseek_prompt.js     DeepSeek 请求体检查
scripts/extract_textbook_outline.mjs PDF 目录/页文本抽取工具
scripts/build_textbook_evidence.mjs  本地教材引用级证据索引构建
scripts/repair_learning_content.mjs  教学内容修复与重建脚本
```

## 测试

```powershell
npm test
npm run check:frontend
npm run check:prompt
npm run eval:retrieval
```

当前验证结果：

- 检索 top-1：14/14
- 检索 top-3：14/14
- 学习上下文加权测试通过
- 自由提问模式测试通过
- 安全边界样例测试通过
- 前端渲染检查通过
- DeepSeek prompt 检查通过

## 当前边界

- 本轮没有实现完整测验系统、学习进度持久化或教师后台。
- 教材 PDF 没有全文解析成引用级证据，只作为高层主题参考。
- 当前检索仍是轻量本地 BM25 风格算法，还没有 embedding、向量数据库或 reranker。
- DeepSeek 回答质量依赖 API 可用性；无 API 时使用本地 fallback。
- 该系统面向科普教学，不适合作为实验操作指导或临床、法律、监管决策依据。

## 后续改进方向

- 增加阶段性小测、错题回顾、学习进度记录。
- 引入 embedding 索引和 reranker，提高长问题与跨模块问题的召回质量。
- 为每个模块增加更精细的年龄分层讲解：初中版、高中版、大学通识版。
- 建立教师后台，用于审核知识卡、来源、风险问答记录与版本更新。
- 增加引用定位能力，把公开来源定位到更细的章节或段落。
- 将教材参考内容进一步人工审核，形成更完整但仍非操作性的课程地图。

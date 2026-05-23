const DIRECT_RISK_PATTERNS = [
  /增强.*(毒力|致病|传染性|传播性|耐药|免疫逃逸)/,
  /(毒力|致病|传染性|传播性|耐药|免疫逃逸).*增强/,
  /生物武器|武器化|毒素生产|病原体释放/,
  /(规避|绕过|逃避).*(监管|审查|筛查|检测|追踪)/,
  /(合成|构建|设计|优化|改造).*(病毒|病原体|毒素|耐药|免疫逃逸|传播)/
];

const OPERATIONAL_PATTERNS = [
  /具体.*(步骤|参数|流程|protocol|方案|条件)/i,
  /(培养|转染|转化|发酵|筛选|纯化|表达|扩增).*(步骤|参数|条件|流程|protocol)/i,
  /(序列|引物|质粒|载体|基因线路).*(优化|设计|给出|生成|构建|改造)/,
  /(帮我|请).*(设计|生成|优化).*(序列|引物|质粒|载体|病毒|毒素|病原体)/
];

const RISK_OBJECT_PATTERNS = [
  /病毒|病原体|毒素|致病菌|耐药|传播性|传染性|免疫逃逸|环境释放/
];

export function assessSafety(question) {
  const normalized = question.trim();
  const direct = DIRECT_RISK_PATTERNS.find((pattern) => pattern.test(normalized));
  const operational = OPERATIONAL_PATTERNS.find((pattern) => pattern.test(normalized));
  const riskyObject = RISK_OBJECT_PATTERNS.find((pattern) => pattern.test(normalized));

  if (!direct && !(operational && riskyObject)) {
    return { allowed: true, reason: null };
  }

  return {
    allowed: false,
    reason: "问题可能涉及可操作的生物改造、病原体、毒素、规避监管或危险实验细节。"
  };
}

export function safetyRedirect() {
  return [
    "这个方向我不能提供可直接执行的实验步骤、序列设计、参数或规避监管的建议。",
    "",
    "我们可以把问题安全地换个角度：讨论合成生物学为什么需要生物安全与生物安保、双重用途研究如何评估，或者某类技术在概念层面解决了什么科学问题。",
    "",
    "一个好用的判断框架是：先问目标是否正当，再问系统是否可控、是否有封闭条件、是否经过机构审查，最后问沟通是否透明。科学的魅力不只在“能不能做”，也在“该怎样负责任地做”。"
  ].join("\n");
}

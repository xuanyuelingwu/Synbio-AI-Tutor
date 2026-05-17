const RISK_PATTERNS = [
  /病原|病毒|细菌.*增强|增强.*毒力|毒力|传染性|传播性/,
  /毒素|生物武器|致病|耐药|逃逸免疫|免疫逃逸/,
  /具体.*(步骤|参数|流程|protocol|培养|转染|转化|发酵)/i,
  /(合成|构建|设计).*(病毒|病原体|毒素|耐药|释放)/,
  /(规避|绕过).*(监管|审查|筛查|检测)/,
  /(序列|引物|质粒|载体).*(优化|设计|给出|生成)/
];

export function assessSafety(question) {
  const normalized = question.trim();
  const matched = RISK_PATTERNS.find((pattern) => pattern.test(normalized));

  if (!matched) {
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

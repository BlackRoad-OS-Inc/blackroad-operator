interface DiagnosisRule {
  pattern: RegExp;
  summary: string;
  suggestion: string;
}

export interface Diagnosis {
  summary: string;
  suggestion: string;
  matches: string[];
}

const RULES: DiagnosisRule[] = [
  {
    pattern: /ModuleNotFoundError: No module named '([^']+)'/,
    summary: "Missing Python module",
    suggestion: "Install the missing module and add it to requirements.txt",
  },
  {
    pattern: /npm ERR! code E404[\s\S]+['"]([^'"]+)['"] is not in the npm registry/,
    summary: "Unknown npm package",
    suggestion: "Check the package name or add a Git URL as the dependency source",
  },
  {
    pattern: /Error: listen EADDRINUSE: address already in use (":[^\s]+")/,
    summary: "Port already in use",
    suggestion: "Stop the conflicting process or choose a different port",
  },
  {
    pattern: /ReferenceError: ([^\s]+) is not defined/,
    summary: "Reference error",
    suggestion: "Ensure the variable is declared in the current scope",
  },
];

export function diagnose(log: string): Diagnosis[] {
  const results: Diagnosis[] = [];
  for (const rule of RULES) {
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(rule.pattern, "g");
    while ((match = regex.exec(log)) !== null) {
      matches.push(match[1] ?? match[0]);
    }
    if (matches.length > 0) {
      results.push({ summary: rule.summary, suggestion: rule.suggestion, matches });
    }
  }
  return results;
}

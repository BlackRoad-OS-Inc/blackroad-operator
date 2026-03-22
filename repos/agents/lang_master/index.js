const fs = require('fs');
const path = require('path');

const name = path.basename(__dirname);
const base = path.join(__dirname, '..', '..', 'prism');
const logDir = path.join(base, 'logs');
const contrDir = path.join(base, 'contradictions');

const LANGUAGE_PROFILES = [
  {
    key: 'python',
    aliases: ['py'],
    label: 'Python',
    template: (summary) => [
      `"""${summary}"""`,
      '',
      'from typing import Any',
      '',
      'def main() -> None:',
      '    """Entry point for the routine."""',
      '    raise NotImplementedError("TODO: implement main routine")',
      '',
      'if __name__ == "__main__":',
      '    main()',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /print\(/.test(snippet),
        suggestion: 'Prefer the logging module over bare print statements in production code.',
      },
      {
        test: (snippet) => /except\s*:\s*pass/.test(snippet),
        suggestion: 'Catch specific exceptions or log the failure instead of silently passing.',
      },
    ],
  },
  {
    key: 'javascript',
    aliases: ['js', 'node', 'nodejs'],
    label: 'JavaScript',
    template: (summary) => [
      `'use strict';`,
      '',
      `/** ${summary}. */`,
      'function main() {',
      '  throw new Error("TODO: implement main routine");',
      '}',
      '',
      'if (require.main === module) {',
      '  main();',
      '}',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /\bvar\s+/.test(snippet),
        suggestion: 'Use const or let instead of var for better scoping.',
      },
      {
        test: (snippet) => /console\.log/.test(snippet),
        suggestion: 'Remove debug logging or guard it behind environment checks.',
      },
    ],
  },
  {
    key: 'typescript',
    aliases: ['ts'],
    label: 'TypeScript',
    template: (summary) => [
      `/** ${summary}. */`,
      'export function main(): void {',
      '  throw new Error("TODO: implement main routine");',
      '}',
      '',
      'if (require.main === module) {',
      '  main();',
      '}',
    ].join('\n'),
    review: [
      {
        test: (snippet) => !/:\s*[A-Za-z_][\w<>?]*/.test(snippet),
        suggestion: 'Add explicit type annotations for public functions.',
      },
    ],
  },
  {
    key: 'go',
    aliases: ['golang'],
    label: 'Go',
    template: (summary) => [
      'package main',
      '',
      'import "fmt"',
      '',
      `// ${summary}.`,
      'func main() {',
      '    panic("TODO: implement main routine")',
      '}',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /fmt\.Println/.test(snippet),
        suggestion: 'Consider using a structured logger instead of fmt.Println for production services.',
      },
    ],
  },
  {
    key: 'rust',
    aliases: [],
    label: 'Rust',
    template: (summary) => [
      'fn main() -> anyhow::Result<()> {',
      `    // ${summary}.`,
      '    anyhow::bail!("TODO: implement main routine");',
      '}',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /unwrap\(\)/.test(snippet),
        suggestion: 'Handle Result values with ? or match instead of unwrap() in production.',
      },
    ],
  },
  {
    key: 'java',
    aliases: [],
    label: 'Java',
    template: (summary) => [
      'public final class Main {',
      `    // ${summary}.`,
      '    public static void main(String[] args) {',
      '        throw new UnsupportedOperationException("TODO: implement main routine");',
      '    }',
      '}',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /System\.out\.println/.test(snippet),
        suggestion: 'Route logs through a logging framework instead of System.out.',
      },
    ],
  },
  {
    key: 'csharp',
    aliases: ['c#', 'dotnet'],
    label: 'C#',
    template: (summary) => [
      'using System;',
      '',
      'public static class Program',
      '{',
      `    // ${summary}.`,
      '    public static void Main(string[] args)',
      '    {',
      '        throw new NotImplementedException("TODO: implement main routine");',
      '    }',
      '}',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /Console\.Write(Line)?/.test(snippet),
        suggestion: 'Prefer ILogger abstractions over Console.WriteLine for services.',
      },
    ],
  },
  {
    key: 'cpp',
    aliases: ['c++'],
    label: 'C++',
    template: (summary) => [
      '#include <stdexcept>',
      '',
      `// ${summary}.`,
      'int main() {',
      '    throw std::logic_error("TODO: implement main routine");',
      '}',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /using namespace std;/.test(snippet),
        suggestion: 'Avoid using namespace std in headers or global scope to prevent symbol collisions.',
      },
    ],
  },
  {
    key: 'ruby',
    aliases: [],
    label: 'Ruby',
    template: (summary) => [
      `# ${summary}.`,
      '',
      'def main',
      '  raise NotImplementedError, "TODO: implement main routine"',
      'end',
      '',
      'main if $PROGRAM_NAME == __FILE__',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /puts\s+/.test(snippet),
        suggestion: 'Use a logger (e.g., Logger class) instead of puts for structured output.',
      },
    ],
  },
  {
    key: 'php',
    aliases: [],
    label: 'PHP',
    template: (summary) => [
      '<?php',
      `// ${summary}.`,
      '',
      'function main(): void {',
      '    throw new RuntimeException("TODO: implement main routine");',
      '}',
      '',
      'main();',
    ].join('\n'),
    review: [
      {
        test: (snippet) => /echo\s+/.test(snippet),
        suggestion: 'Prefer dependency-injected loggers over echo statements for observability.',
      },
    ],
  },
  {
    key: 'swift',
    aliases: [],
    label: 'Swift',
    template: (summary) => [
      `// ${summary}.`,
      '',
      'import Foundation',
      '',
      'func main() throws {',
      '    throw NSError(domain: "TODO", code: 1, userInfo: nil)',
      '}',
      '',
      'try main()',
    ].join('\n'),
    review: [],
  },
  {
    key: 'kotlin',
    aliases: [],
    label: 'Kotlin',
    template: (summary) => [
      `// ${summary}.`,
      '',
      'fun main() {',
      '    TODO("Implement main routine")',
      '}',
    ].join('\n'),
    review: [],
  },
  {
    key: 'scala',
    aliases: [],
    label: 'Scala',
    template: (summary) => [
      `// ${summary}.`,
      '',
      'object Main extends App {',
      '  throw new NotImplementedError("Implement main routine")',
      '}',
    ].join('\n'),
    review: [],
  },
  {
    key: 'haskell',
    aliases: [],
    label: 'Haskell',
    template: (summary) => [
      `-- ${summary}.`,
      '',
      'main :: IO ()',
      'main = error "TODO: implement main routine"',
    ].join('\n'),
    review: [],
  },
  {
    key: 'elixir',
    aliases: [],
    label: 'Elixir',
    template: (summary) => [
      `# ${summary}.`,
      '',
      'defmodule Main do',
      '  def run do',
      '    raise "TODO: implement main routine"',
      '  end',
      'end',
      '',
      'Main.run()',
    ].join('\n'),
    review: [],
  },
  {
    key: 'bash',
    aliases: ['shell', 'sh'],
    label: 'Bash',
    template: (summary) => [
      '#!/usr/bin/env bash',
      `# ${summary}.`,
      '',
      'set -euo pipefail',
      '',
      'main() {',
      '  echo "TODO: implement main routine" >&2',
      '  return 1',
      '}',
      '',
      'main "$@"',
    ].join('\n'),
    review: [
      {
        test: (snippet) => !/set -e/.test(snippet),
        suggestion: 'Enable strict mode (set -euo pipefail) for safer shell scripts.',
      },
    ],
  },
  {
    key: 'r',
    aliases: [],
    label: 'R',
    template: (summary) => [
      `# ${summary}.`,
      '',
      'main <- function() {',
      '  stop("TODO: implement main routine")',
      '}',
      '',
      'main()',
    ].join('\n'),
    review: [],
  },
  {
    key: 'dart',
    aliases: [],
    label: 'Dart',
    template: (summary) => [
      `// ${summary}.`,
      '',
      'void main(List<String> args) {',
      '  throw UnimplementedError("TODO: implement main routine");',
      '}',
    ].join('\n'),
    review: [],
  },
  {
    key: 'sql',
    aliases: ['postgres', 'mysql'],
    label: 'SQL',
    template: (summary) => [
      `-- ${summary}.`,
      'BEGIN;',
      '',
      '-- TODO: add statements',
      '',
      'COMMIT;',
    ].join('\n'),
    review: [
      {
        test: (snippet) => !/transaction|begin/i.test(snippet),
        suggestion: 'Wrap data mutations in explicit transactions to ensure consistency.',
      },
    ],
  },
  {
    key: 'matlab',
    aliases: ['octave'],
    label: 'MATLAB',
    template: (summary) => [
      `% ${summary}.`,
      '',
      'function main()',
      '    error("TODO: implement main routine");',
      'end',
      '',
      'main;',
    ].join('\n'),
    review: [],
  },
  {
    key: 'perl',
    aliases: [],
    label: 'Perl',
    template: (summary) => [
      '#!/usr/bin/env perl',
      'use strict;',
      'use warnings;',
      '',
      `# ${summary}.`,
      '',
      'sub main {',
      '    die "TODO: implement main routine";',
      '}',
      '',
      'main();',
    ].join('\n'),
    review: [],
  },
  {
    key: 'lua',
    aliases: [],
    label: 'Lua',
    template: (summary) => [
      `-- ${summary}.`,
      '',
      'local function main()',
      '  error("TODO: implement main routine")',
      'end',
      '',
      'main()',
    ].join('\n'),
    review: [],
  },
];

const LANGUAGE_LOOKUP = new Map();
for (const profile of LANGUAGE_PROFILES) {
  LANGUAGE_LOOKUP.set(profile.key, profile);
  for (const alias of profile.aliases) {
    LANGUAGE_LOOKUP.set(alias, profile);
  }
}

function ensure() {
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(contrDir, { recursive: true });
}

function log(msg) {
  ensure();
  fs.appendFileSync(path.join(logDir, `${name}.log`), msg + '\n');
}

function contradiction(detail) {
  ensure();
  fs.writeFileSync(path.join(contrDir, `${name}.json`), JSON.stringify({ detail }));
}

function normalizeSentence(sentence) {
  if (!sentence || !sentence.trim()) {
    return '';
  }
  const trimmed = sentence.trim();
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const punctuation = /[.!?]$/.test(capitalized) ? '' : '.';
  return capitalized.replace(/\s+/g, ' ') + punctuation;
}

function grammarCheck(text) {
  if (!text || !text.trim()) {
    return { corrected: '', suggestions: ['Provide text to proofread.'] };
  }
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(normalizeSentence)
    .filter(Boolean);
  const corrected = sentences.join(' ');
  const suggestions = [];
  if (/[A-Z]{2,}/.test(text)) {
    suggestions.push('Avoid using all caps unless necessary.');
  }
  if (/\s{2,}/.test(text)) {
    suggestions.push('Collapse repeated spaces.');
  }
  return { corrected, suggestions };
}

function enhanceEnglish(text) {
  if (!text || !text.trim()) {
    return 'Please provide content to enhance.';
  }
  const cleaned = normalizeSentence(text);
  return `${cleaned} This version emphasises clarity and a confident tone.`;
}

function summarizeSpec(spec) {
  if (!spec) {
    return 'Implement the requested functionality';
  }
  const trimmed = spec.toString().trim();
  if (!trimmed) {
    return 'Implement the requested functionality';
  }
  return trimmed.replace(/\s+/g, ' ');
}

function resolveLanguage(language) {
  if (!language) {
    return null;
  }
  const key = language.toString().trim().toLowerCase();
  return LANGUAGE_LOOKUP.get(key) || null;
}

function supportedLanguages() {
  return LANGUAGE_PROFILES.map((profile) => ({
    key: profile.key,
    label: profile.label,
    aliases: profile.aliases,
  }));
}

function generateStub(spec, language) {
  const summary = summarizeSpec(spec);
  if (language) {
    const profile = resolveLanguage(language);
    if (profile) {
      return profile.template(summary);
    }
  }
  return [
    `// ${summary}.`,
    '',
    'function main() {',
    '  throw new Error("TODO: implement main routine");',
    '}',
    '',
    'main();',
  ].join('\n');
}

function buildCodingPlan(goal) {
  const header = goal && goal.trim() ? goal.trim() : 'Implement the requested feature';
  return [
    `Goal: ${header}`,
    '1. Clarify inputs, outputs, and constraints.',
    '2. Design a step-by-step algorithm with test coverage.',
    '3. Implement iteratively, running linting and unit tests.',
    '4. Document design trade-offs and follow-up actions.'
  ].join('\n');
}

function reviewCode(snippet, language = 'unknown') {
  const suggestions = [];
  if (!snippet || !snippet.trim()) {
    return { summary: 'No code supplied for review.', suggestions };
  }
  if (!snippet.includes('test')) {
    suggestions.push('Consider adding automated tests to cover critical paths.');
  }
  if (/TODO/.test(snippet)) {
    suggestions.push('Address remaining TODO items before shipping.');
  }
  const profile = resolveLanguage(language);
  if (profile && profile.review.length > 0) {
    for (const rule of profile.review) {
      if (rule.test(snippet)) {
        suggestions.push(rule.suggestion);
      }
    }
  } else if (/console\.log|print\(/.test(snippet)) {
    suggestions.push('Remove debug logging before final commit.');
  }
  return {
    summary: `Preliminary review for ${language} code complete.`,
    suggestions
  };
}

module.exports = {
  name,
  handle(msg) {
    switch (msg.type) {
      case 'ping':
        log('ping');
        return `pong: ${name}`;
      case 'analyze':
        log(`analyze:${msg.path}`);
        return 'analysis complete';
      case 'codegen':
        log(`codegen:${msg.spec || 'unspecified'}:${msg.language || 'unspecified'}`);
        return generateStub(msg.spec, msg.language);
      case 'coding_plan':
        log(`coding_plan:${msg.goal || 'unspecified'}`);
        return buildCodingPlan(msg.goal);
      case 'code_review':
        log(`code_review:${msg.language || 'unknown'}`);
        return reviewCode(msg.snippet, msg.language);
      case 'languages':
        log('languages');
        return supportedLanguages();
      case 'grammar_check':
        log('grammar_check');
        return grammarCheck(msg.text);
      case 'english_refine':
        log('english_refine');
        return enhanceEnglish(msg.text);
      case 'contradiction':
        contradiction(msg.detail || 'unknown');
        return 'contradiction logged';
      default:
        return 'unknown';
    }
  },
  _internal: {
    supportedLanguages,
    generateStub,
    resolveLanguage,
  }
};

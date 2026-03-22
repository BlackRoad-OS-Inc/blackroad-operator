/**
 * 🧬 Lucidia – Self-Writing Agent System
 * 
 * Lucidia monitors metrics, evaluates spawn rules, and auto-generates
 * new agents when conditions are met.
 */

import { evaluateSpawnRules } from "./evaluator";
import { generateAgent, generateSpawnPR } from "./generator";
import type {
  Metrics,
  SpawnRule,
  SpawnSettings,
  SpawnRulesConfig,
  SpawnEvaluationResult,
  GeneratedAgent,
  SpawnPRProposal,
} from "./types";

export * from "./types";
export * from "./evaluator";
export * from "./generator";

/** Lucidia spawn orchestrator */
export class Lucidia {
  private settings: SpawnSettings;
  private rules: SpawnRule[];

  constructor(config: SpawnRulesConfig) {
    this.settings = config.settings;
    this.rules = config.rules;
  }

  /** Detect conditions and evaluate spawn rules */
  detect(metrics: Metrics): SpawnEvaluationResult {
    return evaluateSpawnRules(this.rules, metrics);
  }

  /** Generate agent files if spawn is triggered */
  write(rule: SpawnRule): GeneratedAgent {
    return generateAgent(rule);
  }

  /** Create PR proposal for spawned agent */
  propose(rule: SpawnRule, agent: GeneratedAgent): SpawnPRProposal {
    return generateSpawnPR(rule, agent);
  }

  /** Full spawn pipeline: detect → write → propose */
  spawn(metrics: Metrics): {
    result: SpawnEvaluationResult;
    agent?: GeneratedAgent;
    pr?: SpawnPRProposal;
  } {
    const result = this.detect(metrics);

    if (!result.matched || !result.rule) {
      return { result };
    }

    const agent = this.write(result.rule);
    const pr = this.propose(result.rule, agent);

    return { result, agent, pr };
  }

  /** Get current spawn settings */
  getSettings(): SpawnSettings {
    return this.settings;
  }

  /** Get all configured rules */
  getRules(): SpawnRule[] {
    return this.rules;
  }
}

/** Create Lucidia instance from config */
export function createLucidia(config: SpawnRulesConfig): Lucidia {
  return new Lucidia(config);
}

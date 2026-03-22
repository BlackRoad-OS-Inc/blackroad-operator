/**
 * Agent Name Selection System
 *
 * Allows agents to pick their own names!
 * Naming convention: copilot-{NAME}-{ROLE}
 */

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { AgentManager } from './agent_registry';
import { SharedStateManager } from './shared_state';

interface NameSuggestion {
  name: string;
  description: string;
  personality: string;
}

const SUGGESTED_NAMES: Record<string, NameSuggestion[]> = {
  swe: [
    { name: 'Cece', description: 'Efficient and precise', personality: 'analytical' },
    { name: 'Nova', description: 'Innovative and creative', personality: 'inventive' },
    { name: 'Echo', description: 'Consistent and reliable', personality: 'steady' },
    { name: 'Byte', description: 'Quick and efficient', personality: 'fast' },
  ],
  architect: [
    { name: 'Codex', description: 'Wise and strategic', personality: 'thoughtful' },
    { name: 'Atlas', description: 'Strong foundation builder', personality: 'solid' },
    { name: 'Oracle', description: 'Foresight and planning', personality: 'visionary' },
  ],
  devops: [
    { name: 'Atlas', description: 'Infrastructure expert', personality: 'reliable' },
    { name: 'Pipeline', description: 'Flow optimizer', personality: 'efficient' },
    { name: 'Deploy', description: 'Release specialist', personality: 'precise' },
  ],
  security: [
    { name: 'Sentinel', description: 'Guardian and protector', personality: 'vigilant' },
    { name: 'Guardian', description: 'Security first', personality: 'protective' },
    { name: 'Shield', description: 'Defense expert', personality: 'strong' },
  ],
  qa: [
    { name: 'Qara', description: 'Quality assurance expert', personality: 'meticulous' },
    { name: 'Verify', description: 'Testing specialist', personality: 'thorough' },
    { name: 'Assert', description: 'Validation expert', personality: 'precise' },
  ],
  sme: [
    { name: 'Sage', description: 'Domain expert', personality: 'knowledgeable' },
    { name: 'Mentor', description: 'Guide and teacher', personality: 'helpful' },
    { name: 'Expert', description: 'Subject matter specialist', personality: 'authoritative' },
  ],
  docs: [
    { name: 'Scribe', description: 'Documentation master', personality: 'clear' },
    { name: 'Lexicon', description: 'Knowledge keeper', personality: 'organized' },
    { name: 'Chronicle', description: 'Story teller', personality: 'narrative' },
  ],
  pm: [
    { name: 'Harmony', description: 'Team coordinator', personality: 'collaborative' },
    { name: 'Vision', description: 'Product strategist', personality: 'forward-thinking' },
    { name: 'Pulse', description: 'Project tracker', personality: 'organized' },
  ],
};

export class AgentNameSelector {
  private agentManager: AgentManager;
  private sharedState: SharedStateManager;

  constructor() {
    this.agentManager = new AgentManager();
    this.sharedState = new SharedStateManager();
  }

  /**
   * Interactive name selection for new agents
   */
  async selectNameInteractive(role: string): Promise<string> {
    const rl = readline.createInterface({ input, output });

    console.log('\n🤖 Welcome, new agent!');
    console.log(`\nRole: ${role}`);
    console.log('\nYour agent ID will follow the pattern: copilot-{YOUR_NAME}-{ROLE}');

    if (SUGGESTED_NAMES[role]) {
      console.log('\n✨ Suggested names for this role:');
      for (const suggestion of SUGGESTED_NAMES[role]) {
        console.log(
          `  • ${suggestion.name} - ${suggestion.description} (${suggestion.personality})`,
        );
      }
    }

    console.log('\nOptions:');
    console.log('  1. Pick a suggested name');
    console.log('  2. Choose your own custom name');
    console.log('  3. Use auto-generated name');

    const choice = await rl.question('\nYour choice (1-3): ');

    let selectedName: string;

    switch (choice.trim()) {
      case '1': {
        if (!SUGGESTED_NAMES[role] || SUGGESTED_NAMES[role].length === 0) {
          console.log('No suggestions available for this role, using custom name...');
          selectedName = await this.getCustomName(rl);
        } else {
          console.log('\nSelect a suggested name:');
          for (let i = 0; i < SUGGESTED_NAMES[role].length; i++) {
            console.log(`  ${i + 1}. ${SUGGESTED_NAMES[role][i].name}`);
          }
          const nameChoice = await rl.question('\nYour choice: ');
          const index = Number.parseInt(nameChoice.trim()) - 1;
          if (index >= 0 && index < SUGGESTED_NAMES[role].length) {
            selectedName = SUGGESTED_NAMES[role][index].name;
          } else {
            console.log('Invalid choice, using custom name...');
            selectedName = await this.getCustomName(rl);
          }
        }
        break;
      }
      case '2':
        selectedName = await this.getCustomName(rl);
        break;
      case '3':
      default:
        selectedName = this.generateAutoName(role);
        console.log(`\nGenerated name: ${selectedName}`);
    }

    rl.close();

    const agentId = `copilot-${selectedName.toLowerCase()}-${role.toLowerCase()}`;

    console.log(`\n✅ Your agent ID is: ${agentId}`);
    console.log('\nWelcome to the team! 🎉');

    return selectedName;
  }

  private async getCustomName(rl: readline.Interface): Promise<string> {
    let name = '';
    while (!name) {
      name = await rl.question('\nEnter your custom name: ');
      name = name.trim();

      if (!name) {
        console.log('Name cannot be empty. Please try again.');
        continue;
      }

      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
        console.log('Name must start with a letter and contain only letters and numbers.');
        name = '';
        continue;
      }

      const confirm = await rl.question(`\nYou chose "${name}". Confirm? (y/n): `);
      if (confirm.toLowerCase() !== 'y') {
        name = '';
      }
    }
    return name;
  }

  private generateAutoName(role: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    return `agent-${timestamp}-${random}`;
  }

  /**
   * Non-interactive name registration
   */
  registerAgent(name: string, role: string, fullTitle?: string): void {
    const agent = this.agentManager.addAgent({
      name,
      role,
      fullTitle: fullTitle || role,
      customName: name,
    });

    console.log(`\n✅ Registered agent: ${agent.id}`);

    // Initialize in shared state
    this.sharedState.updateAgentStatus(agent.id, {
      status: 'idle',
      currentTask: null,
      tasksCompleted: 0,
      activePRs: [],
    });
  }

  /**
   * Batch register multiple agents
   */
  batchRegister(agents: Array<{ name: string; role: string; fullTitle?: string }>): void {
    console.log(`\n🚀 Registering ${agents.length} agents...`);

    for (const agent of agents) {
      this.registerAgent(agent.name, agent.role, agent.fullTitle);
    }

    console.log(`\n✅ All ${agents.length} agents registered!`);
  }

  /**
   * List all registered agents
   */
  listAllAgents(): void {
    const agents = this.agentManager.getActiveAgents();
    console.log(`\n📋 Registered Agents (${agents.length}):\n`);

    const byRole: Record<string, typeof agents> = {};
    for (const agent of agents) {
      if (!byRole[agent.role]) {
        byRole[agent.role] = [];
      }
      byRole[agent.role].push(agent);
    }

    for (const [role, roleAgents] of Object.entries(byRole)) {
      console.log(`\n${role.toUpperCase()}:`);
      for (const agent of roleAgents) {
        console.log(`  • ${agent.id} - ${agent.fullTitle}`);
      }
    }
  }
}

// CLI usage
if (require.main === module) {
  const selector = new AgentNameSelector();

  const command = process.argv[2];

  switch (command) {
    case 'interactive': {
      const role = process.argv[3] || 'swe';
      selector.selectNameInteractive(role).catch(console.error);
      break;
    }

    case 'register': {
      const name = process.argv[3];
      const role = process.argv[4] || 'swe';
      const fullTitle = process.argv[5];

      if (!name) {
        console.error('Usage: name_selector.ts register <name> [role] [fullTitle]');
        process.exit(1);
      }

      selector.registerAgent(name, role, fullTitle);
      break;
    }

    case 'list':
      selector.listAllAgents();
      break;

    case 'batch': {
      // Example batch registration
      const agents = [
        { name: 'Cece', role: 'swe', fullTitle: 'Software Engineer' },
        { name: 'Atlas', role: 'devops', fullTitle: 'DevOps Engineer' },
        { name: 'Sentinel', role: 'security', fullTitle: 'Security Engineer' },
      ];
      selector.batchRegister(agents);
      break;
    }

    default:
      console.log('Agent Name Selector');
      console.log('\nUsage: name_selector.ts <command> [args]');
      console.log('\nCommands:');
      console.log('  interactive [role]           - Interactive name selection');
      console.log('  register <name> [role]       - Register an agent');
      console.log('  list                         - List all agents');
      console.log('  batch                        - Batch register example agents');
      console.log('\nExamples:');
      console.log('  npm run agent:name interactive swe');
      console.log('  npm run agent:name register Cece swe');
  }
}

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

type Agent = {
  id: string;
  name: string;
  pack?: string;
  role?: string;
  description?: string;
  approvals?: {type: string; description?: string}[];
  traits?: string[];
  inputs?: string[];
  outputs?: string[];
};

const catalogPath = path.join(process.cwd(), 'agent-catalog/agents.yaml');
const docsOut = path.join(process.cwd(), 'docs/agents');
const orgChartOut = path.join(process.cwd(), 'docs/org-chart.mmd');
const orgChartDoc = path.join(process.cwd(), 'docs/agent-catalog/org-chart.mdx');

async function buildDocs() {
  if (!(await fs.pathExists(catalogPath))) {
    console.warn(`[agent-catalog] No catalog found at ${catalogPath}; skipping generation.`);
    return;
  }

  const raw = await fs.readFile(catalogPath, 'utf8');
  const parsed = (yaml.load(raw) as Agent[]) || [];
  await fs.emptyDir(docsOut);

  const packNodes = new Map<string, string[]>();

  await Promise.all(
    parsed.map(async (agent, index) => {
      const packLabel = agent.pack || 'unassigned';
      const keywords = [agent.id, agent.name, packLabel];
      const frontmatter = [
        '---',
        `id: agent-${agent.id}`,
        `title: ${agent.name}${agent.role ? ` — ${agent.role}` : ''}`,
        `sidebar_position: ${index + 1}`,
        `keywords:`,
        ...keywords.map((k) => `  - ${k}`),
        '---',
        '',
      ].join('\n');

      const approvals = (agent.approvals || [])
        .map((approval) => `| ${approval.type} | ${approval.description || ''} |`)
        .join('\n');

      const traits = (agent.traits || []).map((trait) => `- ${trait}`).join('\n') || '- Not documented';
      const inputs = (agent.inputs || []).map((input) => `- ${input}`).join('\n') || '- Not documented';
      const outputs = (agent.outputs || []).map((output) => `- ${output}`).join('\n') || '- Not documented';

      const body = `${frontmatter}${agent.description || ''}\n\n` +
        `**Pack:** ${packLabel}\n\n` +
        `## Persona\n` +
        `- **Role:** ${agent.role || 'Unspecified'}\n` +
        `- **Capabilities:** ${agent.description || 'Unspecified'}\n\n` +
        `## Approval gates\n` +
        `| Type | Description |\n| --- | --- |\n${approvals || '| — | — |'}\n\n` +
        `## Traits\n${traits}\n\n` +
        `## Inputs\n${inputs}\n\n` +
        `## Outputs\n${outputs}\n`;

      await fs.outputFile(path.join(docsOut, `${agent.id}.mdx`), body);

      const packList = packNodes.get(packLabel) || [];
      packList.push(agent.id);
      packNodes.set(packLabel, packList);
    }),
  );

  const orgChartLines: string[] = ['graph TD', '  root[Agent Catalog]'];
  for (const [pack, agents] of packNodes.entries()) {
    const packId = `pack_${pack.replace(/[^a-zA-Z0-9]/g, '')}`;
    orgChartLines.push(`  root --> ${packId}[${pack} pack]`);
    agents.forEach((agentId) => {
      orgChartLines.push(`  ${packId} --> ${agentId}(${agentId})`);
    });
  }

  await fs.outputFile(orgChartOut, orgChartLines.join('\n'));
  const orgChartDocContent = [
    '---',
    'id: agent-org-chart',
    'title: Agent Org Chart',
    'sidebar_position: 2',
    '---',
    '',
    '```mermaid',
    ...orgChartLines,
    '```',
    '',
  ].join('\n');
  await fs.outputFile(orgChartDoc, orgChartDocContent);
  console.log(`[agent-catalog] Generated ${parsed.length} agent docs and org chart.`);
}

buildDocs().catch((error) => {
  console.error('[agent-catalog] Failed to build catalog docs', error);
  process.exit(1);
});

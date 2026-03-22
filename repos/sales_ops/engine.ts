import fs from 'fs';
import yaml from 'yaml';

export type Step = { name:string; action:string; params?:Record<string,any> };
export type Play = { title:string; purpose:string; triggers:string[]; steps:Step[] };

export function loadPlaybook(p: string): Play {
  const txt = fs.readFileSync(p,'utf-8');
  return yaml.parse(txt) as Play;
}

async function executeAction(action: string, params?: Record<string, any>): Promise<void> {
  switch (action) {
    case 'create_issue':
      if (params?.repo && params?.title) {
        console.log(`Creating GitHub issue in ${params.repo}: ${params.title}`);
      }
      break;
    case 'post_slack':
      if (params?.channel && params?.message) {
        console.log(`Posting to Slack #${params.channel}: ${params.message}`);
      }
      break;
    case 'create_deal':
      if (params?.crm && params?.name) {
        console.log(`Creating deal in ${params.crm}: ${params.name}`);
      }
      break;
    case 'send_email':
      if (params?.to && params?.subject) {
        console.log(`Sending email to ${params.to}: ${params.subject}`);
      }
      break;
    default:
      console.warn(`Unknown action: ${action}`);
  }
}

export async function runPlaybook(play: Play, log: (s:string)=>void = console.log) {
  log(`# ${play.title}`);
  for (const s of play.steps) {
    log(`- ${s.name}: ${s.action}`);
    await executeAction(s.action, s.params);
  }
}

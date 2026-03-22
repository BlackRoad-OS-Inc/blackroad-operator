#!/usr/bin/env node
const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const http = require('http');

const API = process.env.ROADWAY_API || 'http://localhost:4400';
const pink = chalk.hex('#FF1D6C');
const amber = chalk.hex('#F5A623');
const blue = chalk.hex('#2979FF');
const violet = chalk.hex('#9C27B0');

function api(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const program = new Command();

program
  .name('roadway')
  .description(pink('RoadWay') + ' — Deploy any code, instantly')
  .version('1.0.0');

// ── deploy ──────────────────────────────────────────────────
program
  .command('deploy [directory]')
  .description('Deploy a project')
  .option('-n, --name <name>', 'App name (defaults to directory name)')
  .option('-r, --runtime <runtime>', 'Force runtime (node, python, go, rust, static, etc)')
  .option('-p, --port <port>', 'Host port', parseInt)
  .option('-e, --env <vars...>', 'Environment variables (KEY=VALUE)')
  .action(async (dir, opts) => {
    const srcDir = path.resolve(dir || '.');
    const name = opts.name || path.basename(srcDir).toLowerCase().replace(/[^a-z0-9-]/g, '-');

    console.log(pink('\n  ⚡ RoadWay Deploy'));
    console.log(chalk.gray(`  ${srcDir} → ${name}\n`));

    if (!fs.existsSync(srcDir)) {
      console.log(chalk.red(`  Directory not found: ${srcDir}`));
      process.exit(1);
    }

    try {
      const result = await api('POST', '/api/deploy', {
        name,
        path: srcDir,
        runtime: opts.runtime,
        port: opts.port,
        env: opts.env,
      });

      if (result.ok) {
        console.log(pink('  ✓ Deployed!'));
        console.log(chalk.white(`  Runtime:   ${result.runtime}`));
        console.log(chalk.white(`  Port:      ${result.port}`));
        console.log(chalk.white(`  Container: ${result.container}`));
        console.log(blue(`  URL:       ${result.url}`));
        console.log(chalk.gray(`  Local:     http://localhost:${result.port}\n`));
      } else {
        console.log(chalk.red(`  ✗ Deploy failed: ${result.error}\n`));
        process.exit(1);
      }
    } catch (err) {
      console.log(chalk.red(`  ✗ Cannot reach RoadWay server at ${API}`));
      console.log(chalk.gray(`  Run: roadway server\n`));
      process.exit(1);
    }
  });

// ── deploy from git ─────────────────────────────────────────
program
  .command('deploy-git <repo>')
  .description('Deploy from a git URL')
  .option('-n, --name <name>', 'App name')
  .option('-b, --branch <branch>', 'Branch (default: main)')
  .option('-e, --env <vars...>', 'Environment variables')
  .action(async (repo, opts) => {
    const name = opts.name || repo.split('/').pop().replace('.git', '').toLowerCase().replace(/[^a-z0-9-]/g, '-');

    console.log(pink('\n  ⚡ RoadWay Git Deploy'));
    console.log(chalk.gray(`  ${repo} → ${name}\n`));

    try {
      const result = await api('POST', '/api/deploy/git', {
        name, repo, branch: opts.branch, env: opts.env,
      });

      if (result.ok) {
        console.log(pink('  ✓ Deployed!'));
        console.log(blue(`  URL: ${result.url}`));
        console.log(chalk.gray(`  Local: http://localhost:${result.port}\n`));
      } else {
        console.log(chalk.red(`  ✗ ${result.error}\n`));
      }
    } catch {
      console.log(chalk.red(`  ✗ Cannot reach RoadWay server at ${API}\n`));
    }
  });

// ── list ────────────────────────────────────────────────────
program
  .command('list')
  .alias('ls')
  .description('List all deployed apps')
  .action(async () => {
    try {
      const { apps } = await api('GET', '/api/apps');
      if (!apps.length) {
        console.log(chalk.gray('\n  No apps deployed yet. Run: roadway deploy <dir>\n'));
        return;
      }

      console.log(pink('\n  RoadWay Apps\n'));
      console.log(chalk.gray('  NAME'.padEnd(25) + 'STATUS'.padEnd(12) + 'RUNTIME'.padEnd(12) + 'PORT'.padEnd(8) + 'URL'));
      console.log(chalk.gray('  ' + '-'.repeat(80)));

      apps.forEach(a => {
        const status = a.status === 'running' ? chalk.green('● running') : chalk.red('○ stopped');
        console.log(
          `  ${chalk.white(a.name.padEnd(23))} ${status.padEnd(21)} ${chalk.gray((a.runtime || '?').padEnd(12))} ${chalk.gray(String(a.port || '').padEnd(8))} ${blue(a.url || '')}`
        );
      });
      console.log();
    } catch {
      console.log(chalk.red(`\n  ✗ Cannot reach RoadWay server at ${API}\n`));
    }
  });

// ── logs ────────────────────────────────────────────────────
program
  .command('logs <name>')
  .description('View app logs')
  .option('-n, --lines <n>', 'Number of lines', '100')
  .action(async (name, opts) => {
    try {
      const result = await api('GET', `/api/apps/${name}/logs?lines=${opts.lines}`);
      if (result.error) {
        console.log(chalk.red(`  ✗ ${result.error}`));
      } else {
        console.log(result.logs);
      }
    } catch {
      console.log(chalk.red(`  ✗ Cannot reach RoadWay server\n`));
    }
  });

// ── stop / start / restart ──────────────────────────────────
['stop', 'start', 'restart'].forEach(cmd => {
  program
    .command(`${cmd} <name>`)
    .description(`${cmd.charAt(0).toUpperCase() + cmd.slice(1)} an app`)
    .action(async (name) => {
      try {
        const result = await api('POST', `/api/apps/${name}/${cmd}`);
        if (result.ok) {
          console.log(pink(`  ✓ ${name} ${cmd}${cmd.endsWith('e') ? 'd' : 'ped'}`));
        } else {
          console.log(chalk.red(`  ✗ ${result.error}`));
        }
      } catch {
        console.log(chalk.red(`  ✗ Cannot reach RoadWay server\n`));
      }
    });
});

// ── delete ──────────────────────────────────────────────────
program
  .command('delete <name>')
  .alias('rm')
  .description('Delete an app and its container')
  .action(async (name) => {
    try {
      const result = await api('DELETE', `/api/apps/${name}`);
      if (result.ok) {
        console.log(pink(`  ✓ ${name} deleted`));
      } else {
        console.log(chalk.red(`  ✗ ${result.error}`));
      }
    } catch {
      console.log(chalk.red(`  ✗ Cannot reach RoadWay server\n`));
    }
  });

// ── status ──────────────────────────────────────────────────
program
  .command('status')
  .description('RoadWay server status')
  .action(async () => {
    try {
      const h = await api('GET', '/api/health');
      console.log(pink('\n  RoadWay Status'));
      console.log(chalk.white(`  Apps:    ${h.apps}`));
      console.log(chalk.white(`  Running: ${h.running}`));
      console.log(chalk.white(`  Uptime:  ${Math.floor(h.uptime)}s`));
      if (h.fleet) {
        console.log(chalk.white(`  Fleet:   ${h.fleet.online}/${h.fleet.total_nodes} nodes, ${h.fleet.total_apps} services`));
      }
      console.log();
    } catch {
      console.log(chalk.red(`\n  ✗ RoadWay server is not running`));
      console.log(chalk.gray(`  Start it: roadway server\n`));
    }
  });

// ── fleet ───────────────────────────────────────────────────
const fleet = program.command('fleet').description('Manage the Pi fleet');

fleet
  .command('scan')
  .description('Scan all fleet nodes for running services')
  .option('-r, --refresh', 'Force fresh scan (bypass cache)')
  .action(async (opts) => {
    console.log(pink('\n  Scanning fleet...\n'));
    try {
      const data = await api('GET', `/api/fleet${opts.refresh ? '?refresh=true' : ''}`);
      const nodes = Object.values(data.nodes);
      let totalApps = 0;

      nodes.forEach(node => {
        const apps = node.apps || [];
        totalApps += apps.length;
        const icon = node.status === 'online' ? chalk.green('●') : chalk.red('○');
        console.log(`  ${icon} ${chalk.white(node.name.padEnd(12))} ${chalk.gray(node.ip.padEnd(16))} ${chalk.gray(node.role.padEnd(18))} ${apps.length} services`);
      });

      console.log(chalk.gray(`\n  ${nodes.filter(n=>n.status==='online').length}/${nodes.length} nodes online, ${totalApps} total services\n`));
    } catch (e) {
      console.log(chalk.red(`  ✗ ${e.message}\n`));
    }
  });

fleet
  .command('apps [node]')
  .description('List all apps on a node (or all nodes)')
  .option('-t, --type <type>', 'Filter by type (docker, systemd, workerd, pm2)')
  .action(async (node, opts) => {
    try {
      const endpoint = node ? `/api/fleet/${node}` : '/api/fleet';
      const data = await api('GET', endpoint);
      const nodes = node ? [data] : Object.values(data.nodes);

      console.log(pink('\n  Fleet Services\n'));
      console.log(chalk.gray('  NODE'.padEnd(14) + 'SERVICE'.padEnd(40) + 'TYPE'.padEnd(12) + 'PORT'.padEnd(8) + 'STATUS'));
      console.log(chalk.gray('  ' + '-'.repeat(90)));

      nodes.forEach(n => {
        let apps = n.apps || [];
        if (opts.type) apps = apps.filter(a => a.type === opts.type);
        apps.forEach(a => {
          const st = a.status === 'running' ? chalk.green('running') : chalk.red(a.status || '?');
          console.log(
            `  ${chalk.gray((n.name||'').padEnd(12))} ${chalk.white((a.name||'').slice(0,38).padEnd(40))} ${chalk.gray((a.type||'').padEnd(12))} ${chalk.gray(String(a.port||'').padEnd(8))} ${st}`
          );
        });
      });
      console.log();
    } catch (e) {
      console.log(chalk.red(`  ✗ ${e.message}\n`));
    }
  });

fleet
  .command('logs <node> <service>')
  .description('View logs from a fleet service')
  .option('-n, --lines <n>', 'Lines', '50')
  .action(async (node, service, opts) => {
    try {
      const data = await api('GET', `/api/fleet/${node}/${service}/logs?lines=${opts.lines}`);
      console.log(data.logs || data.error || 'No output');
    } catch (e) {
      console.log(chalk.red(`  ✗ ${e.message}`));
    }
  });

['restart', 'stop', 'start'].forEach(action => {
  fleet
    .command(`${action} <node> <service>`)
    .description(`${action} a service on a fleet node`)
    .action(async (node, service) => {
      try {
        const r = await api('POST', `/api/fleet/${node}/${service}/${action}`);
        if (r.ok) console.log(pink(`  ✓ ${service} ${action}ed on ${node} (${r.method})`));
        else console.log(chalk.red(`  ✗ ${r.error}`));
      } catch (e) {
        console.log(chalk.red(`  ✗ ${e.message}`));
      }
    });
});

fleet
  .command('deploy <node>')
  .description('Deploy an app to a fleet node')
  .requiredOption('-n, --name <name>', 'App name')
  .option('-r, --repo <url>', 'Git repo URL')
  .option('-p, --path <path>', 'Local path to SCP')
  .action(async (node, opts) => {
    console.log(pink(`\n  Deploying ${opts.name} to ${node}...`));
    try {
      const r = await api('POST', `/api/fleet/${node}/deploy`, {
        name: opts.name, repo: opts.repo, path: opts.path,
      });
      if (r.ok) {
        console.log(pink(`  ✓ Deployed!`));
        console.log(chalk.gray(`  Node:    ${node}`));
        console.log(chalk.gray(`  Runtime: ${r.runtime}`));
        console.log(chalk.gray(`  Dir:     ${r.remote_dir}\n`));
      } else {
        console.log(chalk.red(`  ✗ ${r.error}\n`));
      }
    } catch (e) {
      console.log(chalk.red(`  ✗ ${e.message}\n`));
    }
  });

// ── server ──────────────────────────────────────────────────
program
  .command('server')
  .description('Start the RoadWay server')
  .option('-p, --port <port>', 'Port', '4400')
  .action((opts) => {
    process.env.PORT = opts.port;
    require('../api/server.js');
  });

// ── init ────────────────────────────────────────────────────
program
  .command('init [name]')
  .description('Initialize a new app in current directory')
  .action((name) => {
    const appName = name || path.basename(process.cwd()).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const config = {
      name: appName,
      env: {},
    };
    fs.writeFileSync('roadway.json', JSON.stringify(config, null, 2));
    console.log(pink(`\n  ✓ Initialized ${appName}`));
    console.log(chalk.gray(`  Created roadway.json. Deploy with: roadway deploy\n`));
  });

program.parse();

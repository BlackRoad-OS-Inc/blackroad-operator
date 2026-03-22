#!/usr/bin/env tsx
/**
 * Infra Sync Script
 *
 * Pulls data from GitHub, Cloudflare, and Railway APIs
 * and populates the database with Projects, Services, Domains, Repositories.
 *
 * Usage: pnpm infra:sync
 */

import { prisma } from '../db/client';
import {
  createGitHubClient,
  createCloudflareClient,
  createRailwayClient,
  GitHubRepo,
  CloudflareZone,
  CloudflareDNSRecord,
  RailwayProject,
  RailwayService,
} from '../integrations';

// Default account/project for initial sync
const DEFAULT_ACCOUNT_SLUG = 'blackroad';
const DEFAULT_PROJECT_SLUG = 'blackroad-os';

async function ensureDefaultAccount() {
  let account = await prisma.account.findUnique({
    where: { slug: DEFAULT_ACCOUNT_SLUG },
  });

  if (!account) {
    console.log('Creating default account...');
    account = await prisma.account.create({
      data: {
        name: 'BlackRoad',
        slug: DEFAULT_ACCOUNT_SLUG,
        plan: 'team',
      },
    });
  }

  return account;
}

async function ensureDefaultProject(accountId: string) {
  let project = await prisma.project.findFirst({
    where: {
      accountId,
      slug: DEFAULT_PROJECT_SLUG,
    },
  });

  if (!project) {
    console.log('Creating default project...');
    project = await prisma.project.create({
      data: {
        accountId,
        name: 'BlackRoad OS',
        slug: DEFAULT_PROJECT_SLUG,
        type: 'infra',
        description: 'Core infrastructure for BlackRoad OS',
      },
    });
  }

  return project;
}

async function syncGitHub(projectId: string) {
  console.log('\n--- Syncing GitHub ---');

  try {
    const github = createGitHubClient();
    const user = await github.getAuthenticatedUser();
    console.log(`Authenticated as: ${user.login}`);

    const repos = await github.listAllRepos();
    console.log(`Found ${repos.length} repositories`);

    // Filter to BlackRoad-OS org repos
    const blackroadRepos = repos.filter(
      (r) => r.owner.toLowerCase() === 'blackroad-os'
    );
    console.log(`Syncing ${blackroadRepos.length} BlackRoad-OS repos`);

    for (const repo of blackroadRepos) {
      await prisma.repository.upsert({
        where: {
          provider_fullName: {
            provider: 'github',
            fullName: repo.fullName,
          },
        },
        update: {
          name: repo.name,
          owner: repo.owner,
          url: repo.htmlUrl,
          defaultBranch: repo.defaultBranch,
          isPrivate: repo.isPrivate,
          externalId: String(repo.id),
          metadata: {
            language: repo.language,
            topics: repo.topics,
            pushedAt: repo.pushedAt,
          },
        },
        create: {
          projectId,
          provider: 'github',
          name: repo.name,
          owner: repo.owner,
          fullName: repo.fullName,
          url: repo.htmlUrl,
          defaultBranch: repo.defaultBranch,
          isPrivate: repo.isPrivate,
          externalId: String(repo.id),
          metadata: {
            language: repo.language,
            topics: repo.topics,
            pushedAt: repo.pushedAt,
          },
        },
      });
      console.log(`  ✓ ${repo.fullName}`);
    }

    return blackroadRepos.length;
  } catch (error) {
    console.error('GitHub sync failed:', (error as Error).message);
    return 0;
  }
}

async function syncCloudflare(projectId: string) {
  console.log('\n--- Syncing Cloudflare ---');

  try {
    const cf = createCloudflareClient();
    await cf.verifyToken();
    console.log('Cloudflare token verified');

    const zones = await cf.listZones();
    console.log(`Found ${zones.length} zones`);

    // Find blackroad.io zone
    const blackroadZone = zones.find((z) => z.name === 'blackroad.io');
    if (!blackroadZone) {
      console.log('blackroad.io zone not found, syncing all zones');
    }

    let totalRecords = 0;

    for (const zone of zones) {
      const records = await cf.listDNSRecords(zone.id);
      console.log(`  Zone ${zone.name}: ${records.length} records`);

      for (const record of records) {
        // Only sync A, AAAA, CNAME records (actual domains)
        if (!['A', 'AAAA', 'CNAME'].includes(record.type)) continue;

        await prisma.domain.upsert({
          where: { hostname: record.name },
          update: {
            provider: 'cloudflare',
            zoneId: zone.id,
            recordId: record.id,
            recordType: record.type,
            target: record.content,
            proxied: record.proxied,
            status: 'active',
            metadata: {
              ttl: record.ttl,
              zoneName: zone.name,
            },
          },
          create: {
            projectId,
            hostname: record.name,
            provider: 'cloudflare',
            zoneId: zone.id,
            recordId: record.id,
            recordType: record.type,
            target: record.content,
            proxied: record.proxied,
            status: 'active',
            metadata: {
              ttl: record.ttl,
              zoneName: zone.name,
            },
          },
        });
        totalRecords++;
      }
    }

    console.log(`  ✓ Synced ${totalRecords} DNS records`);
    return totalRecords;
  } catch (error) {
    console.error('Cloudflare sync failed:', (error as Error).message);
    return 0;
  }
}

async function syncRailway(projectId: string) {
  console.log('\n--- Syncing Railway ---');

  try {
    const railway = createRailwayClient();
    const me = await railway.getMe();
    console.log(`Authenticated as: ${me.email}`);

    const projects = await railway.listProjects();
    console.log(`Found ${projects.length} Railway projects`);

    let totalServices = 0;

    for (const rwProject of projects) {
      // Create environment for this Railway project
      const env = await prisma.environment.upsert({
        where: {
          projectId_slug: {
            projectId,
            slug: rwProject.name.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {
          name: rwProject.name,
          metadata: {
            railwayProjectId: rwProject.id,
            railwayTeamId: rwProject.teamId,
          },
        },
        create: {
          projectId,
          name: rwProject.name,
          slug: rwProject.name.toLowerCase().replace(/\s+/g, '-'),
          metadata: {
            railwayProjectId: rwProject.id,
            railwayTeamId: rwProject.teamId,
          },
        },
      });

      // Sync services
      for (const svc of rwProject.services) {
        try {
          const fullService = await railway.getService(svc.id);
          const health = railway.getServiceHealth(fullService);

          await prisma.service.upsert({
            where: {
              id: svc.id, // Use Railway ID as our ID for simplicity
            },
            update: {
              name: svc.name,
              status: health,
              environmentId: env.id,
              url: fullService.domains[0]?.domain
                ? `https://${fullService.domains[0].domain}`
                : null,
              metadata: {
                railwayProjectId: rwProject.id,
                icon: svc.icon,
                latestDeployment: fullService.deployments[0],
              },
            },
            create: {
              id: svc.id,
              projectId,
              name: svc.name,
              provider: 'railway',
              externalId: svc.id,
              status: health,
              environmentId: env.id,
              url: fullService.domains[0]?.domain
                ? `https://${fullService.domains[0].domain}`
                : null,
              metadata: {
                railwayProjectId: rwProject.id,
                icon: svc.icon,
                latestDeployment: fullService.deployments[0],
              },
            },
          });

          console.log(`  ✓ ${rwProject.name}/${svc.name} (${health})`);
          totalServices++;

          // Link Railway domains to our domain records
          for (const domain of fullService.domains) {
            const hostname = domain.suffix
              ? `${domain.domain}.${domain.suffix}`
              : domain.domain;

            await prisma.domain.upsert({
              where: { hostname },
              update: {
                serviceId: svc.id,
                provider: 'railway',
                status: 'active',
              },
              create: {
                projectId,
                serviceId: svc.id,
                hostname,
                provider: 'railway',
                status: 'active',
              },
            });
          }
        } catch (err) {
          console.log(`  ⚠ ${svc.name}: ${(err as Error).message}`);
        }
      }
    }

    console.log(`  ✓ Synced ${totalServices} services`);
    return totalServices;
  } catch (error) {
    console.error('Railway sync failed:', (error as Error).message);
    return 0;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     BlackRoad OS Infra Sync            ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nStarted at: ${new Date().toISOString()}`);

  try {
    // Ensure we have an account and project
    const account = await ensureDefaultAccount();
    const project = await ensureDefaultProject(account.id);

    console.log(`\nSyncing to: ${account.name} / ${project.name}`);

    // Run syncs
    const [repoCount, domainCount, serviceCount] = await Promise.all([
      syncGitHub(project.id),
      syncCloudflare(project.id),
      syncRailway(project.id),
    ]);

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'infra.sync',
        resource: 'project',
        resourceId: project.id,
        metadata: {
          repos: repoCount,
          domains: domainCount,
          services: serviceCount,
          syncedAt: new Date().toISOString(),
        },
      },
    });

    console.log('\n════════════════════════════════════════');
    console.log('✓ Sync Complete!');
    console.log(`  Repositories: ${repoCount}`);
    console.log(`  Domains: ${domainCount}`);
    console.log(`  Services: ${serviceCount}`);
    console.log('════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n✗ Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

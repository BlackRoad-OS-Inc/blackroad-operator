/**
 * BlackRoad OS Core API Server
 *
 * Lightweight Hono server that exposes infra data from the database.
 * Run with: pnpm dev:api
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prisma } from '../db/client';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://blackroad.io', 'https://prism.blackroad.io'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', ts: new Date().toISOString() });
});

// Get all infra data (main endpoint for Infra Map)
app.get('/api/infra', async (c) => {
  try {
    // Get default project with all relations
    const project = await prisma.project.findFirst({
      where: { slug: 'blackroad-os' },
      include: {
        services: {
          include: {
            domains: true,
            environment: true,
          },
        },
        domains: true,
        repositories: true,
        environments: true,
      },
    });

    if (!project) {
      return c.json({
        projects: [],
        stats: {
          totalServices: 0,
          totalDomains: 0,
          totalRepos: 0,
          healthyServices: 0,
          degradedServices: 0,
          downServices: 0,
        },
        integrations: { github: false, cloudflare: false, railway: false },
        lastSynced: null,
      });
    }

    // Get last sync time from audit log
    const lastSync = await prisma.auditLog.findFirst({
      where: { action: 'infra.sync' },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const healthyServices = project.services.filter((s) => s.status === 'healthy').length;
    const degradedServices = project.services.filter((s) => s.status === 'degraded').length;
    const downServices = project.services.filter((s) => s.status === 'down').length;

    // Check which integrations have data
    const hasGithub = project.repositories.length > 0;
    const hasCloudflare = project.domains.some((d) => d.provider === 'cloudflare');
    const hasRailway = project.services.some((s) => s.provider === 'railway');

    // Transform to API response format
    const response = {
      projects: [
        {
          id: project.id,
          name: project.name,
          slug: project.slug,
          type: project.type,
          services: project.services.map((svc) => ({
            id: svc.id,
            name: svc.name,
            provider: svc.provider,
            status: svc.status,
            url: svc.url,
            domains: svc.domains.map((d) => d.hostname),
          })),
          repos: project.repositories.map((repo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.fullName,
            defaultBranch: repo.defaultBranch,
          })),
        },
      ],
      stats: {
        totalServices: project.services.length,
        totalDomains: project.domains.length,
        totalRepos: project.repositories.length,
        healthyServices,
        degradedServices,
        downServices,
      },
      integrations: {
        github: hasGithub,
        cloudflare: hasCloudflare,
        railway: hasRailway,
      },
      lastSynced: lastSync?.createdAt?.toISOString() || null,
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching infra:', error);
    return c.json({ error: 'Failed to fetch infrastructure data' }, 500);
  }
});

// Get all projects
app.get('/api/projects', async (c) => {
  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: {
          services: true,
          domains: true,
          repositories: true,
        },
      },
    },
  });
  return c.json(projects);
});

// Get single project with details
app.get('/api/projects/:slug', async (c) => {
  const slug = c.req.param('slug');
  const project = await prisma.project.findFirst({
    where: { slug },
    include: {
      services: {
        include: {
          domains: true,
          environment: true,
        },
      },
      domains: true,
      repositories: true,
      environments: true,
    },
  });

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  return c.json(project);
});

// Get all services
app.get('/api/services', async (c) => {
  const services = await prisma.service.findMany({
    include: {
      domains: true,
      project: {
        select: { name: true, slug: true },
      },
    },
  });
  return c.json(services);
});

// Get all domains
app.get('/api/domains', async (c) => {
  const domains = await prisma.domain.findMany({
    include: {
      service: {
        select: { name: true, status: true },
      },
      project: {
        select: { name: true, slug: true },
      },
    },
  });
  return c.json(domains);
});

// Get all repositories
app.get('/api/repositories', async (c) => {
  const repos = await prisma.repository.findMany({
    include: {
      project: {
        select: { name: true, slug: true },
      },
    },
  });
  return c.json(repos);
});

// Trigger sync (POST)
app.post('/api/infra/sync', async (c) => {
  // In production, this would trigger the sync script or a background job
  // For now, return instructions
  return c.json({
    message: 'Run `pnpm infra:sync` in blackroad-os-core to sync infrastructure',
    hint: 'Automated sync coming in v2',
  });
});

// Start server
const port = parseInt(process.env.PORT || '4000', 10);
console.log(`\n🖤 BlackRoad OS Core API`);
console.log(`   Server running on http://localhost:${port}`);
console.log(`   Endpoints:`);
console.log(`     GET  /health         - Health check`);
console.log(`     GET  /api/infra      - Full infra snapshot`);
console.log(`     GET  /api/projects   - List projects`);
console.log(`     GET  /api/services   - List services`);
console.log(`     GET  /api/domains    - List domains`);
console.log(`     GET  /api/repositories - List repos`);
console.log(`     POST /api/infra/sync - Trigger sync\n`);

serve({
  fetch: app.fetch,
  port,
});

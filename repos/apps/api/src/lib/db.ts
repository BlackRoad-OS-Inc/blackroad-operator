export const prisma: any = {
  partner: {
    create: async ({ data }: any) => ({ id: 'p', ...data })
  },
  partnerApp: {
    create: async ({ data }: any) => ({ id: 'a', ...data }),
    update: async ({ where, data }: any) => ({ id: where.id, ...data }),
    findMany: async () => [],
    findFirst: async () => null
  },
  appInstall: {
    create: async ({ data }: any) => ({ id: 'i', ...data }),
    update: async ({ where, data }: any) => ({ id: where.id, ...data })
  },
  oAuthToken: {
    create: async ({ data }: any) => ({ id: 't', ...data }),
    delete: async () => ({})
  }
};
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export async function getOrCreateUserByEmail(email: string, name?: string) {
  return prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name }
  });
}
import { Pool, PoolConfig, QueryResult } from 'pg';

let pool: Pool | undefined;

function getConfig(): PoolConfig {
  const connectionString = process.env.PG_URL;
  if (!connectionString) {
    throw new Error('PG_URL is not configured');
  }
  const config: PoolConfig = {
    connectionString,
    application_name: 'prism-api',
  };
  if (process.env.PG_POOL_MAX) {
    const max = Number(process.env.PG_POOL_MAX);
    if (!Number.isNaN(max) && max > 0) {
      config.max = max;
    }
  }
  if (process.env.PG_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false } as any;
  }
  return config;
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getConfig());
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
  const p = getPool();
  return p.query<T>(sql, params);
}

export { getPool as pool };

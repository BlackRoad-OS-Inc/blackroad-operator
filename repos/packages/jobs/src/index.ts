import { Queue, Worker } from "bullmq";

export interface QueueConfig {
  connection: {
    host: string;
    port: number;
  };
}

export const createComplianceQueues = (config: QueueConfig) => {
  const reviews = new Queue("compliance-reviews", { connection: config.connection });
  const ticklers = new Queue("compliance-ticklers", { connection: config.connection });
  const archival = new Queue("compliance-archival", { connection: config.connection });
  return { reviews, ticklers, archival };
};

export const createWorker = (name: string, processor: Parameters<typeof Worker>[1], config: QueueConfig) => {
  return new Worker(name, processor, { connection: config.connection });
};

export * from "./calendar.js";
import { Queue, QueueEvents, QueueScheduler, Worker, QueueOptions, JobsOptions } from "bullmq";
import { createMessageIngestor } from "@blackroad/connectors";
import {
  ScenarioEngine,
  scanCommunications,
  seedLexicons,
  CaseService,
  SuppressionService,
  AlertDeduper,
  RetentionService,
} from "@lucidia/core";
import { WormLedger } from "@blackroad/worm";

export interface QueueFactoryConfig {
  connection: QueueOptions["connection"];
  prefix?: string;
}

export interface SurveillanceQueues {
  ingestComms: Queue;
  runScenarios: Queue;
  lexiconScan: Queue;
  caseSla: Queue;
  retentionGc: Queue;
  events: QueueEvents[];
  schedulers: QueueScheduler[];
}

export function createSurveillanceQueues(config: QueueFactoryConfig): SurveillanceQueues {
  const prefix = config.prefix ?? "surv";
  const ingestComms = new Queue(`${prefix}:ingest_comms`, { connection: config.connection });
  const runScenarios = new Queue(`${prefix}:run_scenarios`, { connection: config.connection });
  const lexiconScan = new Queue(`${prefix}:lexicon_scan`, { connection: config.connection });
  const caseSla = new Queue(`${prefix}:case_sla`, { connection: config.connection });
  const retentionGc = new Queue(`${prefix}:retention_gc`, { connection: config.connection });

  const events = [
    new QueueEvents(`${prefix}:ingest_comms`, { connection: config.connection }),
    new QueueEvents(`${prefix}:run_scenarios`, { connection: config.connection }),
    new QueueEvents(`${prefix}:lexicon_scan`, { connection: config.connection }),
    new QueueEvents(`${prefix}:case_sla`, { connection: config.connection }),
    new QueueEvents(`${prefix}:retention_gc`, { connection: config.connection }),
  ];

  const schedulers = [
    new QueueScheduler(`${prefix}:run_scenarios`, { connection: config.connection }),
    new QueueScheduler(`${prefix}:lexicon_scan`, { connection: config.connection }),
    new QueueScheduler(`${prefix}:case_sla`, { connection: config.connection }),
    new QueueScheduler(`${prefix}:retention_gc`, { connection: config.connection }),
  ];

  return { ingestComms, runScenarios, lexiconScan, caseSla, retentionGc, events, schedulers };
}

export interface WorkerConfig {
  ledger: WormLedger;
  caseService: CaseService;
  suppression: SuppressionService;
  deduper: AlertDeduper;
  retention: RetentionService;
  engine?: ScenarioEngine;
}

export function registerWorkers(queues: SurveillanceQueues, config: WorkerConfig): Worker[] {
  const engine = config.engine ?? new ScenarioEngine();

  const ingestWorker = new Worker(
    queues.ingestComms.name,
    async (job) => {
      const ingestor = createMessageIngestor({ ledger: config.ledger });
      const comm = await ingestor(job.data.message);
      await config.retention.archive(comm, comm.retentionKey);
      return comm;
    },
    { connection: queues.ingestComms.opts.connection }
  );

  const scenarioWorker = new Worker(
    queues.runScenarios.name,
    async (job) => {
      const alerts = await engine.run(job.data.context);
      const filtered = config.deduper.filter(alerts).filter((alert) => !config.suppression.shouldSuppress(alert));
      filtered.forEach((alert) => config.caseService.ingestAlert(alert));
      return { count: filtered.length };
    },
    { connection: queues.runScenarios.opts.connection }
  );

  const lexiconWorker = new Worker(
    queues.lexiconScan.name,
    async (job) => {
      const { comms } = job.data;
      const { alerts } = scanCommunications(comms, seedLexicons);
      const filtered = config.deduper.filter(alerts).filter((alert) => !config.suppression.shouldSuppress(alert));
      filtered.forEach((alert) => config.caseService.ingestAlert(alert));
      return { count: filtered.length };
    },
    { connection: queues.lexiconScan.opts.connection }
  );

  const caseSlaWorker = new Worker(
    queues.caseSla.name,
    async () => {
      // TODO: escalate cases based on SLA policies once defined.
      return { escalated: 0 };
    },
    { connection: queues.caseSla.opts.connection }
  );

  const retentionWorker = new Worker(
    queues.retentionGc.name,
    async () => {
      const expired = config.retention.markExpired(new Date());
      const purged = config.retention.purgeExpired();
      return { expired: expired.length, purged: purged.length };
    },
    { connection: queues.retentionGc.opts.connection }
  );

  return [ingestWorker, scenarioWorker, lexiconWorker, caseSlaWorker, retentionWorker];
}

export const defaultJobOptions: JobsOptions = {
  removeOnComplete: true,
  attempts: 3,
};
import { Queue, Worker, QueueScheduler, type QueueOptions } from 'bullmq';
import { ReconciliationService, StatementService, AuditExporter } from '@blackroad/core';
import { prisma } from '@blackroad/db';

export const queueNames = {
  ingestCustodian: 'ingest:custodian',
  ingestExchange: 'ingest:exchange',
  ingestOnchain: 'ingest:onchain',
  reconPositions: 'recon:positions',
  reconCash: 'recon:cash',
  reconTrades: 'recon:trades',
  reconCostBasis: 'recon:costbasis',
  pricingUpdate: 'pricing:update-eod',
  statementsMonthly: 'statements:monthly',
  statementsQuarterly: 'statements:quarterly'
} as const;

type QueueName = (typeof queueNames)[keyof typeof queueNames];

export interface JobContext {
  reconciliation: ReconciliationService;
  statements: StatementService;
  audit: AuditExporter;
}

export class JobRegistry {
  private readonly scheduler: QueueScheduler;
  private readonly workers: Worker[] = [];
  private readonly queue: Queue;

  constructor(queueName: QueueName, options: QueueOptions = {}, private readonly context: JobContext) {
    this.queue = new Queue(queueName, options);
    this.scheduler = new QueueScheduler(queueName, options);
    this.workers.push(
      new Worker(
        queueName,
        async (job) => {
          switch (job.name) {
            case queueNames.reconPositions:
            case queueNames.reconCash:
            case queueNames.reconTrades:
            case queueNames.reconCostBasis:
              await context.reconciliation.run({ asOf: new Date(job.data.asOf) });
              break;
            case queueNames.statementsMonthly:
            case queueNames.statementsQuarterly:
              await context.statements.generateStatement(job.data.accountId, job.data.period);
              break;
            default:
              break;
          }
        },
        options
      )
    );
  }

  async add(name: QueueName, data: Record<string, unknown>): Promise<void> {
    await this.queue.add(name, data, { jobId: `${name}:${JSON.stringify(data)}` });
  }

  async close(): Promise<void> {
    await this.queue.close();
    await this.scheduler.close();
    await Promise.all(this.workers.map((worker) => worker.close()));
  }
}

export function createDefaultJobContext(): JobContext {
  return {
    reconciliation: new ReconciliationService(prisma),
    statements: new StatementService(prisma),
    audit: new AuditExporter(prisma)
  };
import { Queue, QueueScheduler, Worker, type QueueOptions } from "bullmq";
import type { RedisOptions } from "ioredis";
import type { WormLedger } from "@blackroad/worm";
import {
  BcpService,
  EntitlementService,
  IncidentService,
  KriService,
  SodEngine,
  VendorService,
  type GrcRepository,
} from "@blackroad/grc-core";

export interface JobDependencies {
  repository: GrcRepository;
  worm: WormLedger;
  connection?: RedisOptions;
}

export interface RegisteredJob {
  queue: Queue;
  worker: Worker;
}

function queueOptions(connection?: RedisOptions): QueueOptions {
  return connection ? { connection } : {};
}

export function registerRecertJob(deps: JobDependencies): RegisteredJob {
  const queueName = "recerts";
  const queue = new Queue(queueName, queueOptions(deps.connection));
  new QueueScheduler(queueName, queueOptions(deps.connection));
  const entitlements = new EntitlementService(
    deps.repository,
    new SodEngine(deps.repository, deps.worm),
    deps.worm,
  );
  const worker = new Worker(
    queueName,
    async () => {
      const now = new Date();
      const needing = await deps.repository.listEntitlementsNeedingRecert(now);
      for (const entitlement of needing) {
        if (entitlement.recertDue && entitlement.recertDue < now) {
          await entitlements.expire(entitlement.id);
        }
      }
    },
    queueOptions(deps.connection),
  );
  return { queue, worker };
}

export function registerVendorDdqJob(deps: JobDependencies): RegisteredJob {
  const queueName = "vendor_ddq";
  const queue = new Queue(queueName, queueOptions(deps.connection));
  new QueueScheduler(queueName, queueOptions(deps.connection));
  const vendorService = new VendorService(deps.repository, deps.worm);
  const worker = new Worker(
    queueName,
    async () => {
      const vendors = await deps.repository.listVendors();
      for (const vendor of vendors) {
        await vendorService.recalculateRisk(vendor.id);
      }
    },
    queueOptions(deps.connection),
  );
  return { queue, worker };
}

export function registerIncidentSlaJob(deps: JobDependencies): RegisteredJob {
  const queueName = "incident_sla";
  const queue = new Queue(queueName, queueOptions(deps.connection));
  new QueueScheduler(queueName, queueOptions(deps.connection));
  const incidents = new IncidentService(deps.repository, deps.worm);
  const worker = new Worker(
    queueName,
    async () => {
      const metrics = await incidents.metrics();
      await deps.worm.append({
        payload: {
          type: "IncidentSlaComputed",
          metrics,
        },
      });
    },
    queueOptions(deps.connection),
  );
  return { queue, worker };
}

export function registerKriRollupJob(deps: JobDependencies): RegisteredJob {
  const queueName = "kri_rollup";
  const queue = new Queue(queueName, queueOptions(deps.connection));
  new QueueScheduler(queueName, queueOptions(deps.connection));
  const kpi = new KriService(deps.repository, deps.worm);
  const worker = new Worker(
    queueName,
    async () => {
      await kpi.rollup();
    },
    queueOptions(deps.connection),
  );
  return { queue, worker };
}

export function registerBcpTestJob(deps: JobDependencies): RegisteredJob {
  const queueName = "bcptest";
  const queue = new Queue(queueName, queueOptions(deps.connection));
  new QueueScheduler(queueName, queueOptions(deps.connection));
  const bcp = new BcpService(deps.repository, deps.worm);
  const worker = new Worker(
    queueName,
    async () => {
      const plan = await deps.repository.getActiveBcpPlan();
      if (plan) {
        await bcp.ensureCadence(plan.id);
      }
    },
    queueOptions(deps.connection),
  );
  return { queue, worker };
}

export const JOB_NAMES = {
  recerts: "recerts",
  vendorDdq: "vendor_ddq",
  incidentSla: "incident_sla",
  kriRollup: "kri_rollup",
  bcpTest: "bcptest",
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

export function registerAllJobs(deps: JobDependencies): Record<JobName, RegisteredJob> {
  return {
    recerts: registerRecertJob(deps),
    vendor_ddq: registerVendorDdqJob(deps),
    incident_sla: registerIncidentSlaJob(deps),
    kri_rollup: registerKriRollupJob(deps),
    bcptest: registerBcpTestJob(deps),
  } as Record<JobName, RegisteredJob>;
}

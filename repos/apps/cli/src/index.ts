#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { Command } from "commander";
import { PrismaClient } from "@prisma/client";
import { PrismaWormLedger } from "@blackroad/worm";
import {
  DEFAULT_POLICY_CONTEXT,
  EntitlementService,
  PrismaGrcRepository,
  RfcService,
  SodEngine,
  VendorService,
  IncidentService,
  BcpService,
  KriService,
  type PolicyContext,
} from "@blackroad/grc-core";

interface CliContext {
  prisma: PrismaClient;
  policy: PolicyContext;
  repository: PrismaGrcRepository;
  worm: PrismaWormLedger;
  entitlements: EntitlementService;
  rfc: RfcService;
  vendor: VendorService;
  incidents: IncidentService;
  bcp: BcpService;
  kri: KriService;
}

async function createContext(): Promise<CliContext> {
  const prisma = new PrismaClient();
  const worm = new PrismaWormLedger(prisma);
  const repository = new PrismaGrcRepository(prisma);
  const policy = DEFAULT_POLICY_CONTEXT;
  const sod = new SodEngine(repository, worm, policy);
  const entitlements = new EntitlementService(repository, sod, worm, policy);
  const rfc = new RfcService(repository, worm);
  const vendor = new VendorService(repository, worm);
  const incidents = new IncidentService(repository, worm, policy);
  const bcp = new BcpService(repository, worm, policy);
  const kri = new KriService(repository, worm);
  return { prisma, policy, repository, worm, entitlements, rfc, vendor, incidents, bcp, kri };
}

async function main(): Promise<void> {
  const program = new Command();
  program.name("blackroad-grc").description("BlackRoad GRC administration CLI");

  program
    .command("roles seed")
    .option("--preset <preset>", "Seed preset", "blackroad")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        if (options.preset === "blackroad") {
          const roles = [
            { key: "GRC_ADMIN", title: "GRC Administrator" },
            { key: "BILLING_ISSUER", title: "Billing Issuer" },
            { key: "PAYMENTS_POSTER", title: "Payments Poster" },
            { key: "ADS_APPROVER", title: "Ads Approver" },
            { key: "ADS_PUBLISHER", title: "Ads Publisher" },
          ];
          for (const role of roles) {
            const existing = await ctx.repository.getRoleByKey(role.key);
            if (!existing) {
              await ctx.repository.addRole({ id: undefined as any, ...role });
            }
          }
          console.log(`Seeded ${roles.length} roles`);
        } else {
          console.warn(`Unknown preset ${options.preset}`);
        }
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("entitlements grant")
    .requiredOption("--user <userId>")
    .requiredOption("--role <roleId>")
    .option("--expires <date>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const expiresAt = options.expires ? new Date(options.expires) : undefined;
        const result = await ctx.entitlements.grant({
          userId: options.user,
          roleId: options.role,
          grantedBy: "cli",
          expiresAt,
        });
        console.log(JSON.stringify(result, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("sod rules add")
    .requiredOption("--key <key>")
    .requiredOption("--left <role>")
    .option("--right <role>")
    .option("--severity <severity>", "75")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        await ctx.repository.addSodRule({
          id: undefined as any,
          key: options.key,
          description: options.key,
          constraint: options.right ? "MUTUAL_EXCLUSION" : "APPROVER_CANNOT_EXECUTE",
          leftRole: options.left,
          rightRole: options.right,
          severity: Number(options.severity ?? 75),
          scope: null,
        });
        console.log(`Added SoD rule ${options.key}`);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("rfc create")
    .requiredOption("--type <type>")
    .requiredOption("--title <title>")
    .option("--description <desc>", "")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const record = await ctx.rfc.create({
          title: options.title,
          type: options.type,
          description: options.description,
          requesterId: "cli",
          rollbackPlan: null,
        });
        console.log(record.id);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("rfc submit")
    .requiredOption("--id <id>")
    .option("--impact <level>", "Medium")
    .option("--rollback <level>", "Medium")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const record = await ctx.rfc.submit(options.id, "cli", {
          risk: {
            impact: options.impact,
            rollbackComplexity: options.rollback,
          },
        });
        console.log(JSON.stringify(record, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("vendor add")
    .requiredOption("--name <name>")
    .requiredOption("--category <category>")
    .requiredOption("--criticality <level>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const vendor = await ctx.vendor.registerVendor({
          name: options.name,
          category: options.category,
          criticality: options.criticality,
        });
        console.log(vendor.id);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("vendor ddq")
    .requiredOption("--vendor <id>")
    .requiredOption("--template <key>")
    .requiredOption("--answers <file>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const answers = JSON.parse(readFileSync(options.answers, "utf-8"));
        const vendor = await ctx.vendor.recordDdq(options.vendor, {
          questionnaireKey: options.template,
          answers,
          score: 80,
          status: "Completed",
          completedAt: new Date(),
        });
        console.log(JSON.stringify(vendor, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("incident open")
    .requiredOption("--type <type>")
    .requiredOption("--sev <sev>")
    .requiredOption("--title <title>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const incident = await ctx.incidents.open({
          title: options.title,
          type: options.type,
          severity: options.sev,
          description: options.title,
        });
        console.log(incident.id);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("bcp test")
    .requiredOption("--plan <planId>")
    .requiredOption("--scenario <scenario>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const test = await ctx.bcp.recordTest({
          planId: options.plan,
          scenario: options.scenario,
          participants: ["cli"],
          issues: [],
          outcome: "NeedsFollowup",
        });
        console.log(JSON.stringify(test, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("kri show")
    .action(async () => {
      const ctx = await createContext();
      try {
        const metrics = await ctx.kri.rollup();
        console.table(metrics.map((m) => ({ key: m.key, value: m.value.toString(), asOf: m.asOf })));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  await program.parseAsync(process.argv);
}

program.parseAsync();
import { Command } from "commander";
import { readFile } from "fs/promises";
import { createInMemoryDb } from "@blackroad/compliance-db";
import { gate, publishPolicy, recordAttestation } from "@blackroad/compliance-core";
import { advertising } from "@blackroad/compliance-reviewers";
import { verifyWormChain } from "@blackroad/compliance-archival";

const db = createInMemoryDb();
const program = new Command();
program.name("blackroad-compliance-os").description("Compliance OS CLI for Alexa Louise Amundson").version("0.1.0");

program
  .command("policy publish <file>")
  .description("Publish or update a policy definition")
  .action(async (file) => {
    const raw = await readFile(file, "utf-8");
    const payload = JSON.parse(raw);
    const record = await publishPolicy({
      db,
      actor: { id: "alexa", role: "admin", name: "Alexa Louise Amundson" },
      key: payload.key,
      title: payload.title,
      body: payload.body,
      controls: payload.controls ?? [],
      effectiveAt: new Date(payload.effectiveAt ?? new Date().toISOString()),
      status: payload.status ?? "Active",
    });
    console.log(`Published policy ${record.key} v${record.version}`);
  });

program
  .command("attest")
  .description("Record a policy attestation")
  .requiredOption("--policy <key>")
  .requiredOption("--user <id>")
  .requiredOption("--period <period>")
  .action(async (options) => {
    const attestation = await recordAttestation({
      db,
      policyKey: options.policy,
      userId: options.user,
      period: options.period,
      answers: { attestedAt: new Date().toISOString() },
    });
    console.log(`Recorded attestation ${attestation.id}`);
  });

const review = program.command("review").description("Run a review workflow");

review
  .command("advertising")
  .requiredOption("--in <file>")
  .option("--meta <file>")
  .action(async (opts) => {
    const content = await readFile(opts.in, "utf-8").catch(() => "");
    const meta = opts.meta ? JSON.parse(await readFile(opts.meta, "utf-8")) : {};
    const reviewResult = await advertising.runReview(db, {
      title: meta.title ?? opts.in,
      contentUrl: opts.in,
      content,
      containsPerformance: meta.containsPerformance,
      performancePeriods: meta.performancePeriods,
      containsTestimonials: meta.containsTestimonials,
      disclosures: meta.disclosures,
      cta: meta.cta,
      hypothetical: meta.hypothetical,
      thirdPartyRatings: meta.thirdPartyRatings,
    });
    console.log(JSON.stringify({
      reviewId: reviewResult.review.id,
      outcome: reviewResult.outcome,
      breaches: reviewResult.aggregate.breaches,
      riskScore: reviewResult.aggregate.riskScore,
    }, null, 2));
  });

review
  .command("aml")
  .requiredOption("--in <file>")
  .action(async () => {
    console.log("TODO: Implement AML review. Escalate to compliance officer.");
  });

program
  .command("gate <action>")
  .option("--state <state>")
  .option("--ce-complete")
  .action(async (action, options) => {
    const result = await gate(db, action, {
      state: options.state,
      ceCompleted: options.ceComplete ?? true,
    });
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command("calendar list")
  .option("--open", "Only show open items")
  .action(async (options) => {
    const items = await db.calendar.listOpen();
    console.table(
      items.filter((item) => (options.open ? item.status === "Open" : true)).map((item) => ({
        id: item.id,
        key: item.key,
        due: item.due.toISOString(),
        status: item.status,
      }))
    );
  });

program
  .command("worm verify")
  .action(async () => {
    const result = await verifyWormChain(db);
    if (result.ok) {
      console.log("WORM chain verified");
    } else {
      console.error("WORM verification failed", result.issues);
import { Command } from 'commander';
import ora from 'ora';
import { prisma } from '@blackroad/db';
import { ReconciliationService, StatementService, AuditExporter } from '@blackroad/core';
import { TraditionalCustodianCsvAdapter, CryptoExchangeCsvAdapter } from '@blackroad/adapters';

const program = new Command();
const reconService = new ReconciliationService(prisma);
const statementService = new StatementService(prisma);
const auditExporter = new AuditExporter(prisma);
const custodianAdapter = new TraditionalCustodianCsvAdapter('packages/adapters/config/fidelity.yaml');
const exchangeAdapter = new CryptoExchangeCsvAdapter('packages/adapters/config/coinbase.yaml');

program
  .name('blackroad-custodysync')
  .description('CustodySync operations CLI for BlackRoad Finance');

program
  .command('init')
  .requiredOption('--owner <name>', 'Owner name')
  .action(async (opts) => {
    const spinner = ora('Seeding owner and default account').start();
    try {
      const ownerId = opts.owner;
      await prisma.account.upsert({
        where: { accountNo: 'ACC-001' },
        update: { ownerId },
        create: {
          id: 'ACC-001',
          ownerId,
          custodian: 'FIDELITY',
          accountNo: 'ACC-001',
          type: 'TAXABLE',
          baseCurrency: 'USD',
          meta: { costMethod: 'FIFO' }
        }
      });
      spinner.succeed(`Initialized for ${ownerId}`);
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

program
  .command('import')
  .argument('<source>', 'custodian|exchange')
  .argument('<files...>')
  .requiredOption('--account <id>', 'Account ID')
  .option('--date <date>', 'As of date')
  .option('--from <date>', 'From date')
  .option('--to <date>', 'To date')
  .action(async (source, files, command) => {
    const options = command.opts();
    const spinner = ora(`Importing from ${source}`).start();
    try {
      if (source === 'custodian') {
        const date = options.date ? new Date(options.date) : new Date();
        await prisma.$transaction(async (tx) => {
          const [positions, cash, transactions] = await Promise.all([
            custodianAdapter.importPositions({ accountId: options.account, date, files }),
            custodianAdapter.importCash({ accountId: options.account, date, files }),
            custodianAdapter.importTransactions({ accountId: options.account, from: date, to: date, files })
          ]);
          for (const snapshot of positions) {
            await tx.positionSnapshot.upsert({
              where: {
                accountId_instrumentId_asOf_source: {
                  accountId: snapshot.accountId,
                  instrumentId: snapshot.instrumentId,
                  asOf: snapshot.asOf,
                  source: 'CUSTODIAN'
                }
              },
              update: {
                quantity: snapshot.quantity,
                marketValue: snapshot.marketValue,
                price: snapshot.price
              },
              create: snapshot
            });
          }
          for (const ledger of cash) {
            await tx.cashLedger.upsert({
              where: {
                accountId_currency_asOf_source: {
                  accountId: ledger.accountId,
                  currency: ledger.currency,
                  asOf: ledger.asOf,
                  source: 'CUSTODIAN'
                }
              },
              update: { balance: ledger.balance },
              create: ledger
            });
          }
          for (const transaction of transactions) {
            const externalId = transaction.externalId ?? transaction.id ?? `${transaction.accountId}-${transaction.tradeDate.toISOString()}-${transaction.type}`;
            await tx.transaction.upsert({
              where: {
                accountId_externalId: {
                  accountId: transaction.accountId,
                  externalId
                }
              },
              update: transaction,
              create: { ...transaction, externalId }
            });
          }
        });
      } else if (source === 'exchange') {
        const from = options.from ? new Date(options.from) : new Date();
        const to = options.to ? new Date(options.to) : from;
        const transactions = await exchangeAdapter.importFills({ accountId: options.account, from, to, files });
        await prisma.$transaction(async (tx) => {
          for (const transaction of transactions) {
            const externalId = transaction.externalId ?? transaction.id ?? `${transaction.accountId}-${transaction.tradeDate.toISOString()}-${transaction.type}`;
            await tx.transaction.upsert({
              where: {
                accountId_externalId: {
                  accountId: transaction.accountId,
                  externalId
                }
              },
              update: transaction,
              create: { ...transaction, externalId }
            });
          }
        });
      } else {
        throw new Error(`Unknown source ${source}`);
      }
      spinner.succeed('Import complete');
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

program
  .command('recon')
  .requiredOption('--as-of <date>', 'As of date')
  .action(async (opts) => {
    const spinner = ora('Running reconciliation').start();
    try {
      await reconService.run({ asOf: new Date(opts.asOf) });
      spinner.succeed('Reconciliation completed');
    } catch (err) {
      spinner.fail((err as Error).message);
import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import {
  parseBrokerCheckPDF,
  parseIAPDPDF,
  parseTextExport,
  needsHumanReviewFromParse,
} from "@blackroad/ingest-crd/src/index";
import {
  normalize,
  detectConflicts,
  sortDisclosures,
  NormDisclosureRecord,
  RawDisclosure,
} from "@blackroad/disclosures/src/index";
import { DraftContext, RawDisclosure as RawDisclosureType } from "@blackroad/disclosures/src/types";
import { draftPackets, renderSummary, blockers } from "@blackroad/drafting/src/index";

const program = new Command();
const DEFAULT_OUT = path.resolve(process.cwd(), "out");
const RAW_FILE = "raw_disclosures.json";
const NORM_FILE = "normalized_disclosures.json";

async function readFileMaybe(filePath?: string): Promise<Buffer | undefined> {
  if (!filePath) return undefined;
  return fs.readFile(path.resolve(filePath));
}

async function writeJsonSafe(outDir: string, fileName: string, data: unknown, force?: boolean) {
  const absolute = path.join(outDir, fileName);
  const exists = await fs
    .stat(absolute)
    .then(() => true)
    .catch(() => false);
  if (exists && !force) {
    throw new Error(`Refusing to overwrite ${fileName} without --force.`);
  }
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, JSON.stringify(data, null, 2));
}

async function readJson<T>(outDir: string, fileName: string): Promise<T> {
  const absolute = path.join(outDir, fileName);
  const buffer = await fs.readFile(absolute, "utf8");
  return JSON.parse(buffer) as T;
}

function ensureRawStructure(raws: RawDisclosure[]): RawDisclosure[] {
  return raws.map((raw) => ({
    ...raw,
    discoveredAt: raw.discoveredAt ?? new Date().toISOString(),
    fields: raw.fields ?? {},
  }));
}

program
  .name("blackroad-compliance")
  .description("BlackRoad Finance disclosure ingestion and drafting CLI");

program
  .command("ingest")
  .description("Ingest BrokerCheck and IAPD disclosures")
  .option("--brokercheck <file>", "Path to BrokerCheck PDF or text export")
  .option("--iapd <file>", "Path to IAPD PDF or text export")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .option("--force", "Overwrite existing artifacts")
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    await fs.mkdir(outDir, { recursive: true });

    const raw: RawDisclosure[] = [];
    if (options.brokercheck) {
      const buffer = await readFileMaybe(options.brokercheck);
      if (!buffer) throw new Error("Missing BrokerCheck file");
      const isText = path.extname(options.brokercheck).toLowerCase() === ".txt";
      const parsed = isText
        ? await parseTextExport(buffer.toString("utf8"), "BrokerCheck", new Date().toISOString())
        : await parseBrokerCheckPDF(buffer);
      raw.push(...parsed);
    }
    if (options.iapd) {
      const buffer = await readFileMaybe(options.iapd);
      if (!buffer) throw new Error("Missing IAPD file");
      const isText = path.extname(options.iapd).toLowerCase() === ".txt";
      const parsed = isText
        ? await parseTextExport(buffer.toString("utf8"), "IAPD", new Date().toISOString())
        : await parseIAPDPDF(buffer);
      raw.push(...parsed);
    }

    const structured = ensureRawStructure(raw);
    const requiresReview = needsHumanReviewFromParse(structured);

    await writeJsonSafe(outDir, RAW_FILE, { disclosures: structured, requiresReview }, options.force);
    console.log(`Ingested ${structured.length} disclosures → ${path.join(outDir, RAW_FILE)}`);
    if (requiresReview) {
      console.warn("[warn] Parser confidence <80%. Flagging for manual review.");
    }
  });

program
  .command("normalize")
  .description("Normalize and reconcile disclosures")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .option("--stale-days <number>", "Days before data is considered stale", parseInt)
  .option("--force", "Overwrite existing artifacts")
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const rawPayload = await readJson<{ disclosures: RawDisclosureType[] }>(outDir, RAW_FILE);
    const normalized = detectConflicts(sortDisclosures(normalize(rawPayload.disclosures, {
      staleAfterDays: Number.isFinite(options.staleDays) ? Number(options.staleDays) : undefined,
    })));
    await writeJsonSafe(outDir, NORM_FILE, { disclosures: normalized }, options.force);
    console.log(`Normalized ${normalized.length} disclosures → ${path.join(outDir, NORM_FILE)}`);
  });

program
  .command("draft")
  .description("Draft U4 and ADV artifacts")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .option("--person <id>", "Person identifier", "unknown-person")
  .option("--firm <id>", "Firm identifier", "unknown-firm")
  .option("--no-u4", "Skip U4 amendment output")
  .option("--no-adv", "Skip ADV item 11 payload")
  .option("--force", "Overwrite existing artifacts")
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const payload = await readJson<{ disclosures: NormDisclosureRecord[] }>(outDir, NORM_FILE);
    const ctx: DraftContext = { outDir, force: options.force };
    const result = await draftPackets({
      personId: options.person,
      firmId: options.firm,
      disclosures: payload.disclosures,
      context: ctx,
      includeU4: options.u4,
      includeADV: options.adv,
    });
    console.log(`Drafted ${result.files.length} artifacts. Manifest: ${result.manifestPath}`);
  });

program
  .command("gates")
  .description("Evaluate compliance gates for an action")
  .requiredOption("--action <action>", "Action to evaluate", (value) => value as
    "adviseClients" | "openAccounts" | "advertise")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const payload = await readJson<{ disclosures: NormDisclosureRecord[] }>(outDir, NORM_FILE);
    const ctx: DraftContext = { outDir };
    const result = await blockers.canProceed(ctx, payload.disclosures, options.action);
    if (result.allowed) {
      console.log(`Allowed: action ${options.action} can proceed.`);
    } else {
      console.error(`Blocked: ${result.reason}`);
      if (result.requiredArtifacts?.length) {
        console.error(`Required artifacts: ${result.requiredArtifacts.join(", ")}`);
      }
      process.exitCode = 1;
    }
  });

program
  .command("audit export")
  .requiredOption("--out <file>")
  .action(async (options) => {
    console.log(`TODO: generate audit export at ${options.out}`);
import { Command } from "commander";
import { ClientOnboardingEngine, GateService, sendEnvelope, syncEnvelope } from "@blackroad/core";

const program = new Command();
const engine = new ClientOnboardingEngine();
const gates = new GateService(engine.store, engine.policies);

program
  .name("blackroad-clientos")
  .description("Client onboarding workflows for BlackRoad Finance")
  .version("0.1.0");

program
  .command("start")
  .description("Start onboarding")
  .requiredOption("--type <type>")
  .requiredOption("--channel <channel>")
  .requiredOption("--account <accountType>")
  .action(async (opts) => {
    const result = await engine.start({ type: opts.type, channel: opts.channel, accountType: opts.account });
    console.log(JSON.stringify(result, null, 2));
  });

const kycCmd = program.command("kyc");
kycCmd
  .command("run")
  .description("Run KYC policy")
  .requiredOption("--client <clientId>")
  .action(async (opts) => {
    const result = await engine.runKyc(opts.client);
    console.log(JSON.stringify(result, null, 2));
  });

const suitability = program.command("suitability");
suitability
  .command("score")
  .description("Score suitability")
  .requiredOption("--client <clientId>")
  .option("--riskTolerance <tolerance>", "Moderate")
  .option("--experience <years>", "0")
  .option("--crypto", "Evaluate crypto suitability", false)
  .action(async (opts) => {
    const summary = await engine.scoreSuitability({
      clientId: opts.client,
      riskTolerance: opts.riskTolerance,
      objectives: [],
      timeHorizon: "Medium",
      liquidityNeeds: "Moderate",
      experienceYears: Number(opts.experience),
      crypto: Boolean(opts.crypto),
      questionnaire: {},
    });
    console.log(JSON.stringify(summary, null, 2));
  });

const docs = program.command("docs");
docs
  .command("generate")
  .description("Generate documents")
  .requiredOption("--accountapp <id>")
  .option("--set <set...>", "FORM_CRS")
  .action((opts) => {
    const docsResult = engine.generateDocuments(opts.accountapp, opts.set ?? ["FORM_CRS"]);
    console.log(JSON.stringify(docsResult, null, 2));
  });

const esign = program.command("esign");
esign
  .command("send")
  .description("Send e-sign envelope")
  .requiredOption("--accountapp <id>")
  .option("--doc <doc...>", "ADV_AGREEMENT")
  .action(async (opts) => {
    const envelope = await sendEnvelope(engine, opts.accountapp, opts.doc ?? ["ADV_AGREEMENT"]);
    console.log(JSON.stringify(envelope, null, 2));
  });

esign
  .command("sync")
  .description("Sync e-sign envelope")
  .requiredOption("--envelope <id>")
  .action(async (opts) => {
    const status = await syncEnvelope(engine, opts.envelope);
    console.log(JSON.stringify(status, null, 2));
  });

const gate = program.command("gate");
gate
  .command("check")
  .description("Evaluate a gate")
  .requiredOption("--client <id>")
  .requiredOption("--action <action>")
  .action((opts) => {
    const gateResult = gates.evaluate(opts.client, opts.action);
    console.log(JSON.stringify(gateResult, null, 2));
  });

const wallet = program.command("wallet");
wallet
  .command("add")
  .description("Register and screen a wallet")
  .requiredOption("--client <id>")
  .requiredOption("--chain <chain>")
  .requiredOption("--address <address>")
  .option("--label <label>")
  .action(async (opts) => {
    const walletResult = await engine.addWallet(opts.client, opts.chain, opts.address, opts.label);
    console.log(JSON.stringify(walletResult, null, 2));
  .command('breaks')
  .option('--status <status>', 'Break status')
  .action(async (opts) => {
    const breaks = await prisma.reconBreak.findMany({ where: { status: opts.status } });
    breaks.forEach((br) => {
      console.log(`${br.id} ${br.scope} ${br.status} delta=${Number(br.internal ?? 0) - Number(br.external ?? 0)}`);
    });
  });

const statements = program.command('statements');

statements
  .command('generate')
  .requiredOption('--account <id>', 'Account ID')
  .requiredOption('--period <period>', 'Period identifier e.g. 2025Q3')
  .action(async (opts) => {
    const spinner = ora('Generating statement').start();
    try {
      const path = await statementService.generateStatement(opts.account, opts.period);
      spinner.succeed(`Statement created at ${path}`);
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

const audit = program.command('audit');

audit
  .command('export')
  .requiredOption('--account <id>', 'Account ID')
  .requiredOption('--from <date>', 'From date')
  .requiredOption('--to <date>', 'To date')
  .requiredOption('--out <path>', 'Output zip path')
  .action(async (opts) => {
    const spinner = ora('Exporting audit package').start();
    try {
      const path = await auditExporter.export({
        accountId: opts.account,
        from: new Date(opts.from),
        to: new Date(opts.to),
        outputPath: opts.out
      });
      spinner.succeed(`Audit export ready at ${path}`);
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
  .command("summary")
  .description("Render disclosure summary")
  .option("--format <fmt>", "Output format (md|json)", "md")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const payload = await readJson<{ disclosures: NormDisclosureRecord[] }>(outDir, NORM_FILE);
    if (options.format === "json") {
      process.stdout.write(JSON.stringify(payload.disclosures, null, 2));
      return;
    }
    const summary = renderSummary(payload.disclosures);
    process.stdout.write(summary);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error.message);
main().catch((err) => {
  console.error(err);
  process.exit(1);
===
impoimport { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { ingestBrokerCheck } from "./commands/ingest.js";
import { syncCommand } from "./commands/sync.js";
import { planCommand } from "./commands/plan.js";
import { gateCommand } from "./commands/gate.js";

const program = new Command();
program
  .name("blackroad-lic")
  .description("BlackRoad licensing orchestrator CLI")
  .version("0.1.0");

program
  .command("init")
  .requiredOption("--person <name>", "Legal name of the person")
  .option("--crd <number>", "CRD number")
  .requiredOption("--home <state>", "Home state (e.g., MN)")
  .requiredOption("--tracks <list>", "Comma separated tracks (securities,insurance,real_estate)")
  .requiredOption("--states <list>", "Comma separated target states")
  .action((options) => {
    initCommand(options);
  });

program
  .command("ingest")
  .description("Ingest external data sources")
  .command("brokercheck <file>")
  .description("Parse BrokerCheck PDF")
  .action(async (file: string) => {
    await ingestBrokerCheck(file);
  });

program
  .command("sync")
  .description("Sync license data from state portals")
  .option("--states <list>", "States to sync, default all")
  .option("--tracks <list>", "Tracks to sync, default all")
  .action((options) => {
    syncCommand(options);
  });

program
  .command("plan")
  .description("Generate reinstatement plan")
  .requiredOption("--states <list|all>", "States to include or 'all'")
  .requiredOption("--tracks <list|all>", "Tracks to include or 'all'")
  .option("--out <path>", "Optional output file")
  .option("--print-md", "Print markdown summary", false)
  .action((options) => {
    planCommand({
      states: options.states,
      tracks: options.tracks,
      out: options.out,
      printMd: options.printMd,
    });
  });

program
  .command("gate")
  .description("Evaluate compliance gates")
  .requiredOption("--action <advise|sell-insurance|trade-bd>", "Action to evaluate")
  .requiredOption("--state <state>", "State code")
  .option("--line <line>", "Insurance line for sell-insurance action")
  .action((options) => {
    gateCommand(options);
  });

program.parseAsync(process.argv).catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exitCode = 1;
>>>>>>>+bd8839e6f7b2a63
#!/usr/bin/env node
<<<<<<<+HEAD
import { readFileSync } from "node:fs";
import { Command } from "commander";
import { PrismaClient } from "@prisma/client";
import { PrismaWormLedger } from "@blackroad/worm";
import {
  DEFAULT_POLICY_CONTEXT,
  EntitlementService,
  PrismaGrcRepository,
  RfcService,
  SodEngine,
  VendorService,
  IncidentService,
  BcpService,
  KriService,
  type PolicyContext,
} from "@blackroad/grc-core";

interface CliContext {
  prisma: PrismaClient;
  policy: PolicyContext;
  repository: PrismaGrcRepository;
  worm: PrismaWormLedger;
  entitlements: EntitlementService;
  rfc: RfcService;
  vendor: VendorService;
  incidents: IncidentService;
  bcp: BcpService;
  kri: KriService;
}

async function createContext(): Promise<CliContext> {
  const prisma = new PrismaClient();
  const worm = new PrismaWormLedger(prisma);
  const repository = new PrismaGrcRepository(prisma);
  const policy = DEFAULT_POLICY_CONTEXT;
  const sod = new SodEngine(repository, worm, policy);
  const entitlements = new EntitlementService(repository, sod, worm, policy);
  const rfc = new RfcService(repository, worm);
  const vendor = new VendorService(repository, worm);
  const incidents = new IncidentService(repository, worm, policy);
  const bcp = new BcpService(repository, worm, policy);
  const kri = new KriService(repository, worm);
  return { prisma, policy, repository, worm, entitlements, rfc, vendor, incidents, bcp, kri };
}

async function main(): Promise<void> {
  const program = new Command();
  program.name("blackroad-grc").description("BlackRoad GRC administration CLI");

  program
    .command("roles seed")
    .option("--preset <preset>", "Seed preset", "blackroad")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        if (options.preset === "blackroad") {
          const roles = [
            { key: "GRC_ADMIN", title: "GRC Administrator" },
            { key: "BILLING_ISSUER", title: "Billing Issuer" },
            { key: "PAYMENTS_POSTER", title: "Payments Poster" },
            { key: "ADS_APPROVER", title: "Ads Approver" },
            { key: "ADS_PUBLISHER", title: "Ads Publisher" },
          ];
          for (const role of roles) {
            const existing = await ctx.repository.getRoleByKey(role.key);
            if (!existing) {
              await ctx.repository.addRole({ id: undefined as any, ...role });
            }
          }
          console.log(`Seeded ${roles.length} roles`);
        } else {
          console.warn(`Unknown preset ${options.preset}`);
        }
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("entitlements grant")
    .requiredOption("--user <userId>")
    .requiredOption("--role <roleId>")
    .option("--expires <date>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const expiresAt = options.expires ? new Date(options.expires) : undefined;
        const result = await ctx.entitlements.grant({
          userId: options.user,
          roleId: options.role,
          grantedBy: "cli",
          expiresAt,
        });
        console.log(JSON.stringify(result, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("sod rules add")
    .requiredOption("--key <key>")
    .requiredOption("--left <role>")
    .option("--right <role>")
    .option("--severity <severity>", "75")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        await ctx.repository.addSodRule({
          id: undefined as any,
          key: options.key,
          description: options.key,
          constraint: options.right ? "MUTUAL_EXCLUSION" : "APPROVER_CANNOT_EXECUTE",
          leftRole: options.left,
          rightRole: options.right,
          severity: Number(options.severity ?? 75),
          scope: null,
        });
        console.log(`Added SoD rule ${options.key}`);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("rfc create")
    .requiredOption("--type <type>")
    .requiredOption("--title <title>")
    .option("--description <desc>", "")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const record = await ctx.rfc.create({
          title: options.title,
          type: options.type,
          description: options.description,
          requesterId: "cli",
          rollbackPlan: null,
        });
        console.log(record.id);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("rfc submit")
    .requiredOption("--id <id>")
    .option("--impact <level>", "Medium")
    .option("--rollback <level>", "Medium")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const record = await ctx.rfc.submit(options.id, "cli", {
          risk: {
            impact: options.impact,
            rollbackComplexity: options.rollback,
          },
        });
        console.log(JSON.stringify(record, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("vendor add")
    .requiredOption("--name <name>")
    .requiredOption("--category <category>")
    .requiredOption("--criticality <level>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const vendor = await ctx.vendor.registerVendor({
          name: options.name,
          category: options.category,
          criticality: options.criticality,
        });
        console.log(vendor.id);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("vendor ddq")
    .requiredOption("--vendor <id>")
    .requiredOption("--template <key>")
    .requiredOption("--answers <file>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const answers = JSON.parse(readFileSync(options.answers, "utf-8"));
        const vendor = await ctx.vendor.recordDdq(options.vendor, {
          questionnaireKey: options.template,
          answers,
          score: 80,
          status: "Completed",
          completedAt: new Date(),
        });
        console.log(JSON.stringify(vendor, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("incident open")
    .requiredOption("--type <type>")
    .requiredOption("--sev <sev>")
    .requiredOption("--title <title>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const incident = await ctx.incidents.open({
          title: options.title,
          type: options.type,
          severity: options.sev,
          description: options.title,
        });
        console.log(incident.id);
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("bcp test")
    .requiredOption("--plan <planId>")
    .requiredOption("--scenario <scenario>")
    .action(async (options) => {
      const ctx = await createContext();
      try {
        const test = await ctx.bcp.recordTest({
          planId: options.plan,
          scenario: options.scenario,
          participants: ["cli"],
          issues: [],
          outcome: "NeedsFollowup",
        });
        console.log(JSON.stringify(test, null, 2));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  program
    .command("kri show")
    .action(async () => {
      const ctx = await createContext();
      try {
        const metrics = await ctx.kri.rollup();
        console.table(metrics.map((m) => ({ key: m.key, value: m.value.toString(), asOf: m.asOf })));
      } finally {
        await ctx.prisma.$disconnect();
      }
    });

  await program.parseAsync(process.argv);
}

program.parseAsync();
import { Command } from "commander";
import { readFile } from "fs/promises";
import { createInMemoryDb } from "@blackroad/compliance-db";
import { gate, publishPolicy, recordAttestation } from "@blackroad/compliance-core";
import { advertising } from "@blackroad/compliance-reviewers";
import { verifyWormChain } from "@blackroad/compliance-archival";

const db = createInMemoryDb();
const program = new Command();
program.name("blackroad-compliance-os").description("Compliance OS CLI for Alexa Louise Amundson").version("0.1.0");

program
  .command("policy publish <file>")
  .description("Publish or update a policy definition")
  .action(async (file) => {
    const raw = await readFile(file, "utf-8");
    const payload = JSON.parse(raw);
    const record = await publishPolicy({
      db,
      actor: { id: "alexa", role: "admin", name: "Alexa Louise Amundson" },
      key: payload.key,
      title: payload.title,
      body: payload.body,
      controls: payload.controls ?? [],
      effectiveAt: new Date(payload.effectiveAt ?? new Date().toISOString()),
      status: payload.status ?? "Active",
    });
    console.log(`Published policy ${record.key} v${record.version}`);
  });

program
  .command("attest")
  .description("Record a policy attestation")
  .requiredOption("--policy <key>")
  .requiredOption("--user <id>")
  .requiredOption("--period <period>")
  .action(async (options) => {
    const attestation = await recordAttestation({
      db,
      policyKey: options.policy,
      userId: options.user,
      period: options.period,
      answers: { attestedAt: new Date().toISOString() },
    });
    console.log(`Recorded attestation ${attestation.id}`);
  });

const review = program.command("review").description("Run a review workflow");

review
  .command("advertising")
  .requiredOption("--in <file>")
  .option("--meta <file>")
  .action(async (opts) => {
    const content = await readFile(opts.in, "utf-8").catch(() => "");
    const meta = opts.meta ? JSON.parse(await readFile(opts.meta, "utf-8")) : {};
    const reviewResult = await advertising.runReview(db, {
      title: meta.title ?? opts.in,
      contentUrl: opts.in,
      content,
      containsPerformance: meta.containsPerformance,
      performancePeriods: meta.performancePeriods,
      containsTestimonials: meta.containsTestimonials,
      disclosures: meta.disclosures,
      cta: meta.cta,
      hypothetical: meta.hypothetical,
      thirdPartyRatings: meta.thirdPartyRatings,
    });
    console.log(JSON.stringify({
      reviewId: reviewResult.review.id,
      outcome: reviewResult.outcome,
      breaches: reviewResult.aggregate.breaches,
      riskScore: reviewResult.aggregate.riskScore,
    }, null, 2));
  });

review
  .command("aml")
  .requiredOption("--in <file>")
  .action(async () => {
    console.log("TODO: Implement AML review. Escalate to compliance officer.");
  });

program
  .command("gate <action>")
  .option("--state <state>")
  .option("--ce-complete")
  .action(async (action, options) => {
    const result = await gate(db, action, {
      state: options.state,
      ceCompleted: options.ceComplete ?? true,
    });
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command("calendar list")
  .option("--open", "Only show open items")
  .action(async (options) => {
    const items = await db.calendar.listOpen();
    console.table(
      items.filter((item) => (options.open ? item.status === "Open" : true)).map((item) => ({
        id: item.id,
        key: item.key,
        due: item.due.toISOString(),
        status: item.status,
      }))
    );
  });

program
  .command("worm verify")
  .action(async () => {
    const result = await verifyWormChain(db);
    if (result.ok) {
      console.log("WORM chain verified");
    } else {
      console.error("WORM verification failed", result.issues);
import { Command } from 'commander';
import ora from 'ora';
import { prisma } from '@blackroad/db';
import { ReconciliationService, StatementService, AuditExporter } from '@blackroad/core';
import { TraditionalCustodianCsvAdapter, CryptoExchangeCsvAdapter } from '@blackroad/adapters';

const program = new Command();
const reconService = new ReconciliationService(prisma);
const statementService = new StatementService(prisma);
const auditExporter = new AuditExporter(prisma);
const custodianAdapter = new TraditionalCustodianCsvAdapter('packages/adapters/config/fidelity.yaml');
const exchangeAdapter = new CryptoExchangeCsvAdapter('packages/adapters/config/coinbase.yaml');

program
  .name('blackroad-custodysync')
  .description('CustodySync operations CLI for BlackRoad Finance');

program
  .command('init')
  .requiredOption('--owner <name>', 'Owner name')
  .action(async (opts) => {
    const spinner = ora('Seeding owner and default account').start();
    try {
      const ownerId = opts.owner;
      await prisma.account.upsert({
        where: { accountNo: 'ACC-001' },
        update: { ownerId },
        create: {
          id: 'ACC-001',
          ownerId,
          custodian: 'FIDELITY',
          accountNo: 'ACC-001',
          type: 'TAXABLE',
          baseCurrency: 'USD',
          meta: { costMethod: 'FIFO' }
        }
      });
      spinner.succeed(`Initialized for ${ownerId}`);
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

program
  .command('import')
  .argument('<source>', 'custodian|exchange')
  .argument('<files...>')
  .requiredOption('--account <id>', 'Account ID')
  .option('--date <date>', 'As of date')
  .option('--from <date>', 'From date')
  .option('--to <date>', 'To date')
  .action(async (source, files, command) => {
    const options = command.opts();
    const spinner = ora(`Importing from ${source}`).start();
    try {
      if (source === 'custodian') {
        const date = options.date ? new Date(options.date) : new Date();
        await prisma.$transaction(async (tx) => {
          const [positions, cash, transactions] = await Promise.all([
            custodianAdapter.importPositions({ accountId: options.account, date, files }),
            custodianAdapter.importCash({ accountId: options.account, date, files }),
            custodianAdapter.importTransactions({ accountId: options.account, from: date, to: date, files })
          ]);
          for (const snapshot of positions) {
            await tx.positionSnapshot.upsert({
              where: {
                accountId_instrumentId_asOf_source: {
                  accountId: snapshot.accountId,
                  instrumentId: snapshot.instrumentId,
                  asOf: snapshot.asOf,
                  source: 'CUSTODIAN'
                }
              },
              update: {
                quantity: snapshot.quantity,
                marketValue: snapshot.marketValue,
                price: snapshot.price
              },
              create: snapshot
            });
          }
          for (const ledger of cash) {
            await tx.cashLedger.upsert({
              where: {
                accountId_currency_asOf_source: {
                  accountId: ledger.accountId,
                  currency: ledger.currency,
                  asOf: ledger.asOf,
                  source: 'CUSTODIAN'
                }
              },
              update: { balance: ledger.balance },
              create: ledger
            });
          }
          for (const transaction of transactions) {
            const externalId = transaction.externalId ?? transaction.id ?? `${transaction.accountId}-${transaction.tradeDate.toISOString()}-${transaction.type}`;
            await tx.transaction.upsert({
              where: {
                accountId_externalId: {
                  accountId: transaction.accountId,
                  externalId
                }
              },
              update: transaction,
              create: { ...transaction, externalId }
            });
          }
        });
      } else if (source === 'exchange') {
        const from = options.from ? new Date(options.from) : new Date();
        const to = options.to ? new Date(options.to) : from;
        const transactions = await exchangeAdapter.importFills({ accountId: options.account, from, to, files });
        await prisma.$transaction(async (tx) => {
          for (const transaction of transactions) {
            const externalId = transaction.externalId ?? transaction.id ?? `${transaction.accountId}-${transaction.tradeDate.toISOString()}-${transaction.type}`;
            await tx.transaction.upsert({
              where: {
                accountId_externalId: {
                  accountId: transaction.accountId,
                  externalId
                }
              },
              update: transaction,
              create: { ...transaction, externalId }
            });
          }
        });
      } else {
        throw new Error(`Unknown source ${source}`);
      }
      spinner.succeed('Import complete');
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

program
  .command('recon')
  .requiredOption('--as-of <date>', 'As of date')
  .action(async (opts) => {
    const spinner = ora('Running reconciliation').start();
    try {
      await reconService.run({ asOf: new Date(opts.asOf) });
      spinner.succeed('Reconciliation completed');
    } catch (err) {
      spinner.fail((err as Error).message);
import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import {
  parseBrokerCheckPDF,
  parseIAPDPDF,
  parseTextExport,
  needsHumanReviewFromParse,
} from "@blackroad/ingest-crd/src/index";
import {
  normalize,
  detectConflicts,
  sortDisclosures,
  NormDisclosureRecord,
  RawDisclosure,
} from "@blackroad/disclosures/src/index";
import { DraftContext, RawDisclosure as RawDisclosureType } from "@blackroad/disclosures/src/types";
import { draftPackets, renderSummary, blockers } from "@blackroad/drafting/src/index";

const program = new Command();
const DEFAULT_OUT = path.resolve(process.cwd(), "out");
const RAW_FILE = "raw_disclosures.json";
const NORM_FILE = "normalized_disclosures.json";

async function readFileMaybe(filePath?: string): Promise<Buffer | undefined> {
  if (!filePath) return undefined;
  return fs.readFile(path.resolve(filePath));
}

async function writeJsonSafe(outDir: string, fileName: string, data: unknown, force?: boolean) {
  const absolute = path.join(outDir, fileName);
  const exists = await fs
    .stat(absolute)
    .then(() => true)
    .catch(() => false);
  if (exists && !force) {
    throw new Error(`Refusing to overwrite ${fileName} without --force.`);
  }
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, JSON.stringify(data, null, 2));
}

async function readJson<T>(outDir: string, fileName: string): Promise<T> {
  const absolute = path.join(outDir, fileName);
  const buffer = await fs.readFile(absolute, "utf8");
  return JSON.parse(buffer) as T;
}

function ensureRawStructure(raws: RawDisclosure[]): RawDisclosure[] {
  return raws.map((raw) => ({
    ...raw,
    discoveredAt: raw.discoveredAt ?? new Date().toISOString(),
    fields: raw.fields ?? {},
  }));
}

program
  .name("blackroad-compliance")
  .description("BlackRoad Finance disclosure ingestion and drafting CLI");

program
  .command("ingest")
  .description("Ingest BrokerCheck and IAPD disclosures")
  .option("--brokercheck <file>", "Path to BrokerCheck PDF or text export")
  .option("--iapd <file>", "Path to IAPD PDF or text export")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .option("--force", "Overwrite existing artifacts")
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    await fs.mkdir(outDir, { recursive: true });

    const raw: RawDisclosure[] = [];
    if (options.brokercheck) {
      const buffer = await readFileMaybe(options.brokercheck);
      if (!buffer) throw new Error("Missing BrokerCheck file");
      const isText = path.extname(options.brokercheck).toLowerCase() === ".txt";
      const parsed = isText
        ? await parseTextExport(buffer.toString("utf8"), "BrokerCheck", new Date().toISOString())
        : await parseBrokerCheckPDF(buffer);
      raw.push(...parsed);
    }
    if (options.iapd) {
      const buffer = await readFileMaybe(options.iapd);
      if (!buffer) throw new Error("Missing IAPD file");
      const isText = path.extname(options.iapd).toLowerCase() === ".txt";
      const parsed = isText
        ? await parseTextExport(buffer.toString("utf8"), "IAPD", new Date().toISOString())
        : await parseIAPDPDF(buffer);
      raw.push(...parsed);
    }

    const structured = ensureRawStructure(raw);
    const requiresReview = needsHumanReviewFromParse(structured);

    await writeJsonSafe(outDir, RAW_FILE, { disclosures: structured, requiresReview }, options.force);
    console.log(`Ingested ${structured.length} disclosures → ${path.join(outDir, RAW_FILE)}`);
    if (requiresReview) {
      console.warn("[warn] Parser confidence <80%. Flagging for manual review.");
    }
  });

program
  .command("normalize")
  .description("Normalize and reconcile disclosures")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .option("--stale-days <number>", "Days before data is considered stale", parseInt)
  .option("--force", "Overwrite existing artifacts")
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const rawPayload = await readJson<{ disclosures: RawDisclosureType[] }>(outDir, RAW_FILE);
    const normalized = detectConflicts(sortDisclosures(normalize(rawPayload.disclosures, {
      staleAfterDays: Number.isFinite(options.staleDays) ? Number(options.staleDays) : undefined,
    })));
    await writeJsonSafe(outDir, NORM_FILE, { disclosures: normalized }, options.force);
    console.log(`Normalized ${normalized.length} disclosures → ${path.join(outDir, NORM_FILE)}`);
  });

program
  .command("draft")
  .description("Draft U4 and ADV artifacts")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .option("--person <id>", "Person identifier", "unknown-person")
  .option("--firm <id>", "Firm identifier", "unknown-firm")
  .option("--no-u4", "Skip U4 amendment output")
  .option("--no-adv", "Skip ADV item 11 payload")
  .option("--force", "Overwrite existing artifacts")
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const payload = await readJson<{ disclosures: NormDisclosureRecord[] }>(outDir, NORM_FILE);
    const ctx: DraftContext = { outDir, force: options.force };
    const result = await draftPackets({
      personId: options.person,
      firmId: options.firm,
      disclosures: payload.disclosures,
      context: ctx,
      includeU4: options.u4,
      includeADV: options.adv,
    });
    console.log(`Drafted ${result.files.length} artifacts. Manifest: ${result.manifestPath}`);
  });

program
  .command("gates")
  .description("Evaluate compliance gates for an action")
  .requiredOption("--action <action>", "Action to evaluate", (value) => value as
    "adviseClients" | "openAccounts" | "advertise")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const payload = await readJson<{ disclosures: NormDisclosureRecord[] }>(outDir, NORM_FILE);
    const ctx: DraftContext = { outDir };
    const result = await blockers.canProceed(ctx, payload.disclosures, options.action);
    if (result.allowed) {
      console.log(`Allowed: action ${options.action} can proceed.`);
    } else {
      console.error(`Blocked: ${result.reason}`);
      if (result.requiredArtifacts?.length) {
        console.error(`Required artifacts: ${result.requiredArtifacts.join(", ")}`);
      }
      process.exitCode = 1;
    }
  });

program
  .command("audit export")
  .requiredOption("--out <file>")
  .action(async (options) => {
    console.log(`TODO: generate audit export at ${options.out}`);
import { Command } from "commander";
import { ClientOnboardingEngine, GateService, sendEnvelope, syncEnvelope } from "@blackroad/core";

const program = new Command();
const engine = new ClientOnboardingEngine();
const gates = new GateService(engine.store, engine.policies);

program
  .name("blackroad-clientos")
  .description("Client onboarding workflows for BlackRoad Finance")
  .version("0.1.0");

program
  .command("start")
  .description("Start onboarding")
  .requiredOption("--type <type>")
  .requiredOption("--channel <channel>")
  .requiredOption("--account <accountType>")
  .action(async (opts) => {
    const result = await engine.start({ type: opts.type, channel: opts.channel, accountType: opts.account });
    console.log(JSON.stringify(result, null, 2));
  });

const kycCmd = program.command("kyc");
kycCmd
  .command("run")
  .description("Run KYC policy")
  .requiredOption("--client <clientId>")
  .action(async (opts) => {
    const result = await engine.runKyc(opts.client);
    console.log(JSON.stringify(result, null, 2));
  });

const suitability = program.command("suitability");
suitability
  .command("score")
  .description("Score suitability")
  .requiredOption("--client <clientId>")
  .option("--riskTolerance <tolerance>", "Moderate")
  .option("--experience <years>", "0")
  .option("--crypto", "Evaluate crypto suitability", false)
  .action(async (opts) => {
    const summary = await engine.scoreSuitability({
      clientId: opts.client,
      riskTolerance: opts.riskTolerance,
      objectives: [],
      timeHorizon: "Medium",
      liquidityNeeds: "Moderate",
      experienceYears: Number(opts.experience),
      crypto: Boolean(opts.crypto),
      questionnaire: {},
    });
    console.log(JSON.stringify(summary, null, 2));
  });

const docs = program.command("docs");
docs
  .command("generate")
  .description("Generate documents")
  .requiredOption("--accountapp <id>")
  .option("--set <set...>", "FORM_CRS")
  .action((opts) => {
    const docsResult = engine.generateDocuments(opts.accountapp, opts.set ?? ["FORM_CRS"]);
    console.log(JSON.stringify(docsResult, null, 2));
  });

const esign = program.command("esign");
esign
  .command("send")
  .description("Send e-sign envelope")
  .requiredOption("--accountapp <id>")
  .option("--doc <doc...>", "ADV_AGREEMENT")
  .action(async (opts) => {
    const envelope = await sendEnvelope(engine, opts.accountapp, opts.doc ?? ["ADV_AGREEMENT"]);
    console.log(JSON.stringify(envelope, null, 2));
  });

esign
  .command("sync")
  .description("Sync e-sign envelope")
  .requiredOption("--envelope <id>")
  .action(async (opts) => {
    const status = await syncEnvelope(engine, opts.envelope);
    console.log(JSON.stringify(status, null, 2));
  });

const gate = program.command("gate");
gate
  .command("check")
  .description("Evaluate a gate")
  .requiredOption("--client <id>")
  .requiredOption("--action <action>")
  .action((opts) => {
    const gateResult = gates.evaluate(opts.client, opts.action);
    console.log(JSON.stringify(gateResult, null, 2));
  });

const wallet = program.command("wallet");
wallet
  .command("add")
  .description("Register and screen a wallet")
  .requiredOption("--client <id>")
  .requiredOption("--chain <chain>")
  .requiredOption("--address <address>")
  .option("--label <label>")
  .action(async (opts) => {
    const walletResult = await engine.addWallet(opts.client, opts.chain, opts.address, opts.label);
    console.log(JSON.stringify(walletResult, null, 2));
  .command('breaks')
  .option('--status <status>', 'Break status')
  .action(async (opts) => {
    const breaks = await prisma.reconBreak.findMany({ where: { status: opts.status } });
    breaks.forEach((br) => {
      console.log(`${br.id} ${br.scope} ${br.status} delta=${Number(br.internal ?? 0) - Number(br.external ?? 0)}`);
    });
  });

const statements = program.command('statements');

statements
  .command('generate')
  .requiredOption('--account <id>', 'Account ID')
  .requiredOption('--period <period>', 'Period identifier e.g. 2025Q3')
  .action(async (opts) => {
    const spinner = ora('Generating statement').start();
    try {
      const path = await statementService.generateStatement(opts.account, opts.period);
      spinner.succeed(`Statement created at ${path}`);
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

const audit = program.command('audit');

audit
  .command('export')
  .requiredOption('--account <id>', 'Account ID')
  .requiredOption('--from <date>', 'From date')
  .requiredOption('--to <date>', 'To date')
  .requiredOption('--out <path>', 'Output zip path')
  .action(async (opts) => {
    const spinner = ora('Exporting audit package').start();
    try {
      const path = await auditExporter.export({
        accountId: opts.account,
        from: new Date(opts.from),
        to: new Date(opts.to),
        outputPath: opts.out
      });
      spinner.succeed(`Audit export ready at ${path}`);
    } catch (err) {
      spinner.fail((err as Error).message);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
  .command("summary")
  .description("Render disclosure summary")
  .option("--format <fmt>", "Output format (md|json)", "md")
  .option("--out <dir>", "Output directory", DEFAULT_OUT)
  .action(async (options) => {
    const outDir = path.resolve(options.out ?? DEFAULT_OUT);
    const payload = await readJson<{ disclosures: NormDisclosureRecord[] }>(outDir, NORM_FILE);
    if (options.format === "json") {
      process.stdout.write(JSON.stringify(payload.disclosures, null, 2));
      return;
    }
    const summary = renderSummary(payload.disclosures);
    process.stdout.write(summary);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error.message);
main().catch((err) => {
  console.error(err);
  process.exit(1);
===
impoimport { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { ingestBrokerCheck } from "./commands/ingest.js";
import { syncCommand } from "./commands/sync.js";
import { planCommand } from "./commands/plan.js";
import { gateCommand } from "./commands/gate.js";

const program = new Command();
program
  .name("blackroad-lic")
  .description("BlackRoad licensing orchestrator CLI")
  .version("0.1.0");

program
  .command("init")
  .requiredOption("--person <name>", "Legal name of the person")
  .option("--crd <number>", "CRD number")
  .requiredOption("--home <state>", "Home state (e.g., MN)")
  .requiredOption("--tracks <list>", "Comma separated tracks (securities,insurance,real_estate)")
  .requiredOption("--states <list>", "Comma separated target states")
  .action((options) => {
    initCommand(options);
  });

program
  .command("ingest")
  .description("Ingest external data sources")
  .command("brokercheck <file>")
  .description("Parse BrokerCheck PDF")
  .action(async (file: string) => {
    await ingestBrokerCheck(file);
  });

program
  .command("sync")
  .description("Sync license data from state portals")
  .option("--states <list>", "States to sync, default all")
  .option("--tracks <list>", "Tracks to sync, default all")
  .action((options) => {
    syncCommand(options);
  });

program
  .command("plan")
  .description("Generate reinstatement plan")
  .requiredOption("--states <list|all>", "States to include or 'all'")
  .requiredOption("--tracks <list|all>", "Tracks to include or 'all'")
  .option("--out <path>", "Optional output file")
  .option("--print-md", "Print markdown summary", false)
  .action((options) => {
    planCommand({
      states: options.states,
      tracks: options.tracks,
      out: options.out,
      printMd: options.printMd,
    });
  });

program
  .command("gate")
  .description("Evaluate compliance gates")
  .requiredOption("--action <advise|sell-insurance|trade-bd>", "Action to evaluate")
  .requiredOption("--state <state>", "State code")
  .option("--line <line>", "Insurance line for sell-insurance action")
  .action((options) => {
    gateCommand(options);
  });

program.parseAsync(process.argv).catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exitCode = 1;
>>>>>>>+bd8839e6f7b2a63

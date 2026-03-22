#!/usr/bin/env node
/*
 * Lightweight controller to nudge low-power miners toward lower stales and thermals.
 *
 * - Polls Prism's miner telemetry API for recent samples
 * - Scores profiles using a UCB1 multi-armed bandit
 * - Applies pool changes via XMRig HTTP config
 * - Enforces a duty cycle and thermal pause gate
 */

import { setTimeout as delay } from 'node:timers/promises';
import { exec as execCb } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';

const exec = promisify(execCb);

const PRISM_API_URL = (process.env.PRISM_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const PRISM_API_TOKEN = process.env.PRISM_API_TOKEN ?? '';
const MINER_ID = process.env.MINER_ID ?? 'xmrig';
const XMRIG_API_URL = (process.env.XMRIG_API_URL ?? 'http://localhost:18080').replace(/\/$/, '');
const XMRIG_API_TOKEN = process.env.XMRIG_API_TOKEN ?? '';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 60_000);
const CYCLE_SECONDS = Number(process.env.DUTY_CYCLE_SECONDS ?? 900);
const THERMAL_LIMIT = Number(process.env.THERMAL_LIMIT ?? 80);
const COOLDOWN_MINUTES = Number(process.env.COOLDOWN_MINUTES ?? 10);
const COMPOSE_FILE = process.env.COMPOSE_FILE ?? 'miners/miners-compose.yml';
const DOCKER_SERVICE = process.env.DOCKER_SERVICE ?? 'xmrig';

const PROFILE_CONFIG_PATH = process.env.PROFILE_CONFIG_PATH ?? process.env.PROFILES_FILE ?? '';

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.profiles)) {
    return value.profiles;
  }
  return [];
}

function normalizeProfile(raw, index) {
  if (!raw || typeof raw !== 'object') return null;
  const name = raw.name ?? `profile-${index + 1}`;
  const dutyValue = Number(raw.duty ?? raw.pool?.duty);
  const duty = Number.isFinite(dutyValue) ? Math.min(Math.max(dutyValue, 0), 1) : 1.0;
  const tlsValue = raw.pool?.tls ?? raw.tls ?? false;
  const pool = {
    url: raw.pool?.url ?? raw.url ?? '',
    user: raw.pool?.user ?? raw.user ?? '',
    pass: raw.pool?.pass ?? raw.pass ?? 'x',
    tls:
      typeof tlsValue === 'string'
        ? ['true', '1', 'yes', 'on'].includes(tlsValue.toLowerCase())
        : Boolean(tlsValue),
  };
  if (!pool.url || !pool.user) {
    return null;
  }
  return {
    name,
    pool,
    duty,
  };
}

function loadProfilesFromEnv() {
  return [
    {
      name: 'pool-a',
      pool: {
        url: process.env.POOL_A_URL ?? 'stratum+tcp://poolA:3333',
        user: process.env.POOL_A_USER ?? 'WALLET_OR_LOGIN',
        pass: process.env.POOL_A_PASS ?? 'x',
        tls: process.env.POOL_A_TLS === 'true',
      },
      duty: Number(process.env.POOL_A_DUTY ?? 1.0),
    },
    {
      name: 'pool-b',
      pool: {
        url: process.env.POOL_B_URL ?? 'stratum+tcp://poolB:443',
        user: process.env.POOL_B_USER ?? 'WALLET_OR_LOGIN',
        pass: process.env.POOL_B_PASS ?? 'x',
        tls: process.env.POOL_B_TLS !== 'false',
      },
      duty: Number(process.env.POOL_B_DUTY ?? 0.8),
    },
    {
      name: 'p2pool-local',
      pool: {
        url: process.env.P2POOL_URL ?? 'stratum+tcp://p2pool:3333',
        user: process.env.P2POOL_USER ?? 'WALLET_OR_LOGIN',
        pass: process.env.P2POOL_PASS ?? 'x',
        tls: false,
      },
      duty: Number(process.env.P2POOL_DUTY ?? 1.0),
    },
  ].filter((profile) => profile.pool.url && profile.pool.user);
}

function loadYamlModule() {
  try {
    const require = createRequire(import.meta.url);
    const yaml = require('yaml');
    if (yaml?.parse) {
      return yaml.parse;
    }
  } catch (error) {
    throw new Error(
      "YAML profile config requested but the 'yaml' package is not installed. Install it or provide a JSON file."
    );
  }
  throw new Error("Unable to load YAML parser from the 'yaml' package.");
}

function loadProfilesFromFile(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  const ext = path.extname(absolutePath).toLowerCase();
  let document;
  if (ext === '.yaml' || ext === '.yml') {
    const parse = loadYamlModule();
    document = parse(raw);
  } else {
    document = JSON.parse(raw);
  }
  return asArray(document)
    .map((profile, index) => normalizeProfile(profile, index))
    .filter((profile) => profile);
}

function loadProfiles() {
  if (!PROFILE_CONFIG_PATH) {
    return loadProfilesFromEnv();
  }
  try {
    const loaded = loadProfilesFromFile(PROFILE_CONFIG_PATH);
    if (loaded.length === 0) {
      console.warn(
        `[controller] profile config ${PROFILE_CONFIG_PATH} did not contain any usable entries; falling back to env defaults`
      );
      return loadProfilesFromEnv();
    }
    console.log(`[controller] loaded ${loaded.length} profiles from ${PROFILE_CONFIG_PATH}`);
    return loaded;
  } catch (error) {
    console.error(`[controller] failed to load profiles from ${PROFILE_CONFIG_PATH}: ${error.message ?? error}`);
    process.exit(1);
  }
}

const profiles = loadProfiles();

const stats = new Map(profiles.map((p) => [p.name, { plays: 0, reward: 0 }]));
const lastSampleSeen = new Map();
let currentProfile = null;
let lastCycleStart = Date.now();
let forcedPauseUntil = 0;
let lastPauseState = null;

function formatRelative(timestamp) {
  const delta = Date.now() - new Date(timestamp).getTime();
  if (!Number.isFinite(delta) || delta < 0) return 'now';
  const seconds = Math.floor(delta / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function scoreSample(sample) {
  if (!sample) return 0;
  const effective = sample.effective_hashrate ?? sample.hashrate_1m ?? 0;
  const staleRate = sample.stale_rate ?? 0;
  const temperature = sample.temperature_c ?? 0;
  const stalePenalty = staleRate > 0.02 ? (staleRate * 200) : staleRate * 50;
  const thermalPenalty = temperature > THERMAL_LIMIT ? (temperature - THERMAL_LIMIT) * 0.5 : 0;
  return effective - stalePenalty - thermalPenalty;
}

function selectProfile(samplesByPool) {
  const totalPlays = Array.from(stats.values()).reduce((sum, value) => sum + value.plays, 0) || 1;
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const profile of profiles) {
    const state = stats.get(profile.name);
    const sample = samplesByPool.get(profile.pool.url) ?? samplesByPool.get(profile.name);
    const reward = scoreSample(sample);
  const sampleStamp = sample?.recorded_at ?? sample?.timestamp ?? null;
    if (sample && sampleStamp && lastSampleSeen.get(profile.name) !== sampleStamp) {
      state.reward += reward;
      state.plays += 1;
      lastSampleSeen.set(profile.name, sampleStamp);
    }
    const mean = state.plays ? state.reward / state.plays : 0;
    const exploration = state.plays ? Math.sqrt((2 * Math.log(totalPlays + 1)) / state.plays) : Number.POSITIVE_INFINITY;
    const ucb = mean + exploration;
    if (ucb > bestScore) {
      bestScore = ucb;
      best = profile;
    }
  }
  return best ?? profiles[0];
}

async function fetchLatestSamples() {
  const url = `${PRISM_API_URL}/api/miners/latest?minerId=${encodeURIComponent(MINER_ID)}`;
  const headers = PRISM_API_TOKEN ? { Authorization: `Bearer ${PRISM_API_TOKEN}` } : undefined;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch miner samples: ${response.status}`);
  }
  return response.json();
}

async function getConfig() {
  const headers = XMRIG_API_TOKEN ? { Authorization: `Bearer ${XMRIG_API_TOKEN}` } : undefined;
  const response = await fetch(`${XMRIG_API_URL}/1/config`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to read xmrig config: ${response.status}`);
  }
  return response.json();
}

async function putConfig(config) {
  const headers = { 'Content-Type': 'application/json' };
  if (XMRIG_API_TOKEN) headers.Authorization = `Bearer ${XMRIG_API_TOKEN}`;
  const response = await fetch(`${XMRIG_API_URL}/1/config`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error(`Failed to update xmrig config: ${response.status}`);
  }
}

async function applyProfile(profile) {
  const config = await getConfig();
  const base = Array.isArray(config.pools) && config.pools.length > 0 ? config.pools[0] : {};
  const updatedPool = {
    ...base,
    url: profile.pool.url,
    user: profile.pool.user,
    pass: profile.pool.pass ?? 'x',
    tls: Boolean(profile.pool.tls),
  };
  config.pools = [updatedPool];
  await putConfig(config);
  currentProfile = profile;
  lastCycleStart = Date.now();
  console.log(`[controller] switched to ${profile.name} → ${profile.pool.url}`);
}

async function setMiningActive(active) {
  if (!COMPOSE_FILE) return;
  if (lastPauseState === active) return;
  const action = active ? 'unpause' : 'pause';
  try {
    await exec(`docker compose -f ${COMPOSE_FILE} ${action} ${DOCKER_SERVICE}`);
    lastPauseState = active;
    console.log(`[controller] docker compose ${action} ${DOCKER_SERVICE}`);
  } catch (error) {
    console.warn('[controller] failed to toggle docker compose state', error.message ?? error);
  }
}

function reconcileDutyCycle(profile) {
  if (!profile) return;
  if (profile.duty >= 0.999) {
    if (Date.now() > forcedPauseUntil) {
      setMiningActive(true).catch(console.error);
    }
    return;
  }
  const elapsed = (Date.now() - lastCycleStart) / 1000;
  const cycle = CYCLE_SECONDS;
  const onWindow = cycle * profile.duty;
  const phase = elapsed % cycle;
  const shouldMine = phase < onWindow && Date.now() > forcedPauseUntil;
  setMiningActive(shouldMine).catch(console.error);
}

function ensureCooldown(sample) {
  if (!sample?.temperature_c) return;
  if (sample.temperature_c <= THERMAL_LIMIT) {
    if (forcedPauseUntil && Date.now() > forcedPauseUntil) {
      forcedPauseUntil = 0;
      console.log('[controller] thermal cooldown finished');
    }
    return;
  }
  forcedPauseUntil = Date.now() + COOLDOWN_MINUTES * 60_000;
  console.warn(
    `[controller] temp ${sample.temperature_c.toFixed(1)}°C > ${THERMAL_LIMIT}°C → pausing for ${COOLDOWN_MINUTES}m`
  );
  setMiningActive(false).catch(console.error);
}

function mapSamples(samplesResponse) {
  const samplesByPool = new Map();
  if (!samplesResponse?.samples) return samplesByPool;
  for (const sample of samplesResponse.samples) {
    const key = sample.pool ?? sample.profile ?? 'default';
    samplesByPool.set(key, sample);
  }
  return samplesByPool;
}

async function loop() {
  if (profiles.length === 0) {
    console.error('[controller] no profiles defined; aborting');
    process.exit(1);
  }

  while (true) {
    try {
      const data = await fetchLatestSamples();
      const samplesByPool = mapSamples(data);
      const nextProfile = selectProfile(samplesByPool);
      const activeSample = samplesByPool.get(nextProfile.pool.url);
      ensureCooldown(activeSample);
      if (!currentProfile || currentProfile.name !== nextProfile.name) {
        await applyProfile(nextProfile);
      }
      reconcileDutyCycle(nextProfile);
      if (activeSample?.last_share_at) {
        console.log(
          `[controller] ${nextProfile.name} effective ${(activeSample.effective_hashrate ?? activeSample.hashrate_1m ?? 0).toFixed(1)} H/s · stale ${(activeSample.stale_rate * 100).toFixed(2)}% · last share ${formatRelative(activeSample.last_share_at)}`
        );
      }
    } catch (error) {
      console.warn('[controller] loop error', error?.message ?? error);
    }
    await delay(POLL_INTERVAL_MS);
  }
}

loop().catch((error) => {
  console.error('[controller] fatal', error);
  process.exit(1);
});

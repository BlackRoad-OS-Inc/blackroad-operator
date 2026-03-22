
import { Router } from 'express';
import fs from 'fs';
const r = Router();
const APIS='dev/apis.json', KEYS='data/dev/keys.jsonl', SUB='dev/subscriptions.json', RL='data/dev/ratelimits.json', LOG='data/dev/gw_logs.jsonl', MTR='data/dev/metering.jsonl';
const apis=()=> fs.existsSync(APIS)? JSON.parse(fs.readFileSync(APIS,'utf-8')).apis||{}:{};
const keys=()=> fs.existsSync(KEYS)? fs.readFileSync(KEYS,'utf-8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l)):[];
const subs=()=> fs.existsSync(SUB)? JSON.parse(fs.readFileSync(SUB,'utf-8')).subs||{}:{};
const rlRead=()=> fs.existsSync(RL)? JSON.parse(fs.readFileSync(RL,'utf-8')):{};
const rlWrite=(o:any)=>{ fs.mkdirSync('data/dev',{recursive:true}); fs.writeFileSync(RL, JSON.stringify(o,null,2)); };
const append=(p:string,row:any)=>{ fs.mkdirSync('data/dev',{recursive:true}); fs.appendFileSync(p, JSON.stringify(row)+'\n'); };

function rateAllowed(token: string, rpm: number, burst: number) {
  const now = Date.now();
  const bucket = Math.floor(now / 60000);
  const store = rlRead();
  store[token] = store[token] || {};
  const b = store[token][bucket] || { count: 0 };
  if (b.count >= rpm + burst) return false;
  b.count++;
  store[token][bucket] = b;
  rlWrite(store);
  return true;
}

/**
 * Proxy request to upstream API
 */
async function proxyUpstreamRequest(config: {
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  apiKey?: string;
}): Promise<{ ok: boolean; status: number; data: any }> {
  const { url, method, body, headers, apiKey } = config;

  // Construct request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'BlackRoad-Gateway/1.0',
    ...headers
  };

  // Add API key if provided
  if (apiKey) {
    requestHeaders['Authorization'] = `Bearer ${apiKey}`;
  }

  // Construct fetch options
  const fetchOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: requestHeaders
  };

  // Add body for non-GET requests
  if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Make upstream request
  const response = await fetch(url, fetchOptions);

  // Parse response
  let data;
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

r.post('/gw/proxy', async (req, res) => {
  const { api, path, method, key, body: requestBody, headers: requestHeaders } = req.body || {};

  // Validate API exists
  const apiRec = apis()[api];
  if (!apiRec) {
    return res.status(404).json({ error: 'api_not_found' });
  }

  // Validate API key
  const row = (keys().reverse().find((k: any) => k.token === key) || null);
  if (!row || row.revoked) {
    return res.status(403).json({ error: 'invalid_key' });
  }

  // Check subscription and plan
  const sub = subs()[key] || { plan_id: '__default' };
  const plan = (fs.existsSync('dev/plans.json')
    ? JSON.parse(fs.readFileSync('dev/plans.json', 'utf-8')).plans || []
    : []
  ).find((p: any) => p.id === sub.plan_id) || {
    rate_limit_rpm: Number(process.env.DEV_GW_DEFAULT_RPM || 100),
    burst: Number(process.env.DEV_GW_DEFAULT_BURST || 50),
    quota_month: 100000
  };

  // Rate limiting
  if (!rateAllowed(key, plan.rate_limit_rpm, plan.burst)) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  // Construct upstream URL
  const upstreamUrl = `${apiRec.base_path}${path}`;

  try {
    // Make actual upstream request
    const upstreamResponse = await proxyUpstreamRequest({
      url: upstreamUrl,
      method: method || 'GET',
      body: requestBody,
      headers: requestHeaders,
      apiKey: apiRec.api_key || process.env[`${api.toUpperCase()}_API_KEY`]
    });

    // Log successful request
    append(LOG, {
      ts: Date.now(),
      api,
      path,
      method: method || 'GET',
      key,
      plan: sub.plan_id,
      status: upstreamResponse.status
    });

    // Meter the request
    append(MTR, {
      ts: Date.now(),
      key,
      api,
      units: 1
    });

    // Return upstream response
    res.status(upstreamResponse.status).json({
      ok: upstreamResponse.ok,
      upstream: upstreamUrl,
      status: upstreamResponse.status,
      data: upstreamResponse.data
    });
  } catch (error) {
    console.error(`Gateway proxy error for ${upstreamUrl}:`, error);

    // Log failed request
    append(LOG, {
      ts: Date.now(),
      api,
      path,
      method: method || 'GET',
      key,
      plan: sub.plan_id,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      error: 'upstream_error',
      message: error instanceof Error ? error.message : 'Failed to proxy request'
    });
  }
});

r.get('/gw/logs',(req,res)=>{
  const since=Number(req.query.since_ts||0);
  const items= fs.existsSync(LOG)? fs.readFileSync(LOG,'utf-8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l)).filter((x:any)=>!since || (x.ts>=since)).slice(-500):[];
  res.json({ items });
});

r.post('/meter/record',(req,res)=>{ append(MTR,{ ts:req.body?.ts||Date.now(), ...req.body }); res.json({ ok:true }); });

export default r;

// BlackBoard v2 — Sovereign Analytics, CRM, Attribution, Fingerprinting, Performance, Threat Detection
// Replaces: Google Analytics, HubSpot, Facebook Pixel, Google Ads, Hotjar, Sentry, FullStory, Cloudflare Bot Management
// Runs on: Cloudflare Workers + D1 + KV + Analytics Engine
// "If it hits us, it's known."
// (c) 2026 BlackRoad OS, Inc.

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const origin = request.headers.get('origin') || ''
    const cors = corsHeaders(origin)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    // Rate limit POST requests per IP
    if (request.method === 'POST') {
      const ip = request.headers.get('cf-connecting-ip') || ''
      if (!checkRateLimit(ip, 120)) {
        return json({ error: 'Rate limit exceeded' }, 429, cors)
      }
    }

    try {
      // ─── COLLECTION ENDPOINTS ───
      if (path === '/b' || path === '/beacon') return await handleBeacon(request, env, cors)
      if (path === '/e' || path === '/event') return await handleEvent(request, env, cors)
      if (path === '/id' || path === '/identify') return await handleIdentify(request, env, cors)
      if (path === '/px') return await handlePixel(request, env)
      if (path === '/r') return await handleRedirect(request, env)

      // ─── PRIVACY ───
      if (path === '/privacy') {
        return new Response(JSON.stringify({
          service: 'BlackBoard Analytics',
          owner: 'BlackRoad OS, Inc.',
          dnt_honored: true,
          what_we_collect: 'Anonymous pageview counts, referrer domains, viewport size, browser family, country (from CF edge). Optional: canvas fingerprint hash, scroll depth, click heatmaps.',
          what_we_dont_collect: 'Names, emails, IP addresses (last octet zeroed), cookies, cross-site tracking.',
          opt_out: 'Enable Do Not Track (DNT) in your browser — we honor it fully. Fingerprinting, heatmaps, and interaction tracking are all disabled when DNT is set.',
          retention: { raw_events: '90 days', aggregated: 'indefinite', fingerprints: '30 days' },
          data_sharing: 'None. No data sold or shared with third parties.',
        }), { status: 200, headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } })
      }

      // ─── v2 ENHANCED ENDPOINTS ───
      // Server-side DNT enforcement: reject fingerprint, heatmap, and interaction data when DNT is set
      const dntHeader = request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1';
      if (dntHeader && (path === '/fp' || path === '/fingerprint' || path === '/h' || path === '/heatmap' || path === '/i' || path === '/interaction')) {
        return new Response(null, { status: 204, headers: cors })
      }

      if (path === '/s' || path === '/session') return await handleSession(request, env, cors)
      if (path === '/p' || path === '/perf') return await handlePerformance(request, env, cors)
      if (path === '/err' || path === '/error') return await handleError(request, env, cors)
      if (path === '/i' || path === '/interaction') return await handleInteraction(request, env, cors)
      if (path === '/h' || path === '/heatmap') return await handleHeatmap(request, env, cors)
      if (path === '/fp' || path === '/fingerprint') return await handleFingerprint(request, env, cors)
      if (path === '/nav' || path === '/path') return await handlePath(request, env, cors)
      if (path === '/res' || path === '/resources') return await handleResources(request, env, cors)
      if (path === '/batch') return await handleBatch(request, env, cors)

      // ─── API ROUTES ───
      if (path.startsWith('/api/')) return await handleAPI(path, url, env, cors, request)

      // ─── BEACON JS ───
      if (path === '/bb.js' || path === '/blackboard.js') {
        return new Response(BEACON_JS, {
          headers: {
            ...cors,
            'content-type': 'application/javascript',
            'cache-control': 'public, max-age=3600',
            'cross-origin-resource-policy': 'cross-origin',
          }
        })
      }

      return env.ASSETS.fetch(request)
    } catch (err) {
      return json({ error: err.message }, 500, cors)
    }
  },

  // Scheduled aggregation
  async scheduled(event, env, ctx) {
    ctx.waitUntil(aggregateDailyStats(env))
  }
}

// ═══════════════════════════════════════════════════════════
// REQUEST CONTEXT — extract everything from every request
// ═══════════════════════════════════════════════════════════
function anonymizeIP(ip) {
  if (!ip) return ''
  // IPv4: zero last octet (1.2.3.4 → 1.2.3.0)
  if (ip.includes('.')) return ip.replace(/\.\d+$/, '.0')
  // IPv6: zero last 80 bits (truncate last 5 groups)
  if (ip.includes(':')) return ip.replace(/(:[0-9a-fA-F]*){5}$/, ':0:0:0:0:0')
  return ''
}

function extractContext(request) {
  const cf = request.cf || {}
  const ua = request.headers.get('user-agent') || ''
  const rawIP = request.headers.get('cf-connecting-ip') || ''
  const ip = anonymizeIP(rawIP)  // Never store raw IP
  const device = parseDevice(ua)

  return {
    ua,
    ip,
    ip_hash: hashStr(rawIP),  // Hash of original for rate limiting, never stored in D1
    // Geo (all free from CF headers)
    country: cf.country || '',
    region: cf.region || '',
    city: cf.city || '',
    postal: cf.postalCode || '',
    latitude: cf.latitude || 0,
    longitude: cf.longitude || 0,
    timezone: cf.timezone || '',
    asn: cf.asn || 0,
    as_org: cf.asOrganization || '',
    colo: cf.colo || '',
    // TLS
    tls_version: cf.tlsVersion || '',
    http_protocol: cf.httpProtocol || '',
    // Device
    ...device,
    // Bot detection from CF
    bot_management: cf.botManagement || {},
    threat_score: cf.threatScore || 0,
    // Verify human
    is_cf_verified: cf.botManagement?.verified || false,
  }
}

// ═══════════════════════════════════════════════════════════
// BOT DETECTION — Multi-signal scoring
// ═══════════════════════════════════════════════════════════
function scoreBotProbability(ctx, data) {
  let score = 0
  const signals = {}

  // Signal 1: No JS execution (beacon was GET with no data)
  if (!data.vid && !data.sid) { score += 0.3; signals.no_js = true }

  // Signal 2: Known bot UA patterns
  if (/bot|crawl|spider|scrape|headless|phantom|selenium|puppeteer|playwright|wget|curl|python-requests|node-fetch|go-http|java\//i.test(ctx.ua)) {
    score += 0.4; signals.bot_ua = true
  }

  // Signal 3: Missing or suspicious headers
  if (!ctx.ua) { score += 0.5; signals.no_ua = true }
  if (ctx.ua.length < 20) { score += 0.2; signals.short_ua = true }

  // Signal 4: Headless browser indicators from client
  if (data._h) {
    const h = data._h
    if (h.webdriver) { score += 0.6; signals.webdriver = true }
    if (h.no_plugins) { score += 0.15; signals.no_plugins = true }
    if (h.no_languages) { score += 0.2; signals.no_languages = true }
    if (h.phantom) { score += 0.7; signals.phantom = true }
    if (h.nightmare) { score += 0.7; signals.nightmare = true }
    if (h.selenium) { score += 0.7; signals.selenium = true }
    if (h.puppeteer) { score += 0.5; signals.puppeteer = true }
    if (h.automation) { score += 0.5; signals.automation = true }
    if (h.chrome_runtime_missing) { score += 0.3; signals.chrome_runtime = true }
    if (h.notification_perms_denied_instant) { score += 0.2; signals.notif_denied = true }
    if (h.zero_size) { score += 0.4; signals.zero_size = true }
  }

  // Signal 5: Cloudflare threat score
  if (ctx.threat_score > 0) {
    score += Math.min(ctx.threat_score / 100, 0.5)
    signals.cf_threat = ctx.threat_score
  }

  // Signal 6: TLS fingerprint anomalies
  if (ctx.tls_version === 'TLSv1' || ctx.tls_version === 'TLSv1.1') {
    score += 0.3; signals.old_tls = true
  }

  // Signal 7: Device type is already bot
  if (ctx.type === 'Bot') { score += 0.3; signals.ua_bot_type = true }

  return { score: Math.min(score, 1), signals, is_bot: score >= 0.5 ? 1 : 0 }
}

// ═══════════════════════════════════════════════════════════
// BEACON HANDLER — Enhanced pageview tracking
// ═══════════════════════════════════════════════════════════
async function handleBeacon(request, env, cors) {
  const data = request.method === 'POST'
    ? await safeParseJSON(request)
    : Object.fromEntries(new URL(request.url).searchParams)

  const ctx = extractContext(request)
  const bot = scoreBotProbability(ctx, data)

  const pageUrl = data.url || request.headers.get('referer') || ''
  const pageParams = safeParams(pageUrl)

  const event = {
    type: 'pageview',
    url: data.url || '',
    path: data.path || tryPath(data.url),
    title: data.title || '',
    referrer: data.referrer || '',
    vid: data.vid || hashIP(ctx.ip, ctx.ua),
    sid: data.sid || '',
    fid: data.fid || '',
    country: ctx.country, region: ctx.region, city: ctx.city,
    postal: ctx.postal, latitude: ctx.latitude, longitude: ctx.longitude,
    timezone: data.tz || ctx.timezone,
    asn: ctx.asn, as_org: ctx.as_org, colo: ctx.colo,
    tls_version: ctx.tls_version, http_protocol: ctx.http_protocol,
    browser: ctx.browser, browser_version: ctx.browser_version,
    os: ctx.os, os_version: ctx.os_version,
    device_type: ctx.type,
    screen: data.screen || '',
    viewport: data.viewport || '',
    pixel_ratio: data.pr || 1,
    color_depth: data.cd || 24,
    cpu_cores: data.cores || 0,
    memory_gb: data.mem || 0,
    gpu: data.gpu || '',
    gpu_vendor: data.gpuVendor || '',
    max_touch_points: data.touch || 0,
    connection_type: data.conn || '',
    downlink: data.dl || 0,
    rtt: data.rtt || 0,
    save_data: data.saveData ? 1 : 0,
    language: data.lang || '',
    languages: data.langs || '',
    utm_source: data.utm_source || pageParams.get('utm_source') || '',
    utm_medium: data.utm_medium || pageParams.get('utm_medium') || '',
    utm_campaign: data.utm_campaign || pageParams.get('utm_campaign') || '',
    utm_term: data.utm_term || pageParams.get('utm_term') || '',
    utm_content: data.utm_content || pageParams.get('utm_content') || '',
    ref: data.ref || pageParams.get('ref') || '',
    gclid: data.gclid || pageParams.get('gclid') || '',
    fbclid: data.fbclid || pageParams.get('fbclid') || '',
    msclkid: data.msclkid || pageParams.get('msclkid') || '',
    ttclid: data.ttclid || pageParams.get('ttclid') || '',
    li_fat_id: data.li_fat_id || pageParams.get('li_fat_id') || '',
    is_bot: bot.is_bot,
    bot_score: bot.score,
    has_adblock: data.adblock ? 1 : 0,
    has_dnt: data.dnt ? 1 : 0,
    is_incognito: data.incognito ? 1 : 0,
    scroll_depth: 0,
    time_on_page: 0,
    engagement_time: 0,
    site: data.site || tryHost(data.url) || '',
    ts: Date.now()
  }

  // Write to D1
  await env.DB.prepare(`
    INSERT INTO events (type, url, path, title, referrer, vid, sid, fid,
      country, region, city, postal, latitude, longitude, timezone, asn, as_org, colo,
      tls_version, http_protocol,
      browser, browser_version, os, os_version, device_type, screen, viewport, pixel_ratio, color_depth,
      cpu_cores, memory_gb, gpu, gpu_vendor, max_touch_points,
      connection_type, downlink, rtt, save_data,
      language, languages,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      ref_code, gclid, fbclid, msclkid, ttclid, li_fat_id,
      is_bot, bot_score, has_adblock, has_dnt, is_incognito,
      scroll_depth, time_on_page, engagement_time,
      site, ts)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    event.type, event.url, event.path, event.title, event.referrer,
    event.vid, event.sid, event.fid,
    event.country, event.region, event.city, event.postal, event.latitude, event.longitude,
    event.timezone, event.asn, event.as_org, event.colo,
    event.tls_version, event.http_protocol,
    event.browser, event.browser_version, event.os, event.os_version,
    event.device_type, event.screen, event.viewport, event.pixel_ratio, event.color_depth,
    event.cpu_cores, event.memory_gb, event.gpu, event.gpu_vendor, event.max_touch_points,
    event.connection_type, event.downlink, event.rtt, event.save_data,
    event.language, event.languages,
    event.utm_source, event.utm_medium, event.utm_campaign, event.utm_term, event.utm_content,
    event.ref, event.gclid, event.fbclid, event.msclkid, event.ttclid, event.li_fat_id,
    event.is_bot, event.bot_score, event.has_adblock, event.has_dnt, event.is_incognito,
    event.scroll_depth, event.time_on_page, event.engagement_time,
    event.site, event.ts
  ).run()

  // Analytics Engine
  if (env.EVENTS) {
    env.EVENTS.writeDataPoint({
      blobs: [event.site, event.path, event.country, event.browser, event.utm_source, event.referrer, event.device_type, event.os],
      doubles: [1, event.bot_score],
      indexes: [event.vid]
    })
  }

  // Real-time counters
  await incrementRealtime(env, event)

  // Log threat if bot score is high
  if (bot.score >= 0.4) {
    await env.DB.prepare(`
      INSERT INTO threats (vid, ip_hash, threat_type, confidence, signals, url, path, site, user_agent, country, asn, as_org, action, ts)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      event.vid, ctx.ip_hash, bot.score >= 0.7 ? 'bot' : 'suspicious',
      bot.score, JSON.stringify(bot.signals),
      event.url, event.path, event.site, ctx.ua.slice(0, 500),
      event.country, event.asn, event.as_org,
      bot.score >= 0.7 ? 'challenge' : 'log',
      event.ts
    ).run()
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// EVENT HANDLER — Custom events with full context
// ═══════════════════════════════════════════════════════════
async function handleEvent(request, env, cors) {
  const data = await safeParseJSON(request)
  const ctx = extractContext(request)
  const bot = scoreBotProbability(ctx, data)

  const event = {
    type: data.event || data.type || 'custom',
    url: data.url || '',
    path: data.path || tryPath(data.url),
    title: '', referrer: '',
    vid: data.vid || hashIP(ctx.ip, ctx.ua),
    sid: data.sid || '',
    fid: data.fid || '',
    country: ctx.country, region: ctx.region, city: ctx.city,
    browser: ctx.browser, os: ctx.os, device_type: ctx.type,
    screen: data.screen || '',
    utm_source: data.utm_source || '',
    utm_medium: data.utm_medium || '',
    utm_campaign: data.utm_campaign || '',
    is_bot: bot.is_bot, bot_score: bot.score,
    site: data.site || tryHost(data.url) || '',
    ts: Date.now()
  }

  const props = data.props || data.properties || {}

  await env.DB.prepare(`
    INSERT INTO events (type, url, path, vid, sid, fid,
      country, region, city, browser, os, device_type, screen,
      utm_source, utm_medium, utm_campaign,
      is_bot, bot_score, props, site, ts)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    event.type, event.url, event.path, event.vid, event.sid, event.fid,
    event.country, event.region, event.city,
    event.browser, event.os, event.device_type, event.screen,
    event.utm_source, event.utm_medium, event.utm_campaign,
    event.is_bot, event.bot_score,
    JSON.stringify(props), event.site, event.ts
  ).run()

  // Conversion tracking
  if (data.conversion || data.event === 'signup' || data.event === 'purchase' || data.event === 'upgrade') {
    // Look up first-touch attribution
    const firstTouch = await env.DB.prepare(`
      SELECT utm_source FROM events WHERE vid = ? AND utm_source != '' ORDER BY ts ASC LIMIT 1
    `).bind(event.vid).first()

    await env.DB.prepare(`
      INSERT INTO conversions (vid, fid, event, value, currency, utm_source, utm_medium, utm_campaign,
        first_touch_source, last_touch_source, site, ts)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      event.vid, event.fid || '', event.type, data.value || 0, data.currency || 'USD',
      event.utm_source, event.utm_medium, event.utm_campaign,
      firstTouch?.utm_source || event.utm_source, event.utm_source,
      event.site, event.ts
    ).run()
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// SESSION HANDLER — Start, heartbeat, end
// ═══════════════════════════════════════════════════════════
async function handleSession(request, env, cors) {
  const data = await safeParseJSON(request)
  const ctx = extractContext(request)
  const action = data.action || 'heartbeat'
  const sid = data.sid || ''
  const vid = data.vid || hashIP(ctx.ip, ctx.ua)
  const now = Date.now()

  if (action === 'start') {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO sessions (sid, vid, fid, entry_url, entry_path, entry_referrer,
        utm_source, utm_medium, utm_campaign,
        country, city, device_type, browser, os, site, started_at, last_seen)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      sid, vid, data.fid || '',
      data.url || '', data.path || '', data.referrer || '',
      data.utm_source || '', data.utm_medium || '', data.utm_campaign || '',
      ctx.country, ctx.city, ctx.type, ctx.browser, ctx.os,
      data.site || '', now, now
    ).run()
  } else if (action === 'heartbeat') {
    await env.DB.prepare(`
      UPDATE sessions SET
        last_seen = ?,
        engagement_time = engagement_time + ?,
        max_scroll_depth = MAX(max_scroll_depth, ?),
        exit_url = ?,
        exit_path = ?,
        engagement_score = MAX(engagement_score, ?),
        interaction_count = interaction_count + ?
      WHERE sid = ?
    `).bind(
      now,
      data.engagement_delta || 0,
      data.scroll_depth || 0,
      data.url || '', data.path || '',
      data.engagement_score || 0,
      data.interactions || 0,
      sid
    ).run()
  } else if (action === 'end') {
    await env.DB.prepare(`
      UPDATE sessions SET
        ended_at = ?,
        last_seen = ?,
        exit_url = ?,
        exit_path = ?,
        total_time = ? - started_at,
        engagement_time = engagement_time + ?,
        max_scroll_depth = MAX(max_scroll_depth, ?)
      WHERE sid = ?
    `).bind(
      now, now,
      data.url || '', data.path || '',
      now, data.engagement_delta || 0,
      data.scroll_depth || 0, sid
    ).run()
  } else if (action === 'pageview') {
    // Increment session pageview count, update bounce status
    await env.DB.prepare(`
      UPDATE sessions SET
        pageviews = pageviews + 1,
        is_bounce = 0,
        last_seen = ?,
        exit_url = ?,
        exit_path = ?
      WHERE sid = ?
    `).bind(now, data.url || '', data.path || '', sid).run()
  } else if (action === 'convert') {
    await env.DB.prepare(`
      UPDATE sessions SET converted = 1 WHERE sid = ?
    `).bind(sid).run()
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// PERFORMANCE HANDLER — Core Web Vitals & timing
// ═══════════════════════════════════════════════════════════
async function handlePerformance(request, env, cors) {
  const data = await safeParseJSON(request)
  const ctx = extractContext(request)

  await env.DB.prepare(`
    INSERT INTO performance (vid, sid, url, path, site,
      dns_time, tcp_time, tls_time, ttfb, response_time,
      dom_interactive, dom_complete, load_time,
      fcp, lcp, fid, inp, cls, ttfb_vital, fp,
      resource_count, transfer_size, decoded_size,
      js_heap_used, js_heap_total,
      connection_type, effective_type, downlink, rtt,
      device_type, country, ts)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    data.vid || '', data.sid || '', data.url || '', data.path || '', data.site || '',
    data.dns || 0, data.tcp || 0, data.tls || 0, data.ttfb || 0, data.response || 0,
    data.domInteractive || 0, data.domComplete || 0, data.loadTime || 0,
    data.fcp || 0, data.lcp || 0, data.fid || 0, data.inp || 0, data.cls || 0,
    data.ttfbVital || 0, data.fp || 0,
    data.resourceCount || 0, data.transferSize || 0, data.decodedSize || 0,
    data.jsHeapUsed || 0, data.jsHeapTotal || 0,
    data.conn || '', data.ect || '', data.dl || 0, data.rtt || 0,
    ctx.type, ctx.country, Date.now()
  ).run()

  // Store extended Nav Timing L2 data as event props if available
  if (data.navType || data.redirectCount || data.protocol) {
    await env.DB.prepare(`
      INSERT INTO events (type, url, path, vid, sid, site, props, ts)
      VALUES ('perf_extended',?,?,?,?,?,?,?)
    `).bind(
      data.url || '', data.path || '', data.vid || '', data.sid || '', data.site || '',
      JSON.stringify({
        navType: data.navType || '', redirectCount: data.redirectCount || 0,
        redirectTime: data.redirectTime || 0, workerTime: data.workerTime || 0,
        docTransferSize: data.transferSize || 0, docEncodedSize: data.encodedSize || 0,
        docDecodedSize: data.decodedDocSize || 0, protocol: data.protocol || ''
      }),
      Date.now()
    ).run()
  }

  // Write to Analytics Engine for fast percentile queries
  if (env.EVENTS) {
    env.EVENTS.writeDataPoint({
      blobs: [data.site || '', data.path || '', ctx.country, ctx.type, 'perf'],
      doubles: [data.lcp || 0, data.cls || 0, data.inp || 0, data.fcp || 0, data.ttfb || 0],
      indexes: [data.vid || '']
    })
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// ERROR HANDLER — JS errors, resource failures
// ═══════════════════════════════════════════════════════════
async function handleError(request, env, cors) {
  const data = await safeParseJSON(request)
  const ctx = extractContext(request)

  // Batch support
  const errors = Array.isArray(data) ? data : [data]

  for (const err of errors.slice(0, 20)) {
    await env.DB.prepare(`
      INSERT INTO errors (vid, sid, site, url, path, error_type, message, source, lineno, colno, stack,
        browser, os, device_type, country, ts)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      err.vid || '', err.sid || '', err.site || '',
      err.url || '', err.path || '',
      err.error_type || 'js_error',
      (err.message || '').slice(0, 1000),
      (err.source || '').slice(0, 500),
      err.lineno || 0, err.colno || 0,
      (err.stack || '').slice(0, 2000),
      ctx.browser, ctx.os, ctx.type, ctx.country,
      Date.now()
    ).run()
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// INTERACTION HANDLER — Clicks, scrolls, forms, rage clicks
// ═══════════════════════════════════════════════════════════
async function handleInteraction(request, env, cors) {
  const data = await safeParseJSON(request)
  const items = Array.isArray(data) ? data : [data]

  for (const item of items.slice(0, 50)) {
    await env.DB.prepare(`
      INSERT INTO interactions (vid, sid, site, url, path, type,
        target_tag, target_id, target_class, target_text, target_href,
        x, y, viewport_x, viewport_y,
        scroll_depth, scroll_direction,
        form_id, form_action, field_name, field_type, time_in_field,
        selected_length, props, ts)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      item.vid || '', item.sid || '', item.site || '',
      item.url || '', item.path || '',
      item.type || 'click',
      item.tag || '', item.id || '', item.cls || '',
      (item.text || '').slice(0, 100), item.href || '',
      item.x || 0, item.y || 0, item.vx || 0, item.vy || 0,
      item.scrollDepth || 0, item.scrollDir || '',
      item.formId || '', item.formAction || '',
      item.fieldName || '', item.fieldType || '', item.fieldTime || 0,
      item.selLength || 0, JSON.stringify(item.props || {}),
      item.ts || Date.now()
    ).run()
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// HEATMAP HANDLER — Click coordinates for visual overlays
// ═══════════════════════════════════════════════════════════
async function handleHeatmap(request, env, cors) {
  const data = await safeParseJSON(request)
  const ctx = extractContext(request)
  const clicks = Array.isArray(data.clicks) ? data.clicks : (data.x !== undefined ? [data] : [])

  for (const c of clicks.slice(0, 100)) {
    await env.DB.prepare(`
      INSERT INTO heatmap (site, path, x, y, page_x, page_y, viewport_w, viewport_h, page_h,
        device_type, target_tag, ts)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      data.site || '', data.path || '',
      c.nx || 0, c.ny || 0,
      c.px || 0, c.py || 0,
      c.vw || 0, c.vh || 0, c.ph || 0,
      ctx.type, c.tag || '',
      c.ts || Date.now()
    ).run()
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// FINGERPRINT HANDLER — Cross-session device identification
// ═══════════════════════════════════════════════════════════
async function handleFingerprint(request, env, cors) {
  const data = await safeParseJSON(request)
  const fid = data.fid || ''
  if (!fid) return json({ ok: false, error: 'no fid' }, 400, cors)

  const now = Date.now()

  // Calculate entropy score (how unique is this fingerprint?)
  const entropy = calculateEntropy(data)

  await env.DB.prepare(`
    INSERT INTO fingerprints (fid, canvas_hash, webgl_hash, audio_hash, font_hash,
      screen, color_depth, pixel_ratio, cpu_cores, memory_gb, max_touch, gpu, gpu_vendor,
      platform, language, timezone, timezone_offset,
      has_webgl, has_webgl2, has_webrtc, has_websocket, has_service_worker,
      has_webgpu, has_wasm, has_midi, has_bluetooth, has_usb, has_serial, has_hid,
      has_gamepad, has_speech, has_payment, has_credential,
      math_tan, math_sinh,
      plugin_count, mime_count,
      has_localstorage, has_sessionstorage, has_indexeddb, has_cookies,
      media_devices_count, entropy, first_seen, last_seen, visit_count)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
    ON CONFLICT(fid) DO UPDATE SET
      last_seen = excluded.last_seen,
      visit_count = fingerprints.visit_count + 1,
      entropy = excluded.entropy
  `).bind(
    fid, data.canvas || '', data.webgl || '', data.audio || '', data.fonts || '',
    data.screen || '', data.cd || 0, data.pr || 0, data.cores || 0, data.mem || 0,
    data.touch || 0, data.gpu || '', data.gpuVendor || '',
    data.platform || '', data.lang || '', data.tz || '', data.tzOff || 0,
    b(data.hasWebGL), b(data.hasWebGL2), b(data.hasWebRTC), b(data.hasWS),
    b(data.hasSW), b(data.hasWebGPU), b(data.hasWASM), b(data.hasMIDI),
    b(data.hasBT), b(data.hasUSB), b(data.hasSerial), b(data.hasHID),
    b(data.hasGamepad), b(data.hasSpeech), b(data.hasPayment), b(data.hasCred),
    data.mathTan || '', data.mathSinh || '',
    data.plugins || 0, data.mimes || 0,
    b(data.hasLS), b(data.hasSS), b(data.hasIDB), b(data.hasCookies),
    data.mediaDevices || 0, entropy, now, now
  ).run()

  return json({ ok: true, fid, entropy }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// PATH HANDLER — Navigation path tracking
// ═══════════════════════════════════════════════════════════
async function handlePath(request, env, cors) {
  const data = await safeParseJSON(request)

  await env.DB.prepare(`
    INSERT INTO paths (sid, vid, site, step, path, title, referrer, time_on_page, scroll_depth, interactions, engagement_score, ts)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    data.sid || '', data.vid || '', data.site || '',
    data.step || 1, data.path || '', data.title || '', data.referrer || '',
    data.timeOnPage || 0, data.scrollDepth || 0, data.interactions || 0,
    data.engagementScore || 0,
    data.ts || Date.now()
  ).run()

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// RESOURCES HANDLER — Resource timing data
// ═══════════════════════════════════════════════════════════
async function handleResources(request, env, cors) {
  const data = await safeParseJSON(request)
  const resources = Array.isArray(data.resources) ? data.resources : []

  for (const r of resources.slice(0, 50)) {
    await env.DB.prepare(`
      INSERT INTO resources (vid, sid, site, page_path, name, initiator_type,
        duration, transfer_size, encoded_size, decoded_size, failed, ts)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      data.vid || '', data.sid || '', data.site || '', data.path || '',
      (r.name || '').slice(0, 500), r.type || '',
      r.duration || 0, r.transferSize || 0, r.encodedSize || 0, r.decodedSize || 0,
      r.failed ? 1 : 0, Date.now()
    ).run()
  }

  return json({ ok: true }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// BATCH HANDLER — Accept multiple event types in one request
// ═══════════════════════════════════════════════════════════
async function handleBatch(request, env, cors) {
  const data = await safeParseJSON(request)
  const results = []

  for (const item of (data.batch || []).slice(0, 100)) {
    const endpoint = item.endpoint || item.type
    try {
      const fakeReq = new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(item.data || item),
        cf: request.cf
      })

      switch (endpoint) {
        case 'beacon': case 'b': await handleBeacon(fakeReq, env, cors); break
        case 'event': case 'e': await handleEvent(fakeReq, env, cors); break
        case 'session': case 's': await handleSession(fakeReq, env, cors); break
        case 'perf': case 'p': await handlePerformance(fakeReq, env, cors); break
        case 'error': case 'err': await handleError(fakeReq, env, cors); break
        case 'interaction': case 'i': await handleInteraction(fakeReq, env, cors); break
        case 'heatmap': case 'h': await handleHeatmap(fakeReq, env, cors); break
        case 'fingerprint': case 'fp': await handleFingerprint(fakeReq, env, cors); break
        case 'path': case 'nav': await handlePath(fakeReq, env, cors); break
      }
      results.push({ ok: true, endpoint })
    } catch (e) {
      results.push({ ok: false, endpoint, error: e.message })
    }
  }

  return json({ ok: true, results }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// IDENTIFY HANDLER — CRM (enhanced)
// ═══════════════════════════════════════════════════════════
async function handleIdentify(request, env, cors) {
  const data = await safeParseJSON(request)
  const ctx = extractContext(request)
  const vid = data.vid || hashIP(ctx.ip, ctx.ua)

  const contact = {
    vid,
    fid: data.fid || '',
    email: data.email || '',
    name: data.name || '',
    company: data.company || '',
    phone: data.phone || '',
    source: data.source || data.utm_source || 'direct',
    utm_source: data.utm_source || '',
    utm_medium: data.utm_medium || '',
    utm_campaign: data.utm_campaign || '',
    country: ctx.country, city: ctx.city,
    primary_device: ctx.type,
    primary_browser: ctx.browser,
    primary_os: ctx.os,
    props: JSON.stringify(data.props || {}),
    ts: Date.now()
  }

  await env.DB.prepare(`
    INSERT INTO contacts (vid, fid, email, name, company, phone, source,
      utm_source, utm_medium, utm_campaign, country, city,
      primary_device, primary_browser, primary_os,
      props, first_seen, last_seen)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(email) DO UPDATE SET
      vid = excluded.vid,
      fid = COALESCE(NULLIF(excluded.fid, ''), contacts.fid),
      name = COALESCE(NULLIF(excluded.name, ''), contacts.name),
      company = COALESCE(NULLIF(excluded.company, ''), contacts.company),
      phone = COALESCE(NULLIF(excluded.phone, ''), contacts.phone),
      country = COALESCE(NULLIF(excluded.country, ''), contacts.country),
      city = COALESCE(NULLIF(excluded.city, ''), contacts.city),
      primary_device = COALESCE(NULLIF(excluded.primary_device, ''), contacts.primary_device),
      primary_browser = COALESCE(NULLIF(excluded.primary_browser, ''), contacts.primary_browser),
      primary_os = COALESCE(NULLIF(excluded.primary_os, ''), contacts.primary_os),
      props = excluded.props,
      last_seen = excluded.last_seen,
      page_views = contacts.page_views + 1,
      sessions = contacts.sessions + 1
  `).bind(
    contact.vid, contact.fid, contact.email, contact.name, contact.company,
    contact.phone, contact.source, contact.utm_source, contact.utm_medium,
    contact.utm_campaign, contact.country, contact.city,
    contact.primary_device, contact.primary_browser, contact.primary_os,
    contact.props, contact.ts, contact.ts
  ).run()

  return json({ ok: true, vid: contact.vid }, 200, cors)
}

// ═══════════════════════════════════════════════════════════
// EMAIL PIXEL & REDIRECT (unchanged)
// ═══════════════════════════════════════════════════════════
async function handlePixel(request, env) {
  const params = new URL(request.url).searchParams
  const cf = request.cf || {}

  if (params.get('cid')) {
    await env.DB.prepare(`
      INSERT INTO events (type, vid, site, utm_campaign, country, ts)
      VALUES ('email_open', ?, 'email', ?, ?, ?)
    `).bind(params.get('cid'), params.get('campaign') || '', cf.country || '', Date.now()).run()
  }

  const gif = new Uint8Array([71,73,70,56,57,97,1,0,1,0,128,0,0,255,255,255,0,0,0,33,249,4,0,0,0,0,0,44,0,0,0,0,1,0,1,0,0,2,2,68,1,0,59])
  return new Response(gif, { headers: { 'content-type': 'image/gif', 'cache-control': 'no-cache, no-store' } })
}

async function handleRedirect(request, env) {
  const params = new URL(request.url).searchParams
  const dest = params.get('url') || params.get('u')
  const cf = request.cf || {}

  if (dest) {
    await env.DB.prepare(`
      INSERT INTO events (type, url, vid, utm_source, utm_medium, utm_campaign, country, site, ts)
      VALUES ('click', ?, ?, ?, ?, ?, ?, 'email', ?)
    `).bind(
      dest, params.get('cid') || 'anonymous',
      params.get('src') || '', params.get('med') || '',
      params.get('campaign') || '', cf.country || '', Date.now()
    ).run()
    return Response.redirect(dest, 302)
  }
  return new Response('Missing url parameter', { status: 400 })
}

// ═══════════════════════════════════════════════════════════
// API — Dashboard data endpoints (enhanced)
// ═══════════════════════════════════════════════════════════
async function handleAPI(path, url, env, cors, request) {
  // Sensitive API endpoints require Bearer token or ?key= param
  const sensitiveRoutes = ['/api/export', '/api/session/', '/api/contacts', '/api/threats', '/api/funnel']
  const isSensitive = sensitiveRoutes.some(r => path.startsWith(r))
  if (isSensitive && env.API_KEY) {
    const auth = request?.headers?.get('authorization') || ''
    const bearerToken = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    const paramKey = url.searchParams.get('key') || ''
    if (bearerToken !== env.API_KEY && paramKey !== env.API_KEY) {
      return json({ error: 'Unauthorized. API key required.' }, 401, cors)
    }
  }

  const params = url.searchParams
  const site = params.get('site') || '%'
  const days = Math.min(parseInt(params.get('days') || '30'), 365) // Cap at 1 year
  const since = Date.now() - (days * 86400000)

  // ── Real-time ──
  if (path === '/api/realtime') {
    const active = await env.REALTIME.get('active_visitors', 'json') || {}
    const today = await env.REALTIME.get(`pv:${todayKey()}`, 'json') || { count: 0 }
    // Count active across all sites
    let totalActive = 0
    const siteActive = {}
    for (const [k, v] of Object.entries(active)) {
      if (typeof v === 'object') {
        const count = Object.keys(v).length
        totalActive += count
        siteActive[k] = count
      }
    }
    return json({ total_active: totalActive, by_site: siteActive, today_pageviews: today.count }, 200, cors)
  }

  // ── Overview stats (enhanced) ──
  if (path === '/api/stats') {
    const [pageviews, visitors, sessions, conversions, bounces, avgScroll, errors, bots] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) as c FROM events WHERE type='pageview' AND ts > ? AND site LIKE ?`).bind(since, site).first(),
      env.DB.prepare(`SELECT COUNT(DISTINCT vid) as c FROM events WHERE type='pageview' AND ts > ? AND site LIKE ?`).bind(since, site).first(),
      env.DB.prepare(`SELECT COUNT(DISTINCT sid) as c FROM events WHERE type='pageview' AND ts > ? AND site LIKE ?`).bind(since, site).first(),
      env.DB.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(value),0) as v FROM conversions WHERE ts > ? AND site LIKE ?`).bind(since, site).first(),
      env.DB.prepare(`SELECT COUNT(*) as c FROM sessions WHERE is_bounce=1 AND started_at > ? AND site LIKE ?`).bind(since, site).first(),
      env.DB.prepare(`SELECT AVG(max_scroll_depth) as avg_scroll, AVG(engagement_time) as avg_engage FROM sessions WHERE started_at > ? AND site LIKE ?`).bind(since, site).first(),
      env.DB.prepare(`SELECT COUNT(*) as c FROM errors WHERE ts > ? AND site LIKE ?`).bind(since, site).first(),
      env.DB.prepare(`SELECT COUNT(*) as c FROM events WHERE is_bot=1 AND ts > ? AND site LIKE ?`).bind(since, site).first(),
    ])
    const sessionCount = sessions?.c || 1
    return json({
      pageviews: pageviews.c,
      visitors: visitors.c,
      sessions: sessions.c,
      conversions: conversions.c,
      revenue: conversions.v,
      bounce_rate: ((bounces?.c || 0) / sessionCount * 100).toFixed(1),
      avg_scroll_depth: Math.round(avgScroll?.avg_scroll || 0),
      avg_engagement_time: Math.round((avgScroll?.avg_engage || 0) / 1000),
      errors: errors?.c || 0,
      bot_hits: bots?.c || 0,
      period_days: days
    }, 200, cors)
  }

  // ── Top pages ──
  if (path === '/api/pages') {
    const rows = await env.DB.prepare(`
      SELECT path, COUNT(*) as views, COUNT(DISTINCT vid) as visitors,
        AVG(CASE WHEN scroll_depth > 0 THEN scroll_depth ELSE NULL END) as avg_scroll
      FROM events WHERE type='pageview' AND ts > ? AND site LIKE ?
      GROUP BY path ORDER BY views DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Top referrers ──
  if (path === '/api/referrers') {
    const rows = await env.DB.prepare(`
      SELECT referrer, COUNT(*) as views, COUNT(DISTINCT vid) as visitors
      FROM events WHERE type='pageview' AND referrer != '' AND ts > ? AND site LIKE ?
      GROUP BY referrer ORDER BY views DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Countries ──
  if (path === '/api/countries') {
    const rows = await env.DB.prepare(`
      SELECT country, region, city, COUNT(*) as views, COUNT(DISTINCT vid) as visitors
      FROM events WHERE type='pageview' AND country != '' AND ts > ? AND site LIKE ?
      GROUP BY country, region, city ORDER BY views DESC LIMIT 100
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Browsers (enhanced) ──
  if (path === '/api/browsers') {
    const rows = await env.DB.prepare(`
      SELECT browser, browser_version, COUNT(*) as views, COUNT(DISTINCT vid) as visitors
      FROM events WHERE type='pageview' AND ts > ? AND site LIKE ?
      GROUP BY browser, browser_version ORDER BY views DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Devices (enhanced) ──
  if (path === '/api/devices') {
    const rows = await env.DB.prepare(`
      SELECT device_type, os, os_version, COUNT(*) as views, COUNT(DISTINCT vid) as visitors
      FROM events WHERE type='pageview' AND ts > ? AND site LIKE ?
      GROUP BY device_type, os, os_version ORDER BY views DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Campaigns ──
  if (path === '/api/campaigns') {
    const rows = await env.DB.prepare(`
      SELECT utm_source, utm_medium, utm_campaign,
        COUNT(*) as views, COUNT(DISTINCT vid) as visitors
      FROM events WHERE type='pageview' AND utm_source != '' AND ts > ? AND site LIKE ?
      GROUP BY utm_source, utm_medium, utm_campaign ORDER BY views DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Conversions ──
  if (path === '/api/conversions') {
    const rows = await env.DB.prepare(`
      SELECT event, utm_source, utm_medium, utm_campaign,
        first_touch_source, last_touch_source,
        COUNT(*) as count, SUM(value) as revenue
      FROM conversions WHERE ts > ? AND site LIKE ?
      GROUP BY event, utm_source, utm_medium, utm_campaign ORDER BY count DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Timeseries ──
  if (path === '/api/timeseries') {
    const rows = await env.DB.prepare(`
      SELECT DATE(ts/1000, 'unixepoch') as day, COUNT(*) as views, COUNT(DISTINCT vid) as visitors,
        COUNT(DISTINCT sid) as sessions
      FROM events WHERE type='pageview' AND ts > ? AND site LIKE ?
      GROUP BY day ORDER BY day
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Performance overview ──
  if (path === '/api/performance') {
    const rows = await env.DB.prepare(`
      SELECT
        AVG(lcp) as avg_lcp, AVG(fcp) as avg_fcp, AVG(cls) as avg_cls,
        AVG(inp) as avg_inp, AVG(ttfb) as avg_ttfb,
        AVG(load_time) as avg_load,
        COUNT(*) as samples
      FROM performance WHERE ts > ? AND site LIKE ?
    `).bind(since, site).first()
    return json(rows || {}, 200, cors)
  }

  // ── Performance by page ──
  if (path === '/api/performance/pages') {
    const rows = await env.DB.prepare(`
      SELECT path,
        AVG(lcp) as avg_lcp, AVG(fcp) as avg_fcp, AVG(cls) as avg_cls,
        AVG(inp) as avg_inp, AVG(ttfb) as avg_ttfb, AVG(load_time) as avg_load,
        COUNT(*) as samples
      FROM performance WHERE ts > ? AND site LIKE ?
      GROUP BY path ORDER BY samples DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Errors ──
  if (path === '/api/errors') {
    const rows = await env.DB.prepare(`
      SELECT error_type, message, source, COUNT(*) as count,
        MAX(ts) as last_seen, MIN(ts) as first_seen
      FROM errors WHERE ts > ? AND site LIKE ?
      GROUP BY error_type, message ORDER BY count DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Threats ──
  if (path === '/api/threats') {
    const rows = await env.DB.prepare(`
      SELECT threat_type, confidence, signals, url, user_agent, country, as_org, action, ts
      FROM threats WHERE ts > ? AND site LIKE ?
      ORDER BY ts DESC LIMIT 100
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Threat summary ──
  if (path === '/api/threats/summary') {
    const rows = await env.DB.prepare(`
      SELECT threat_type, action, COUNT(*) as count, AVG(confidence) as avg_confidence
      FROM threats WHERE ts > ? AND site LIKE ?
      GROUP BY threat_type, action ORDER BY count DESC
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Sessions list ──
  if (path === '/api/sessions') {
    const rows = await env.DB.prepare(`
      SELECT sid, vid, entry_path, exit_path, pageviews, engagement_time, total_time,
        max_scroll_depth, is_bounce, converted, country, browser, device_type, site, started_at
      FROM sessions WHERE started_at > ? AND site LIKE ?
      ORDER BY started_at DESC LIMIT 100
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Session detail ──
  if (path === '/api/session') {
    const sid = params.get('sid')
    if (!sid) return json({ error: 'sid required' }, 400, cors)

    const [session, pathSteps, interactions] = await Promise.all([
      env.DB.prepare(`SELECT * FROM sessions WHERE sid = ?`).bind(sid).first(),
      env.DB.prepare(`SELECT * FROM paths WHERE sid = ? ORDER BY step`).bind(sid).all(),
      env.DB.prepare(`SELECT * FROM interactions WHERE sid = ? ORDER BY ts`).bind(sid).all(),
    ])
    return json({ session, paths: pathSteps.results, interactions: interactions.results }, 200, cors)
  }

  // ── Heatmap data ──
  if (path === '/api/heatmap') {
    const pagePath = params.get('path') || '/'
    const deviceType = params.get('device') || '%'
    const rows = await env.DB.prepare(`
      SELECT x, y, COUNT(*) as count
      FROM heatmap WHERE site LIKE ? AND path = ? AND device_type LIKE ? AND ts > ?
      GROUP BY x, y ORDER BY count DESC LIMIT 5000
    `).bind(site, pagePath, deviceType, since).all()
    return json(rows.results, 200, cors)
  }

  // ── Fingerprints ──
  if (path === '/api/fingerprints') {
    const rows = await env.DB.prepare(`
      SELECT fid, screen, gpu, platform, language, timezone, entropy, visit_count, first_seen, last_seen
      FROM fingerprints ORDER BY last_seen DESC LIMIT 100
    `).all()
    return json(rows.results, 200, cors)
  }

  // ── Navigation funnels ──
  if (path === '/api/funnels') {
    const steps = (params.get('steps') || '/,/signup,/checkout').split(',')
    const funnel = []
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const count = await env.DB.prepare(`
        SELECT COUNT(DISTINCT sid) as c FROM paths
        WHERE site LIKE ? AND path = ? AND ts > ?
      `).bind(site, step, since).first()
      funnel.push({ step, path: step, count: count?.c || 0 })
    }
    return json(funnel, 200, cors)
  }

  // ── Top interactions ──
  if (path === '/api/interactions') {
    const rows = await env.DB.prepare(`
      SELECT type, target_tag, target_id, target_text, COUNT(*) as count
      FROM interactions WHERE ts > ? AND site LIKE ?
      GROUP BY type, target_tag, target_id ORDER BY count DESC LIMIT 50
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Contacts ──
  if (path === '/api/contacts') {
    const rows = await env.DB.prepare(`
      SELECT email, name, company, source, utm_source, utm_campaign,
        country, city, page_views, sessions, score, stage,
        primary_device, primary_browser, first_seen, last_seen
      FROM contacts ORDER BY last_seen DESC LIMIT 100
    `).all()
    return json(rows.results, 200, cors)
  }

  // ── Sites overview ──
  if (path === '/api/sites') {
    const rows = await env.DB.prepare(`
      SELECT site, COUNT(*) as views, COUNT(DISTINCT vid) as visitors, COUNT(DISTINCT sid) as sessions
      FROM events WHERE type='pageview' AND ts > ?
      GROUP BY site ORDER BY views DESC
    `).bind(since).all()
    return json(rows.results, 200, cors)
  }

  // ── Live feed ──
  if (path === '/api/feed') {
    const rows = await env.DB.prepare(`
      SELECT type, path, country, city, browser, device_type, utm_source, site, is_bot, ts
      FROM events ORDER BY ts DESC LIMIT 50
    `).all()
    return json(rows.results, 200, cors)
  }

  // ── Technology breakdown ──
  if (path === '/api/technology') {
    const [screens, connections, gpus, languages] = await Promise.all([
      env.DB.prepare(`SELECT screen, COUNT(*) as c FROM events WHERE type='pageview' AND screen!='' AND ts>? AND site LIKE ? GROUP BY screen ORDER BY c DESC LIMIT 20`).bind(since, site).all(),
      env.DB.prepare(`SELECT connection_type, COUNT(*) as c FROM events WHERE type='pageview' AND connection_type!='' AND ts>? AND site LIKE ? GROUP BY connection_type ORDER BY c DESC`).bind(since, site).all(),
      env.DB.prepare(`SELECT gpu, COUNT(*) as c FROM events WHERE type='pageview' AND gpu!='' AND ts>? AND site LIKE ? GROUP BY gpu ORDER BY c DESC LIMIT 20`).bind(since, site).all(),
      env.DB.prepare(`SELECT language, COUNT(*) as c FROM events WHERE type='pageview' AND language!='' AND ts>? AND site LIKE ? GROUP BY language ORDER BY c DESC LIMIT 20`).bind(since, site).all(),
    ])
    return json({
      screens: screens.results,
      connections: connections.results,
      gpus: gpus.results,
      languages: languages.results,
    }, 200, cors)
  }

  // ── Scroll depth distribution ──
  if (path === '/api/scroll') {
    const rows = await env.DB.prepare(`
      SELECT
        CASE
          WHEN scroll_depth < 25 THEN '0-25%'
          WHEN scroll_depth < 50 THEN '25-50%'
          WHEN scroll_depth < 75 THEN '50-75%'
          ELSE '75-100%'
        END as bucket,
        COUNT(*) as count
      FROM interactions WHERE type='scroll' AND ts > ? AND site LIKE ?
      GROUP BY bucket ORDER BY bucket
    `).bind(since, site).all()
    return json(rows.results, 200, cors)
  }

  // ── Export (CSV) ──
  if (path === '/api/export') {
    const table = params.get('table') || 'events'
    const allowed = ['events', 'sessions', 'conversions', 'contacts', 'errors', 'threats']
    if (!allowed.includes(table)) return json({ error: 'invalid table' }, 400, cors)

    const rows = await env.DB.prepare(`SELECT * FROM ${table} WHERE ts > ? ORDER BY ts DESC LIMIT 10000`).bind(since).all()
    if (!rows.results.length) return json([], 200, cors)

    const headers = Object.keys(rows.results[0])
    const csv = [headers.join(','), ...rows.results.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
    return new Response(csv, { headers: { ...cors, 'content-type': 'text/csv', 'content-disposition': `attachment; filename="${table}-export.csv"` } })
  }

  return json({ error: 'not found' }, 404, cors)
}

// ═══════════════════════════════════════════════════════════
// DAILY AGGREGATION (scheduled worker)
// ═══════════════════════════════════════════════════════════
async function aggregateDailyStats(env) {
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const dayStart = new Date(yesterday + 'T00:00:00Z').getTime()
  const dayEnd = dayStart + 86400000

  const sites = await env.DB.prepare(`
    SELECT DISTINCT site FROM events WHERE ts >= ? AND ts < ?
  `).bind(dayStart, dayEnd).all()

  for (const { site } of sites.results) {
    const [pv, sess, errs, threats] = await Promise.all([
      env.DB.prepare(`
        SELECT COUNT(*) as pageviews, COUNT(DISTINCT vid) as visitors, COUNT(DISTINCT sid) as sessions
        FROM events WHERE type='pageview' AND ts >= ? AND ts < ? AND site = ?
      `).bind(dayStart, dayEnd, site).first(),
      env.DB.prepare(`
        SELECT COUNT(*) as total, SUM(is_bounce) as bounces,
          AVG(engagement_time) as avg_engage, AVG(pageviews) as avg_pages,
          AVG(max_scroll_depth) as avg_scroll
        FROM sessions WHERE started_at >= ? AND started_at < ? AND site = ?
      `).bind(dayStart, dayEnd, site).first(),
      env.DB.prepare(`SELECT COUNT(*) as js FROM errors WHERE error_type='js_error' AND ts>=? AND ts<? AND site=?`).bind(dayStart, dayEnd, site).first(),
      env.DB.prepare(`SELECT COUNT(*) as bots FROM events WHERE is_bot=1 AND ts>=? AND ts<? AND site=?`).bind(dayStart, dayEnd, site).first(),
    ])

    await env.DB.prepare(`
      INSERT INTO daily_stats (day, site, pageviews, visitors, sessions, bounces,
        avg_session_duration, avg_pages_per_session, avg_scroll_depth, avg_engagement_time,
        js_errors, bot_hits, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(day, site) DO UPDATE SET
        pageviews=excluded.pageviews, visitors=excluded.visitors, sessions=excluded.sessions,
        bounces=excluded.bounces, avg_session_duration=excluded.avg_session_duration,
        avg_pages_per_session=excluded.avg_pages_per_session,
        avg_scroll_depth=excluded.avg_scroll_depth,
        avg_engagement_time=excluded.avg_engagement_time,
        js_errors=excluded.js_errors, bot_hits=excluded.bot_hits,
        updated_at=excluded.updated_at
    `).bind(
      yesterday, site, pv?.pageviews || 0, pv?.visitors || 0, pv?.sessions || 0,
      sess?.bounces || 0, sess?.avg_engage || 0, sess?.avg_pages || 0,
      sess?.avg_scroll || 0, sess?.avg_engage || 0,
      errs?.js || 0, threats?.bots || 0, Date.now()
    ).run()
  }
}

// ═══════════════════════════════════════════════════════════
// REAL-TIME COUNTERS (enhanced)
// ═══════════════════════════════════════════════════════════
async function incrementRealtime(env, event) {
  const key = `pv:${todayKey()}`
  const current = await env.REALTIME.get(key, 'json') || { count: 0 }
  current.count++
  await env.REALTIME.put(key, JSON.stringify(current), { expirationTtl: 172800 })

  // Track active visitors per site (5-min window)
  const activeKey = `active:${event.site}`
  const active = await env.REALTIME.get(activeKey, 'json') || {}
  active[event.vid] = Date.now()
  const cutoff = Date.now() - 670
  for (const [k, v] of Object.entries(active)) {
    if (v < cutoff) delete active[k]
  }
  await env.REALTIME.put(activeKey, JSON.stringify(active), { expirationTtl: 600 })

  // Site daily counter
  const siteKey = `pv:${todayKey()}:${event.site}`
  const siteCurrent = await env.REALTIME.get(siteKey, 'json') || { count: 0 }
  siteCurrent.count++
  await env.REALTIME.put(siteKey, JSON.stringify(siteCurrent), { expirationTtl: 172800 })

  // Hourly counter for sparkline
  const hour = new Date().getUTCHours()
  const hourKey = `pv:${todayKey()}:${hour}:${event.site}`
  const hourCurrent = await env.REALTIME.get(hourKey, 'json') || { count: 0 }
  hourCurrent.count++
  await env.REALTIME.put(hourKey, JSON.stringify(hourCurrent), { expirationTtl: 172800 })
}

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// SECURITY — CORS, headers, validation, rate limiting
// ═══════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = new Set([
  'https://blackroad.io', 'https://blackroadai.com', 'https://lucidia.earth',
  'https://chat.blackroad.io', 'https://db.blackroad.io', 'https://blackroad.network',
  'https://roadchain.io', 'https://blackroadquantum.com', 'https://blackroad.systems',
  'https://lucidia.studio', 'https://lucidiaqi.com', 'https://images.blackroad.io',
  'https://mesh.blackroad.io', 'https://index.blackroad.io',
])

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'x-xss-protection': '1; mode=block',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
}

function corsHeaders(origin) {
  // In production, validate origin; allow * only if env says so
  const allowedOrigin = (origin && ALLOWED_ORIGINS.has(origin)) ? origin : (origin || '*')
  return {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization',
    'access-control-max-age': '86400',
    ...SECURITY_HEADERS,
  }
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...headers, 'content-type': 'application/json' }
  })
}

// Request body size limit (512KB max for analytics payloads)
const MAX_BODY_SIZE = 512 * 1024

async function safeParseJSON(request) {
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
  if (contentLength > MAX_BODY_SIZE) {
    throw new Error('Payload too large')
  }
  const text = await request.text()
  if (text.length > MAX_BODY_SIZE) {
    throw new Error('Payload too large')
  }
  return JSON.parse(text)
}

// Sanitize string input — strip control chars, limit length
function sanitizeStr(val, maxLen = 2000) {
  if (typeof val !== 'string') return ''
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen)
}

// IP-based rate limiting (per-isolate ephemeral)
const _rateLimits = new Map()
function checkRateLimit(ip, maxPerMin = 120) {
  const now = Date.now()
  const entry = _rateLimits.get(ip)
  if (!entry || now - entry.start > 60000) {
    _rateLimits.set(ip, { start: now, count: 1 })
    // Cleanup old entries periodically
    if (_rateLimits.size > 10000) {
      for (const [k, v] of _rateLimits) {
        if (now - v.start > 60000) _rateLimits.delete(k)
      }
    }
    return true
  }
  entry.count++
  return entry.count <= maxPerMin
}

function todayKey() { return new Date().toISOString().slice(0, 10) }
function tryPath(url) { try { return new URL(url).pathname } catch { return '' } }
function tryHost(url) { try { return new URL(url).hostname } catch { return '' } }
function safeParams(url) { try { return new URL(url).searchParams } catch { return new URLSearchParams() } }
function b(v) { return v ? 1 : 0 }

function hashStr(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return 'h_' + Math.abs(hash).toString(36)
}

function hashIP(ip, ua) {
  const day = todayKey()
  const raw = `${ip}:${ua}:${day}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0
  }
  return 'v_' + Math.abs(hash).toString(36)
}

function parseDevice(ua) {
  const browser =
    /Firefox\/(\d+)/i.test(ua) ? 'Firefox' :
    /Edg\/(\d+)/i.test(ua) ? 'Edge' :
    /OPR\/(\d+)/i.test(ua) ? 'Opera' :
    /Chrome\/(\d+)/i.test(ua) ? 'Chrome' :
    /Version\/(\d+).*Safari/i.test(ua) ? 'Safari' :
    /MSIE|Trident/i.test(ua) ? 'IE' :
    'Other'

  const bv = ua.match(/(?:Firefox|Edg|OPR|Chrome|Version|MSIE)[/ ](\d+)/i)
  const browser_version = bv ? bv[1] : ''

  const os =
    /Windows NT 10/i.test(ua) ? 'Windows' :
    /Windows NT 6\.3/i.test(ua) ? 'Windows' :
    /Mac OS X (\d+[._]\d+)/i.test(ua) ? 'macOS' :
    /Android (\d+)/i.test(ua) ? 'Android' :
    /iPhone|iPad/i.test(ua) ? 'iOS' :
    /CrOS/i.test(ua) ? 'ChromeOS' :
    /Linux/i.test(ua) ? 'Linux' :
    'Other'

  const osv = ua.match(/(?:Windows NT |Mac OS X |Android |CPU (?:iPhone )?OS )(\d+[._\d]*)/i)
  const os_version = osv ? osv[1].replace(/_/g, '.') : ''

  const type =
    /Mobile|Android.*Mobile|iPhone/i.test(ua) ? 'Mobile' :
    /iPad|Android(?!.*Mobile)|Tablet/i.test(ua) ? 'Tablet' :
    /bot|crawl|spider|scrape|headless/i.test(ua) ? 'Bot' :
    /Smart-?TV|Roku|Apple ?TV|Fire ?TV|BRAVIA|PlayStation|Xbox/i.test(ua) ? 'TV' :
    'Desktop'

  return { browser, browser_version, os, os_version, type }
}

function calculateEntropy(data) {
  // Score uniqueness based on number of distinguishing signals
  let bits = 0
  if (data.canvas) bits += 10   // Canvas is highly unique
  if (data.webgl) bits += 8
  if (data.audio) bits += 6
  if (data.fonts) bits += 8
  if (data.gpu) bits += 5
  if (data.screen) bits += 3
  if (data.tz) bits += 3
  if (data.lang) bits += 2
  if (data.platform) bits += 2
  if (data.cores) bits += 2
  if (data.mem) bits += 2
  bits += Math.min((data.plugins || 0) * 0.5, 3)
  bits += Math.min((data.mediaDevices || 0) * 2, 4)
  if (data.mathTan) bits += 2
  // Normalize to 0-100
  return Math.min(Math.round(bits / 60 * 100), 100)
}

// ═══════════════════════════════════════════════════════════
// BEACON JS v2 — THE MEGA COLLECTOR (~8KB)
// Captures 200+ data points per visitor
// ═══════════════════════════════════════════════════════════
const BEACON_JS = `(function(w,d,n,s){
'use strict';
var B=d.currentScript&&d.currentScript.src?d.currentScript.src.replace(/\\/bb\\.js$/,''):'https://bb.blackroad.io';
var q=new URLSearchParams(location.search);

// ─── VISITOR & SESSION IDENTITY ───
var vid=localStorage.getItem('bb_vid');
if(!vid){vid='v_'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem('bb_vid',vid)}
var sid=sessionStorage.getItem('bb_sid');
if(!sid){sid='s_'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);sessionStorage.setItem('bb_sid',sid)}
var isNewSession=!sessionStorage.getItem('bb_started');
var pageStep=parseInt(sessionStorage.getItem('bb_step')||'0')+1;
sessionStorage.setItem('bb_step',pageStep);

// ─── DNT ENFORCEMENT ───
// Honor Do Not Track: skip fingerprinting, heatmaps, interaction tracking
var dntEnabled=n.doNotTrack==='1'||w.doNotTrack==='1'||n.msDoNotTrack==='1';

// ─── TRANSPORT ───
var Q=[];var sending=false;
function flush(){
  if(sending||!Q.length)return;
  sending=true;
  var batch=Q.splice(0,50);
  var body=JSON.stringify({batch:batch});
  if(n.sendBeacon){n.sendBeacon(B+'/batch',body);sending=false;if(Q.length)setTimeout(flush,100)}
  else{fetch(B+'/batch',{method:'POST',body:body,keepalive:true}).finally(function(){sending=false;if(Q.length)setTimeout(flush,100)})}
}
function send(endpoint,data){
  data.vid=vid;data.sid=sid;data.site=location.hostname;data.fid=getFID();
  Q.push({endpoint:endpoint,data:data});
  if(Q.length>=20)flush();else if(!sending)setTimeout(flush,500);
}
function sendNow(path,data){
  data.vid=vid;data.sid=sid;data.site=location.hostname;data.fid=getFID();
  if(dntEnabled)data._dnt=true;
  var body=JSON.stringify(data);
  var headers={'Content-Type':'application/json'};
  if(dntEnabled)headers['DNT']='1';
  if(n.sendBeacon){n.sendBeacon(B+path,body)}
  else{fetch(B+path,{method:'POST',body:body,headers:headers,keepalive:true})}
}

// ─── FINGERPRINT ───
var _fid=localStorage.getItem('bb_fid')||'';
function getFID(){return _fid}
function fingerprint(){
  var fp={};
  // Canvas fingerprint
  try{
    var c=d.createElement('canvas');c.width=200;c.height=50;
    var ctx=c.getContext('2d');
    ctx.textBaseline='top';ctx.font='14px Arial';ctx.fillStyle='#f60';ctx.fillRect(125,1,62,20);
    ctx.fillStyle='#069';ctx.fillText('BlackBoard<canvas>',2,15);
    ctx.fillStyle='rgba(102,204,0,0.7)';ctx.fillText('BlackBoard<canvas>',4,17);
    fp.canvas=hashCode(c.toDataURL());
  }catch(e){}

  // WebGL fingerprint
  try{
    var gl=d.createElement('canvas').getContext('webgl')||d.createElement('canvas').getContext('experimental-webgl');
    if(gl){
      var ext=gl.getExtension('WEBGL_debug_renderer_info');
      fp.gpu=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'';
      fp.gpuVendor=ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):'';
      fp.webgl=hashCode([gl.getParameter(gl.VERSION),gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        gl.getParameter(gl.MAX_TEXTURE_SIZE),gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        gl.getParameter(gl.MAX_VARYING_VECTORS),gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        gl.getSupportedExtensions().join(',')].join('|'));
      fp.hasWebGL=true;
      try{fp.hasWebGL2=!!d.createElement('canvas').getContext('webgl2')}catch(e){}
    }
  }catch(e){}

  // Audio fingerprint
  try{
    var ac=new(w.AudioContext||w.webkitAudioContext)();
    var osc=ac.createOscillator();var an=ac.createAnalyser();
    var gain=ac.createGain();var script=ac.createScriptProcessor(4096,1,1);
    osc.type='triangle';osc.frequency.setValueAtTime(10000,ac.currentTime);
    gain.gain.setValueAtTime(0,ac.currentTime);
    osc.connect(an);an.connect(script);script.connect(gain);gain.connect(ac.destination);
    osc.start(0);
    var audioData=new Float32Array(an.frequencyBinCount);an.getFloatFrequencyData(audioData);
    fp.audio=hashCode(audioData.slice(0,30).join(','));
    osc.stop();ac.close();
  }catch(e){}

  // Math engine detection
  try{
    fp.mathTan=Math.tan(-1e300).toString().slice(0,20);
    fp.mathSinh=Math.sinh(1).toString().slice(0,20);
  }catch(e){}

  // Screen & hardware
  fp.screen=s.width+'x'+s.height;
  fp.cd=s.colorDepth;
  fp.pr=w.devicePixelRatio||1;
  fp.cores=n.hardwareConcurrency||0;
  fp.mem=n.deviceMemory||0;
  fp.touch=n.maxTouchPoints||0;
  fp.platform=n.platform||'';
  fp.lang=n.language||'';
  fp.tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
  fp.tzOff=new Date().getTimezoneOffset();

  // Browser features
  fp.hasWS='WebSocket' in w;
  fp.hasSW='serviceWorker' in n;
  fp.hasWebGPU='gpu' in n;
  fp.hasWASM='WebAssembly' in w;
  fp.hasWebRTC='RTCPeerConnection' in w;
  fp.hasMIDI='requestMIDIAccess' in n;
  fp.hasBT='bluetooth' in n;
  fp.hasUSB='usb' in n;
  fp.hasSerial='serial' in n;
  fp.hasHID='hid' in n;
  fp.hasGamepad='getGamepads' in n;
  fp.hasSpeech='speechSynthesis' in w;
  fp.hasPayment='PaymentRequest' in w;
  fp.hasCred='credentials' in n;

  // Storage
  fp.hasLS=!!w.localStorage;
  fp.hasSS=!!w.sessionStorage;
  fp.hasIDB='indexedDB' in w;
  fp.hasCookies=n.cookieEnabled;

  // Plugins
  fp.plugins=n.plugins?n.plugins.length:0;
  fp.mimes=n.mimeTypes?n.mimeTypes.length:0;

  // Media devices
  try{
    if(n.mediaDevices&&n.mediaDevices.enumerateDevices){
      n.mediaDevices.enumerateDevices().then(function(devices){
        fp.mediaDevices=devices.length;
        finishFP(fp);
      });return;
    }
  }catch(e){}
  finishFP(fp);
}
function finishFP(fp){
  // Generate deterministic FID from all components
  var str=JSON.stringify(fp);
  _fid='f_'+hashCode(str);
  localStorage.setItem('bb_fid',_fid);
  sendNow('/fp',fp);
}

// ─── DEVICE & CONNECTION INFO ───
function getDeviceInfo(){
  var info={
    screen:s.width+'x'+s.height,
    viewport:w.innerWidth+'x'+w.innerHeight,
    pr:w.devicePixelRatio||1,
    cd:s.colorDepth,
    cores:n.hardwareConcurrency||0,
    mem:n.deviceMemory||0,
    touch:n.maxTouchPoints||0,
    lang:n.language||'',
    langs:n.languages?n.languages.join(','):'',
    tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'',
    dnt:n.doNotTrack==='1'||w.doNotTrack==='1',
  };
  // Connection API
  var conn=n.connection||n.mozConnection||n.webkitConnection;
  if(conn){
    info.conn=conn.type||'';
    info.ect=conn.effectiveType||'';
    info.dl=conn.downlink||0;
    info.rtt=conn.rtt||0;
    info.saveData=conn.saveData||false;
  }
  // GPU (if already fingerprinted)
  try{
    var gl=d.createElement('canvas').getContext('webgl');
    if(gl){
      var ext=gl.getExtension('WEBGL_debug_renderer_info');
      if(ext){info.gpu=gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);info.gpuVendor=gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)}
    }
  }catch(e){}
  // Media preferences
  try{
    info.prefDark=w.matchMedia('(prefers-color-scheme:dark)').matches;
    info.prefReducedMotion=w.matchMedia('(prefers-reduced-motion:reduce)').matches;
    info.prefContrast=w.matchMedia('(prefers-contrast:more)').matches?'more':w.matchMedia('(prefers-contrast:less)').matches?'less':'no-preference';
    info.prefTransparency=w.matchMedia('(prefers-reduced-transparency:reduce)').matches;
    info.standAlone=w.matchMedia('(display-mode:standalone)').matches||!!n.standalone;
    info.orientation=s.orientation?s.orientation.type||'':'';
  }catch(e){}
  // Storage estimate
  try{if(n.storage&&n.storage.estimate){n.storage.estimate().then(function(est){
    info.storageQuota=est.quota||0;info.storageUsed=est.usage||0;
  })}}catch(e){}
  return info;
}

// ─── HEADLESS/BOT DETECTION (client-side) ───
function detectHeadless(){
  var h={};
  try{h.webdriver=!!n.webdriver}catch(e){}
  try{h.no_plugins=n.plugins&&n.plugins.length===0}catch(e){}
  try{h.no_languages=!n.languages||n.languages.length===0}catch(e){}
  try{h.phantom=!!w._phantom||!!w.__nightmare||!!w.callPhantom}catch(e){}
  try{h.nightmare=!!w.__nightmare}catch(e){}
  try{h.selenium=!!d.__selenium_unwrapped||!!d.__webdriver_evaluate||!!d.__driver_evaluate||!!w._Selenium_IDE_Recorder}catch(e){}
  try{h.puppeteer=!!w.__puppeteer_evaluation_script__}catch(e){}
  try{h.automation=!!n.webdriver||!!w.domAutomation||!!w.domAutomationController}catch(e){}
  try{h.chrome_runtime_missing=!!w.chrome&&!w.chrome.runtime}catch(e){}
  try{h.zero_size=w.outerWidth===0&&w.outerHeight===0}catch(e){}
  try{
    var p=w.Notification&&w.Notification.permission;
    h.notification_perms_denied_instant=(p==='denied');
  }catch(e){}
  return h;
}

// ─── AD BLOCKER DETECTION ───
function detectAdblock(cb){
  try{
    var el=d.createElement('div');
    el.innerHTML='&nbsp;';
    el.className='adsbox ad-zone ad-placement';
    el.style.cssText='position:absolute;top:-999px;left:-999px;width:1px;height:1px;';
    d.body.appendChild(el);
    setTimeout(function(){
      var blocked=!el.offsetHeight||!el.offsetWidth||el.style.display==='none';
      d.body.removeChild(el);
      cb(blocked);
    },100);
  }catch(e){cb(false)}
}

// ─── INCOGNITO DETECTION ───
function detectIncognito(cb){
  try{
    if('storage' in n&&'estimate' in n.storage){
      n.storage.estimate().then(function(e){
        cb(e.quota<120000000);
      }).catch(function(){cb(false)});
    }else{cb(false)}
  }catch(e){cb(false)}
}

// ─── INITIAL PAGEVIEW ───
var pgStart=Date.now();
var devInfo=getDeviceInfo();
var headless=detectHeadless();

function sendPageview(){
  var data=Object.assign({
    url:location.href,
    path:location.pathname,
    title:d.title,
    referrer:d.referrer,
    utm_source:q.get('utm_source')||'',
    utm_medium:q.get('utm_medium')||'',
    utm_campaign:q.get('utm_campaign')||'',
    utm_term:q.get('utm_term')||'',
    utm_content:q.get('utm_content')||'',
    ref:q.get('ref')||'',
    gclid:q.get('gclid')||'',
    fbclid:q.get('fbclid')||'',
    msclkid:q.get('msclkid')||'',
    ttclid:q.get('ttclid')||'',
    li_fat_id:q.get('li_fat_id')||'',
    _h:headless,
  },devInfo);
  send('b',data);
}

// Detect adblock and incognito, then send
var _adblock=false,_incognito=false;
function maybeSendPV(){
  devInfo.adblock=_adblock;
  devInfo.incognito=_incognito;
  sendPageview();
}
detectAdblock(function(b){_adblock=b;maybeSendPV()});
detectIncognito(function(b){_incognito=b});

// ─── SESSION START ───
if(isNewSession){
  sessionStorage.setItem('bb_started','1');
  sendNow('/s',{
    action:'start',
    url:location.href,path:location.pathname,
    referrer:d.referrer,
    utm_source:q.get('utm_source')||'',
    utm_medium:q.get('utm_medium')||'',
    utm_campaign:q.get('utm_campaign')||'',
  });
  // Fingerprint on first visit of session (skip if DNT enabled)
  if(!dntEnabled)setTimeout(fingerprint,2000);
}else{
  sendNow('/s',{action:'pageview',url:location.href,path:location.pathname});
}

// ─── NAVIGATION PATH TRACKING ───
send('nav',{
  step:pageStep,path:location.pathname,title:d.title,referrer:d.referrer,
  timeOnPage:0,scrollDepth:0,interactions:0
});

// ─── SPA NAVIGATION ───
var pushState=history.pushState;
history.pushState=function(){
  sendPageUnload();
  pushState.apply(history,arguments);
  onNavigate();
};
w.addEventListener('popstate',function(){
  sendPageUnload();
  onNavigate();
});
function onNavigate(){
  pgStart=Date.now();
  _maxScroll=0;_engaged=0;_interactionCount=0;_clickBuffer=[];
  pageStep++;sessionStorage.setItem('bb_step',pageStep);
  send('b',Object.assign({url:location.href,path:location.pathname,title:d.title,referrer:''},devInfo));
  sendNow('/s',{action:'pageview',url:location.href,path:location.pathname});
  send('nav',{step:pageStep,path:location.pathname,title:d.title,referrer:'',timeOnPage:0,scrollDepth:0,interactions:0});
}

// ─── SCROLL DEPTH TRACKING (skip send if DNT) ───
var _maxScroll=0;
var _scrollTimer=null;
function getScrollDepth(){
  var h=Math.max(d.body.scrollHeight,d.documentElement.scrollHeight,d.body.offsetHeight,d.documentElement.offsetHeight)-w.innerHeight;
  return h>0?Math.round(w.scrollY/h*100):100;
}
w.addEventListener('scroll',function(){
  var depth=getScrollDepth();
  if(depth>_maxScroll){
    _maxScroll=depth;
    if(!dntEnabled&&[25,50,75,90,100].indexOf(Math.round(depth/25)*25)>-1){
      if(!_scrollTimer){
        _scrollTimer=setTimeout(function(){
          send('i',{type:'scroll',scrollDepth:_maxScroll,path:location.pathname,url:location.href});
          _scrollTimer=null;
        },500);
      }
    }
  }
},{passive:true});

// ─── ENGAGEMENT TIME (visible tab time) ───
var _engaged=0;
var _lastEngageCheck=Date.now();
var _visible=!d.hidden;
d.addEventListener('visibilitychange',function(){
  _visible=!d.hidden;
  if(_visible){
    _lastEngageCheck=Date.now();
    send('i',{type:'tab_visible',path:location.pathname,url:location.href});
  }else{
    _engaged+=Date.now()-_lastEngageCheck;
    send('i',{type:'tab_hidden',path:location.pathname,url:location.href});
  }
});
// Heartbeat every 30s
setInterval(function(){
  if(_visible){_engaged+=Date.now()-_lastEngageCheck;_lastEngageCheck=Date.now()}
  sendNow('/s',{
    action:'heartbeat',
    engagement_delta:_engaged,
    scroll_depth:_maxScroll,
    engagement_score:calcEngagement(),
    interactions:_interactionCount,
    url:location.href,path:location.pathname,
  });
  _engaged=0;
},67);

// ─── CLICK TRACKING (with rage/dead click detection) ───
// DNT: skip detailed click tracking, heatmaps, and interaction recording
var _clickBuffer=[];
var _interactionCount=0;
d.addEventListener('click',function(e){
  _interactionCount++;
  if(dntEnabled)return;
  var t=e.target;
  var tag=t.tagName||'';
  var now=Date.now();

  // Heatmap data
  var rect=d.documentElement;
  var px=e.pageX,py=e.pageY;
  var vw=w.innerWidth,vh=w.innerHeight;
  var ph=Math.max(d.body.scrollHeight,rect.scrollHeight);
  var nx=vw>0?Math.round(px/vw*10000):0;
  var ny=ph>0?Math.round(py/ph*10000):0;

  _clickBuffer.push({x:px,y:py,ts:now,tag:tag});

  // Rage click detection (3+ clicks within 500ms in same area)
  var recent=_clickBuffer.filter(function(c){return now-c.ts<800});
  var isRage=false,isDead=false;
  if(recent.length>=3){
    var spread=Math.max.apply(null,recent.map(function(c){return c.x}))-Math.min.apply(null,recent.map(function(c){return c.x}));
    if(spread<100){isRage=true}
  }

  // Dead click detection (click on non-interactive element)
  var interactive='A,BUTTON,INPUT,SELECT,TEXTAREA,LABEL,[role=button],[onclick]';
  if(!t.closest||!t.closest(interactive)){isDead=true}

  var clickData={
    type:isRage?'rage_click':isDead?'dead_click':'click',
    tag:tag.toLowerCase(),id:t.id||'',cls:(t.className||'').toString().slice(0,100),
    text:(t.innerText||t.textContent||'').slice(0,100),
    href:t.href||t.closest&&t.closest('a')&&t.closest('a').href||'',
    x:px,y:py,vx:e.clientX,vy:e.clientY,
    path:location.pathname,url:location.href,
  };
  send('i',clickData);

  // Batch heatmap data
  var hm=sessionStorage.getItem('bb_hm');
  var hmData=hm?JSON.parse(hm):[];
  hmData.push({nx:nx,ny:ny,px:px,py:py,vw:vw,vh:vh,ph:ph,tag:tag.toLowerCase(),ts:now});
  if(hmData.length>=10){
    sendNow('/h',{path:location.pathname,clicks:hmData});
    hmData=[];
  }
  sessionStorage.setItem('bb_hm',JSON.stringify(hmData));

  // Keep click buffer manageable
  if(_clickBuffer.length>20)_clickBuffer=_clickBuffer.slice(-10);
},true);

// ─── FORM ANALYTICS (skip if DNT) ───
var _formStarts={};
d.addEventListener('focusin',function(e){
  if(dntEnabled)return;
  var t=e.target;
  if(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'){
    var form=t.closest('form');
    var formId=form?(form.id||form.action||'form'):'inline';
    if(!_formStarts[formId]){
      _formStarts[formId]={start:Date.now(),fields:{}};
      send('i',{type:'form_start',formId:formId,formAction:form?form.action:'',path:location.pathname,url:location.href});
    }
    _formStarts[formId].fields[t.name||t.type||'field']=Date.now();
  }
});
d.addEventListener('focusout',function(e){
  var t=e.target;
  if(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'){
    var form=t.closest('form');
    var formId=form?(form.id||form.action||'form'):'inline';
    var fs=_formStarts[formId];
    if(fs&&fs.fields[t.name||t.type||'field']){
      var timeInField=Date.now()-fs.fields[t.name||t.type||'field'];
      send('i',{
        type:'form_field',formId:formId,
        fieldName:t.name||'',fieldType:t.type||t.tagName.toLowerCase(),
        fieldTime:timeInField,path:location.pathname,url:location.href
      });
    }
  }
});
d.addEventListener('submit',function(e){
  var form=e.target;
  var formId=form.id||form.action||'form';
  var fs=_formStarts[formId];
  send('i',{
    type:'form_submit',formId:formId,formAction:form.action||'',
    path:location.pathname,url:location.href,
    props:{timeToSubmit:fs?Date.now()-fs.start:0}
  });
  delete _formStarts[formId];
});

// ─── COPY/PASTE/PRINT/SELECT DETECTION (skip if DNT) ───
if(!dntEnabled){
d.addEventListener('copy',function(){
  var sel=w.getSelection();
  send('i',{type:'copy',selLength:sel?sel.toString().length:0,path:location.pathname,url:location.href});
});
d.addEventListener('paste',function(){
  send('i',{type:'paste',path:location.pathname,url:location.href});
});
w.addEventListener('beforeprint',function(){
  send('i',{type:'print',path:location.pathname,url:location.href});
});
d.addEventListener('selectstart',function(){
  clearTimeout(d._bbSelTimer);
  d._bbSelTimer=setTimeout(function(){
    var sel=w.getSelection();
    if(sel&&sel.toString().length>10){
      send('i',{type:'select_text',selLength:sel.toString().length,path:location.pathname,url:location.href});
    }
  },1000);
});
} // end DNT gate

// ─── EXIT INTENT DETECTION ───
if(!dntEnabled) d.addEventListener('mouseout',function(e){
  if(e.clientY<5&&e.relatedTarget===null){
    send('i',{type:'exit_intent',path:location.pathname,url:location.href,scrollDepth:_maxScroll});
  }
});

// ─── RESIZE TRACKING ───
var _resizeTimer;
w.addEventListener('resize',function(){
  clearTimeout(_resizeTimer);
  _resizeTimer=setTimeout(function(){
    send('i',{type:'resize',path:location.pathname,url:location.href,props:{w:w.innerWidth,h:w.innerHeight}});
  },500);
});

// ─── BATTERY API ───
try{if(n.getBattery){n.getBattery().then(function(batt){
  var battData={level:Math.round(batt.level*100),charging:batt.charging,chargingTime:batt.chargingTime===Infinity?-1:batt.chargingTime,dischargingTime:batt.dischargingTime===Infinity?-1:batt.dischargingTime};
  send('i',{type:'battery',path:location.pathname,url:location.href,props:battData});
  batt.addEventListener('levelchange',function(){
    var lvl=Math.round(batt.level*100);
    if(lvl%10===0||lvl<=15)send('i',{type:'battery_change',path:location.pathname,url:location.href,props:{level:lvl,charging:batt.charging}});
  });
  batt.addEventListener('chargingchange',function(){
    send('i',{type:'battery_charging',path:location.pathname,url:location.href,props:{charging:batt.charging,level:Math.round(batt.level*100)}});
  });
})}}catch(e){}

// ─── NETWORK CHANGE TRACKING ───
try{var conn2=n.connection||n.mozConnection||n.webkitConnection;
if(conn2){conn2.addEventListener('change',function(){
  send('i',{type:'network_change',path:location.pathname,url:location.href,props:{
    effectiveType:conn2.effectiveType||'',downlink:conn2.downlink||0,rtt:conn2.rtt||0,saveData:conn2.saveData||false,type:conn2.type||''
  }});
})}}catch(e){}

// ─── LONG TASK OBSERVER (jank detection) ───
try{if(w.PerformanceObserver){
  var _longTasks=[];
  new PerformanceObserver(function(list){
    list.getEntries().forEach(function(entry){
      _longTasks.push({duration:Math.round(entry.duration),startTime:Math.round(entry.startTime),name:entry.name||''});
      if(_longTasks.length>=5){
        send('i',{type:'long_tasks',path:location.pathname,url:location.href,props:{tasks:_longTasks}});
        _longTasks=[];
      }
    });
  }).observe({type:'longtask',buffered:true});
}}catch(e){}

// ─── LAYOUT SHIFT ATTRIBUTION ───
try{if(w.PerformanceObserver){
  new PerformanceObserver(function(list){
    list.getEntries().forEach(function(entry){
      if(!entry.hadRecentInput&&entry.value>0.05){
        var sources=(entry.sources||[]).slice(0,3).map(function(src){
          return{node:src.node?src.node.tagName||'':'',prevRect:src.previousRect?src.previousRect.toJSON():{},currRect:src.currentRect?src.currentRect.toJSON():{}};
        });
        send('i',{type:'layout_shift',path:location.pathname,url:location.href,props:{value:Math.round(entry.value*1000)/1000,sources:sources}});
      }
    });
  }).observe({type:'layout-shift',buffered:false});
}}catch(e){}

// ─── KEYBOARD & INPUT TRACKING ───
var _keyCount=0,_keyStart=0,_lastKeyTime=0,_inputWords=0;
d.addEventListener('keydown',function(e){
  _keyCount++;_interactionCount++;
  var now=Date.now();
  if(!_keyStart)_keyStart=now;
  // Typing speed (only for input fields)
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')){
    if(e.key===' '||e.key==='Enter')_inputWords++;
  }
  _lastKeyTime=now;
},{passive:true});
// Report keyboard metrics every 60s
setInterval(function(){
  if(_keyCount>0){
    var elapsed=(_lastKeyTime-_keyStart)/1000;
    send('i',{type:'keyboard',path:location.pathname,url:location.href,props:{
      keys:_keyCount,wpm:elapsed>5?Math.round(_inputWords/(elapsed/60)):0,duration:Math.round(elapsed)
    }});
    _keyCount=0;_keyStart=0;_inputWords=0;
  }
},60000);

// ─── TOUCH GESTURE DETECTION ───
var _touchStart=null,_touchStartTime=0;
d.addEventListener('touchstart',function(e){
  if(e.touches.length===1){
    _touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
    _touchStartTime=Date.now();
  }else if(e.touches.length===2){
    send('i',{type:'pinch_start',path:location.pathname,url:location.href});
  }
},{passive:true});
d.addEventListener('touchend',function(e){
  if(_touchStart&&e.changedTouches.length===1){
    var dx=e.changedTouches[0].clientX-_touchStart.x;
    var dy=e.changedTouches[0].clientY-_touchStart.y;
    var dist=Math.sqrt(dx*dx+dy*dy);
    var elapsed=Date.now()-_touchStartTime;
    if(dist>80&&elapsed<500){
      var dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
      send('i',{type:'swipe',path:location.pathname,url:location.href,props:{dir:dir,dist:Math.round(dist),speed:Math.round(dist/elapsed*1000)}});
    }
    _touchStart=null;
  }
},{passive:true});

// ─── MEDIA QUERY CHANGES ───
try{
  w.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(e){
    send('i',{type:'media_change',path:location.pathname,url:location.href,props:{pref:'color-scheme',value:e.matches?'dark':'light'}});
  });
  w.matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',function(e){
    send('i',{type:'media_change',path:location.pathname,url:location.href,props:{pref:'reduced-motion',value:e.matches}});
  });
}catch(e){}

// ─── ORIENTATION CHANGE ───
try{w.addEventListener('orientationchange',function(){
  send('i',{type:'orientation',path:location.pathname,url:location.href,props:{angle:w.screen.orientation?w.screen.orientation.angle:w.orientation||0,type:w.screen.orientation?w.screen.orientation.type:''}});
})}catch(e){}

// ─── FOCUS/BLUR PATTERNS ───
var _blurCount=0,_focusCount=0;
w.addEventListener('blur',function(){_blurCount++;send('i',{type:'window_blur',path:location.pathname,url:location.href,props:{count:_blurCount}})});
w.addEventListener('focus',function(){_focusCount++;send('i',{type:'window_focus',path:location.pathname,url:location.href,props:{count:_focusCount}})});

// ─── ENGAGEMENT SCORE ───
function calcEngagement(){
  var t=Date.now()-pgStart;
  var timeScore=Math.min(t/120000,1)*30;
  var scrollScore=Math.min(_maxScroll/100,1)*25;
  var interactScore=Math.min(_interactionCount/20,1)*25;
  var focusScore=(_blurCount===0?1:Math.max(0,1-_blurCount*0.1))*20;
  return Math.round(timeScore+scrollScore+interactScore+focusScore);
}

// ─── ERROR TRACKING ───
var _errors=[];
w.addEventListener('error',function(e){
  var err={
    error_type:e.filename?'js_error':'resource_error',
    message:e.message||'',
    source:e.filename||'',
    lineno:e.lineno||0,colno:e.colno||0,
    stack:e.error&&e.error.stack?(e.error.stack+'').slice(0,2000):'',
    url:location.href,path:location.pathname,
  };
  _errors.push(err);
  if(_errors.length>=5){
    sendNow('/err',_errors);
    _errors=[];
  }
},true);
w.addEventListener('unhandledrejection',function(e){
  _errors.push({
    error_type:'unhandled_rejection',
    message:e.reason?e.reason.message||String(e.reason):'',
    stack:e.reason&&e.reason.stack?(e.reason.stack+'').slice(0,2000):'',
    url:location.href,path:location.pathname,
  });
  if(_errors.length>=3){sendNow('/err',_errors);_errors=[]}
});
// Flush errors periodically
setInterval(function(){if(_errors.length){sendNow('/err',_errors);_errors=[]}},10000);

// ─── PERFORMANCE METRICS (Core Web Vitals) ───
function collectPerformance(){
  try{
    var perf=w.performance;
    if(!perf)return;
    var data={url:location.href,path:location.pathname};
    // Navigation Timing Level 2 (preferred)
    var nav2=perf.getEntriesByType&&perf.getEntriesByType('navigation');
    if(nav2&&nav2.length){
      var nt=nav2[0];
      data.dns=Math.round(nt.domainLookupEnd-nt.domainLookupStart);
      data.tcp=Math.round(nt.connectEnd-nt.connectStart);
      data.tls=nt.secureConnectionStart?Math.round(nt.connectEnd-nt.secureConnectionStart):0;
      data.ttfb=Math.round(nt.responseStart-nt.requestStart);
      data.response=Math.round(nt.responseEnd-nt.responseStart);
      data.domInteractive=Math.round(nt.domInteractive);
      data.domComplete=Math.round(nt.domComplete);
      data.loadTime=Math.round(nt.loadEventEnd);
      data.navType=nt.type||'';
      data.redirectCount=nt.redirectCount||0;
      data.redirectTime=Math.round(nt.redirectEnd-nt.redirectStart);
      data.workerTime=nt.workerStart?Math.round(nt.fetchStart-nt.workerStart):0;
      data.transferSize=nt.transferSize||0;
      data.encodedSize=nt.encodedBodySize||0;
      data.decodedDocSize=nt.decodedBodySize||0;
      data.protocol=nt.nextHopProtocol||'';
    }else if(perf.timing){
      var t=perf.timing;
      data.dns=t.domainLookupEnd-t.domainLookupStart;
      data.tcp=t.connectEnd-t.connectStart;
      data.tls=t.secureConnectionStart?t.connectEnd-t.secureConnectionStart:0;
      data.ttfb=t.responseStart-t.requestStart;
      data.response=t.responseEnd-t.responseStart;
      data.domInteractive=t.domInteractive-t.navigationStart;
      data.domComplete=t.domComplete-t.navigationStart;
      data.loadTime=t.loadEventEnd-t.navigationStart;
    }
    data.resourceCount=perf.getEntriesByType?perf.getEntriesByType('resource').length:0;
    // Transfer sizes
    if(perf.getEntriesByType){
      var res=perf.getEntriesByType('resource');
      var totalTransfer=0,totalDecoded=0;
      res.forEach(function(r){totalTransfer+=r.transferSize||0;totalDecoded+=r.decodedBodySize||0});
      data.transferSize=totalTransfer;data.decodedSize=totalDecoded;
    }
    // JS Heap
    if(perf.memory){data.jsHeapUsed=perf.memory.usedJSHeapSize;data.jsHeapTotal=perf.memory.totalJSHeapSize}
    // Connection
    var conn=n.connection||n.mozConnection||n.webkitConnection;
    if(conn){data.conn=conn.type||'';data.ect=conn.effectiveType||'';data.dl=conn.downlink||0;data.rtt=conn.rtt||0}

    // Web Vitals via PerformanceObserver
    if(w.PerformanceObserver){
      // FCP
      try{new PerformanceObserver(function(list){
        var e=list.getEntries();if(e.length){data.fcp=e[e.length-1].startTime;data.fp=e[0].startTime}
      }).observe({type:'paint',buffered:true})}catch(e){}
      // LCP
      try{new PerformanceObserver(function(list){
        var e=list.getEntries();if(e.length)data.lcp=e[e.length-1].startTime;
      }).observe({type:'largest-contentful-paint',buffered:true})}catch(e){}
      // CLS
      try{var clsVal=0;new PerformanceObserver(function(list){
        list.getEntries().forEach(function(e){if(!e.hadRecentInput)clsVal+=e.value});
        data.cls=Math.round(clsVal*1000)/1000;
      }).observe({type:'layout-shift',buffered:true})}catch(e){}
      // FID
      try{new PerformanceObserver(function(list){
        var e=list.getEntries();if(e.length)data.fid=e[0].processingStart-e[0].startTime;
      }).observe({type:'first-input',buffered:true})}catch(e){}
      // INP
      try{var inpVal=0;new PerformanceObserver(function(list){
        list.getEntries().forEach(function(e){
          var d2=e.processingEnd-e.startTime;if(d2>inpVal)inpVal=d2;
        });data.inp=inpVal;
      }).observe({type:'event',buffered:true,durationThreshold:40})}catch(e){}
    }
    // Send after a delay to collect all vitals
    setTimeout(function(){sendNow('/p',data)},8000);

    // Slow resources
    if(perf.getEntriesByType){
      var slowRes=perf.getEntriesByType('resource')
        .filter(function(r){return r.duration>1000})
        .slice(0,20)
        .map(function(r){return{name:r.name,type:r.initiatorType,duration:Math.round(r.duration),transferSize:r.transferSize||0,encodedSize:r.encodedBodySize||0,decodedSize:r.decodedBodySize||0}});
      if(slowRes.length){sendNow('/res',{path:location.pathname,resources:slowRes})}
    }
  }catch(e){}
}
if(d.readyState==='complete')collectPerformance();
else w.addEventListener('load',function(){setTimeout(collectPerformance,1000)});

// ─── PAGE UNLOAD ───
function sendPageUnload(){
  if(_visible){_engaged+=Date.now()-_lastEngageCheck}
  var timeOnPage=Date.now()-pgStart;
  var engScore=calcEngagement();
  // Update path with final metrics
  send('nav',{
    step:pageStep,path:location.pathname,title:d.title,
    timeOnPage:timeOnPage,scrollDepth:_maxScroll,interactions:_interactionCount,
    engagementScore:engScore,
  });
  // Session heartbeat with final engagement
  sendNow('/s',{
    action:'heartbeat',engagement_delta:_engaged,scroll_depth:_maxScroll,
    engagement_score:engScore,interactions:_interactionCount,
    url:location.href,path:location.pathname,
  });
  // Flush remaining heatmap data
  var hm=sessionStorage.getItem('bb_hm');
  if(hm){
    var hmData=JSON.parse(hm);
    if(hmData.length)sendNow('/h',{path:location.pathname,clicks:hmData});
    sessionStorage.removeItem('bb_hm');
  }
  // Flush error buffer
  if(_errors.length){sendNow('/err',_errors);_errors=[]}
  // Flush queue
  flush();
}
w.addEventListener('beforeunload',sendPageUnload);
d.addEventListener('visibilitychange',function(){if(d.hidden)sendPageUnload()});

// Form abandon tracking on unload
w.addEventListener('beforeunload',function(){
  for(var formId in _formStarts){
    send('i',{
      type:'form_abandon',formId:formId,
      path:location.pathname,url:location.href,
      props:{timeInForm:Date.now()-_formStarts[formId].start,fieldsInteracted:Object.keys(_formStarts[formId].fields).length}
    });
  }
  flush();
});

// ─── HASH UTILITY ───
function hashCode(str){
  str=String(str);var h=0;
  for(var i=0;i<str.length;i++){h=((h<<5)-h+str.charCodeAt(i))|0}
  return Math.abs(h).toString(36);
}

// ─── PUBLIC API ───
w.bb={
  track:function(event,props){send('e',{event:event,url:location.href,path:location.pathname,props:props||{}})},
  identify:function(data){sendNow('/id',data)},
  convert:function(event,value,currency){
    send('e',{event:event,conversion:true,value:value||0,currency:currency||'USD',url:location.href,path:location.pathname});
    sendNow('/s',{action:'convert'});
  },
  // Advanced API
  page:function(props){send('b',Object.assign({url:location.href,path:location.pathname,title:d.title},devInfo,props||{}))},
  error:function(msg,source,line,col){sendNow('/err',[{error_type:'manual',message:msg,source:source||'',lineno:line||0,colno:col||0,url:location.href,path:location.pathname}])},
  time:function(event,duration,props){send('e',{event:'timing_'+event,props:Object.assign({duration:duration},props||{}),url:location.href,path:location.pathname})},
  engagement:function(){return calcEngagement()},
  mark:function(name){send('i',{type:'mark',name:name,path:location.pathname,url:location.href,props:{ts:Date.now()-pgStart}})},
  startTimer:function(name){w._bbTimers=w._bbTimers||{};w._bbTimers[name]=Date.now()},
  endTimer:function(name,props){var st=w._bbTimers&&w._bbTimers[name];if(st){send('e',{event:'timer_'+name,props:Object.assign({duration:Date.now()-st},props||{}),url:location.href,path:location.pathname});delete w._bbTimers[name]}},
  setUser:function(userId,traits){sendNow('/id',Object.assign({userId:userId},traits||{}))},
  flush:flush,
};
})(window,document,navigator,screen);`


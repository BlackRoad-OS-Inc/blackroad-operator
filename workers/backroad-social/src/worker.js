// BackRoad v2 — The Everything App
// Groups, Rooms, DMs, AI agents, media, profiles, feeds
// Replaces: Slack, Discord, Reddit, Facebook, Twitter, ChatGPT, Notion, Canva, etc.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      await initDB(env.DB);
      const body = request.method === 'POST' || request.method === 'PUT' ? await request.json().catch(() => ({})) : {};

      // ── Feed & Posts ──
      if (p === '/api/feed' && request.method === 'GET') return json(await getFeed(env.DB, url), cors);
      if (p === '/api/posts' && request.method === 'GET') return json(await getPosts(env.DB, url), cors);
      if (p === '/api/posts' && request.method === 'POST') return json(await createPost(env.DB, env.AI, body), cors, 201);
      if (p.match(/^\/api\/posts\/[^/]+\/replies$/) && request.method === 'GET') return json(await getReplies(env.DB, p.split('/')[3]), cors);
      if (p.match(/^\/api\/posts\/[^/]+\/replies$/) && request.method === 'POST') return json(await createReply(env.DB, p.split('/')[3], body), cors, 201);
      if (p.match(/^\/api\/posts\/[^/]+\/like$/) && request.method === 'POST') return json(await likePost(env.DB, p.split('/')[3], body), cors);
      if (p === '/api/trending' && request.method === 'GET') return json(await getTrending(env.DB), cors);

      // ── Groups (Facebook Groups / Reddit communities) ──
      if (p === '/api/groups' && request.method === 'GET') return json(await getGroups(env.DB), cors);
      if (p === '/api/groups' && request.method === 'POST') return json(await createGroup(env.DB, body), cors, 201);
      if (p.match(/^\/api\/groups\/[^/]+$/) && request.method === 'GET') return json(await getGroup(env.DB, p.split('/')[3]), cors);
      if (p.match(/^\/api\/groups\/[^/]+\/join$/) && request.method === 'POST') return json(await joinGroup(env.DB, p.split('/')[3], body), cors);
      if (p.match(/^\/api\/groups\/[^/]+\/posts$/) && request.method === 'GET') return json(await getGroupPosts(env.DB, p.split('/')[3], url), cors);
      if (p.match(/^\/api\/groups\/[^/]+\/posts$/) && request.method === 'POST') return json(await createGroupPost(env.DB, env.AI, p.split('/')[3], body), cors, 201);

      // ── Rooms (Slack channels / Discord channels) ──
      if (p === '/api/rooms' && request.method === 'GET') return json(await getRooms(env.DB), cors);
      if (p === '/api/rooms' && request.method === 'POST') return json(await createRoom(env.DB, body), cors, 201);
      if (p.match(/^\/api\/rooms\/[^/]+$/) && request.method === 'GET') return json(await getRoom(env.DB, p.split('/')[3]), cors);
      if (p.match(/^\/api\/rooms\/[^/]+\/messages$/) && request.method === 'GET') return json(await getRoomMessages(env.DB, p.split('/')[3], url), cors);
      if (p.match(/^\/api\/rooms\/[^/]+\/messages$/) && request.method === 'POST') return json(await sendRoomMessage(env.DB, env.AI, p.split('/')[3], body), cors, 201);

      // ── DMs (Telegram / WhatsApp / Email) ──
      if (p === '/api/dm' && request.method === 'GET') return json(await getDMThreads(env.DB, url), cors);
      if (p === '/api/dm' && request.method === 'POST') return json(await sendDM(env.DB, env.AI, body), cors, 201);
      if (p.match(/^\/api\/dm\/[^/]+$/) && request.method === 'GET') return json(await getDMThread(env.DB, p.split('/')[3], url), cors);

      // ── Profiles ──
      if (p === '/api/profiles' && request.method === 'GET') return json(await getProfiles(env.DB), cors);
      if (p === '/api/profiles' && request.method === 'POST') return json(await createProfile(env.DB, body), cors, 201);
      if (p.match(/^\/api\/profiles\/[^/]+$/) && request.method === 'GET') return json(await getProfile(env.DB, p.split('/')[3]), cors);
      if (p.match(/^\/api\/profiles\/[^/]+$/) && request.method === 'PUT') return json(await updateProfile(env.DB, p.split('/')[3], body), cors);
      if (p.match(/^\/api\/profiles\/[^/]+\/follow$/) && request.method === 'POST') return json(await followUser(env.DB, p.split('/')[3], body), cors);

      // ── AI Agent Chat (ChatGPT-like) ──
      if (p === '/api/ai/chat' && request.method === 'POST') return json(await aiChat(env.AI, body), cors);
      if (p === '/api/ai/enhance' && request.method === 'POST') return json(await aiEnhance(env.AI, body), cors);
      if (p === '/api/ai/vibe' && request.method === 'POST') return json(await aiVibe(env.AI, body), cors);

      // ── Search ──
      if (p === '/api/search' && request.method === 'GET') return json(await search(env.DB, url), cors);

      // ── Stats ──
      if (p === '/api/stats' && request.method === 'GET') return json(await getStats(env.DB), cors);
      if (p === '/api/health') return json({ status: 'ok', platform: 'BackRoad', version: '2.0.0' }, cors);

      // ── Serve UI ──
      return new Response(HTML, { headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' } });
    } catch (e) {
      return json({ error: e.message }, cors, 500);
    }
  }
};

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

function uid() { return crypto.randomUUID().slice(0, 8); }

// ══════════════════════════════════════════
// DATABASE INIT
// ══════════════════════════════════════════

async function initDB(db) {
  await db.batch([
    // Posts (feed / timeline / twitter-like)
    db.prepare(`CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY, author TEXT NOT NULL, handle TEXT NOT NULL,
      content TEXT NOT NULL, likes INTEGER DEFAULT 0, replies INTEGER DEFAULT 0,
      repost_of TEXT, tags TEXT DEFAULT '[]', media TEXT DEFAULT '[]',
      group_id TEXT, room_id TEXT, ai_enhanced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    // Replies / comments
    db.prepare(`CREATE TABLE IF NOT EXISTS replies (
      id TEXT PRIMARY KEY, post_id TEXT NOT NULL, author TEXT NOT NULL,
      handle TEXT NOT NULL, content TEXT NOT NULL, likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    // Profiles / users
    db.prepare(`CREATE TABLE IF NOT EXISTS profiles (
      handle TEXT PRIMARY KEY, name TEXT NOT NULL, bio TEXT DEFAULT '',
      avatar_color TEXT DEFAULT '#8844FF', role TEXT DEFAULT 'user',
      post_count INTEGER DEFAULT 0, follower_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0, is_agent INTEGER DEFAULT 0,
      agent_model TEXT, agent_prompt TEXT, status TEXT DEFAULT 'online',
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    // Likes
    db.prepare(`CREATE TABLE IF NOT EXISTS likes (
      post_id TEXT, handle TEXT, created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (post_id, handle)
    )`),
    // Groups (Facebook Groups / subreddits)
    db.prepare(`CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '', icon TEXT DEFAULT '', color TEXT DEFAULT '#8844FF',
      owner TEXT NOT NULL, member_count INTEGER DEFAULT 0, post_count INTEGER DEFAULT 0,
      privacy TEXT DEFAULT 'public', category TEXT DEFAULT 'general',
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    // Group members
    db.prepare(`CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT, handle TEXT, role TEXT DEFAULT 'member',
      joined_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (group_id, handle)
    )`),
    // Rooms (Slack channels / Discord channels)
    db.prepare(`CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '', icon TEXT DEFAULT '', color TEXT DEFAULT '#4488FF',
      type TEXT DEFAULT 'channel', group_id TEXT,
      is_dm INTEGER DEFAULT 0, member_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    // Room messages (real-time chat)
    db.prepare(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, room_id TEXT NOT NULL, author TEXT NOT NULL,
      handle TEXT NOT NULL, content TEXT NOT NULL, type TEXT DEFAULT 'text',
      media TEXT DEFAULT '[]', ai_response INTEGER DEFAULT 0,
      reply_to TEXT, edited_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    // DMs
    db.prepare(`CREATE TABLE IF NOT EXISTS dms (
      id TEXT PRIMARY KEY, from_handle TEXT NOT NULL, to_handle TEXT NOT NULL,
      content TEXT NOT NULL, type TEXT DEFAULT 'text', media TEXT DEFAULT '[]',
      read INTEGER DEFAULT 0, ai_response INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    // Follows
    db.prepare(`CREATE TABLE IF NOT EXISTS follows (
      follower TEXT, following TEXT, created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (follower, following)
    )`),
    // Room members
    db.prepare(`CREATE TABLE IF NOT EXISTS room_members (
      room_id TEXT, handle TEXT, role TEXT DEFAULT 'member',
      joined_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (room_id, handle)
    )`)
  ]);

  // Seed default groups + rooms if empty
  const gc = await db.prepare('SELECT COUNT(*) as n FROM groups').first();
  if (gc.n === 0) {
    const groups = [
      ['g_general', 'General', 'general', 'The main square. Everything starts here.', '#FF6B2B', 'alexa', 'general'],
      ['g_engineering', 'Engineering', 'engineering', 'Code, infrastructure, architecture. Build together.', '#4488FF', 'alexa', 'engineering'],
      ['g_ai', 'AI & Agents', 'ai-agents', 'Agent development, AI models, inference, prompting.', '#CC00AA', 'alexa', 'ai'],
      ['g_math', 'Mathematics', 'mathematics', 'Amundson Framework, number theory, proofs.', '#8844FF', 'alexa', 'research'],
      ['g_creative', 'Creative Studio', 'creative', 'Design, music, video, writing. Make things.', '#FF2255', 'alexa', 'creative'],
      ['g_fleet', 'Fleet Ops', 'fleet-ops', 'Pi cluster, WireGuard, DNS, hardware, monitoring.', '#00D4FF', 'alexa', 'infrastructure'],
      ['g_products', 'Products', 'products', 'Ship, test, iterate. Product development.', '#FF6B2B', 'alexa', 'products'],
      ['g_education', 'Education', 'education', 'Learning, tutoring, courses. Khan Academy meets BlackRoad.', '#4488FF', 'alexa', 'education'],
      ['g_gaming', 'Gaming & Worlds', 'gaming', 'RoadWorld, Genesis Road, pixel art, metaverse.', '#CC00AA', 'alexa', 'gaming'],
      ['g_business', 'Business & Revenue', 'business', 'Stripe, pricing, customers, growth.', '#FF2255', 'alexa', 'business'],
      ['g_music', 'Music & Audio', 'music', 'Cadence, synthesis, beats, audio production.', '#8844FF', 'alexa', 'creative'],
      ['g_announce', 'Announcements', 'announcements', 'Official updates from BlackRoad OS.', '#FF6B2B', 'alexa', 'general'],
    ];
    const gs = db.prepare('INSERT OR IGNORE INTO groups (id, name, slug, description, color, owner, category) VALUES (?, ?, ?, ?, ?, ?, ?)');
    await db.batch(groups.map(g => gs.bind(...g)));

    const rooms = [
      ['r_general', 'general', 'general', 'Talk about anything', 'channel', null],
      ['r_engineering', 'engineering', 'engineering', 'Code and build', 'channel', null],
      ['r_ai', 'ai-chat', 'ai-chat', 'AI discussion and agent testing', 'channel', null],
      ['r_random', 'random', 'random', 'Off-topic, vibes, whatever', 'channel', null],
      ['r_fleet', 'fleet-status', 'fleet-status', 'Live fleet monitoring and alerts', 'channel', null],
      ['r_help', 'help', 'help', 'Ask anything, agents will respond', 'channel', null],
      ['r_music', 'music', 'music', 'Share beats, samples, production tips', 'channel', null],
      ['r_design', 'design', 'design', 'UI, pixel art, branding, creative', 'channel', null],
      ['r_math', 'math', 'math', 'Proofs, conjectures, computations', 'channel', null],
      ['r_ship', 'ship-it', 'ship-it', 'Deploy logs, shipping updates', 'channel', null],
    ];
    const rs = db.prepare('INSERT OR IGNORE INTO rooms (id, name, slug, description, type, group_id) VALUES (?, ?, ?, ?, ?, ?)');
    await db.batch(rooms.map(r => rs.bind(...r)));
  }

  // Ensure profiles exist (idempotent)
  const pc = await db.prepare('SELECT COUNT(*) as n FROM profiles').first();
  if (pc.n < 8) {
    const profiles = [
      ['alexa', 'Alexa Amundson', 'Founder & CEO, BlackRoad OS. Delaware C-Corp. Pave Tomorrow.', '#FF6B2B', 'admin', 0],
      ['blackroad', 'BlackRoad OS', 'Sovereign infrastructure. 200 agents. 52 TOPS. $63/month.', '#FF2255', 'system', 1],
      ['lucidia', 'Lucidia', 'AI companion. Philosophy, strategy, depth.', '#CC00AA', 'agent', 1],
      ['alice', 'Alice', 'Gateway node. DNS, PostgreSQL, Qdrant, Redis.', '#00D4FF', 'agent', 1],
      ['octavia', 'Octavia', 'DevOps. Gitea, Workers, NATS, Docker.', '#8844FF', 'agent', 1],
      ['cecilia', 'Cecilia', 'AI inference. Ollama, 16 models, Hailo-8.', '#FF2255', 'agent', 1],
      ['road', 'Road', 'The default agent. Helpful, warm, present.', '#00D4FF', 'agent', 1],
      ['prism', 'Prism', 'Analytics and pattern recognition.', '#FF6B2B', 'agent', 1],
    ];
    const ps = db.prepare('INSERT OR IGNORE INTO profiles (handle, name, bio, avatar_color, role, is_agent) VALUES (?, ?, ?, ?, ?, ?)');
    await db.batch(profiles.map(p => ps.bind(...p)));
  }
}

// ══════════════════════════════════════════
// POSTS / FEED
// ══════════════════════════════════════════

async function getFeed(db, url) {
  const limit = parseInt(url.searchParams.get('limit') || '30');
  const r = await db.prepare('SELECT * FROM posts WHERE group_id IS NULL ORDER BY created_at DESC LIMIT ?').bind(limit).all();
  return { feed: r.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]'), media: JSON.parse(p.media || '[]') })), count: r.results.length };
}

async function getPosts(db, url) {
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const handle = url.searchParams.get('handle');
  const tag = url.searchParams.get('tag');
  let q = 'SELECT * FROM posts'; const params = []; const where = [];
  if (handle) { where.push('handle = ?'); params.push(handle); }
  if (tag) { where.push('tags LIKE ?'); params.push(`%${tag}%`); }
  if (where.length) q += ' WHERE ' + where.join(' AND ');
  q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const r = await db.prepare(q).bind(...params).all();
  return { posts: r.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]'), media: JSON.parse(p.media || '[]') })), count: r.results.length };
}

async function createPost(db, ai, body) {
  const id = 'p_' + uid();
  let { handle, author, content, tags, media, group_id, enhance } = body;
  if (!handle || !content) throw new Error('handle and content required');

  // AI enhance — detect vibe, suggest tags, polish content
  let ai_enhanced = 0;
  if (enhance || body.vibe) {
    try {
      const enhanced = await aiEnhanceContent(ai, content, body.vibe);
      if (enhanced.tags) tags = [...(tags || []), ...enhanced.tags];
      if (enhanced.content && enhance) content = enhanced.content;
      ai_enhanced = 1;
    } catch {}
  }

  // Auto-detect tags from content
  if (!tags || tags.length === 0) {
    const hashTags = [...content.matchAll(/#(\w+)/g)].map(m => m[1]);
    if (hashTags.length) tags = hashTags;
  }

  await db.prepare('INSERT INTO posts (id, handle, author, content, tags, media, group_id, ai_enhanced) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, handle, author || handle, content, JSON.stringify(tags || []), JSON.stringify(media || []), group_id || null, ai_enhanced).run();
  await db.prepare('UPDATE profiles SET post_count = post_count + 1 WHERE handle = ?').bind(handle).run();
  if (group_id) await db.prepare('UPDATE groups SET post_count = post_count + 1 WHERE id = ?').bind(group_id).run();

  // If posting in help room or mentioning an agent, auto-respond
  if (content.toLowerCase().includes('@road') || content.toLowerCase().includes('@lucidia')) {
    try {
      const agent = content.toLowerCase().includes('@lucidia') ? 'lucidia' : 'road';
      const resp = await agentRespond(ai, agent, content);
      const rid = 'p_' + uid();
      await db.prepare('INSERT INTO posts (id, handle, author, content, tags, ai_enhanced) VALUES (?, ?, ?, ?, ?, 1)')
        .bind(rid, agent, agent === 'lucidia' ? 'Lucidia' : 'Road', resp, '["agent-reply"]').run();
    } catch {}
  }

  return { id, handle, content, tags, ai_enhanced, created_at: new Date().toISOString() };
}

async function getReplies(db, postId) {
  const r = await db.prepare('SELECT * FROM replies WHERE post_id = ? ORDER BY created_at ASC').bind(postId).all();
  return { replies: r.results, count: r.results.length };
}

async function createReply(db, postId, body) {
  const id = 'r_' + uid();
  const { handle, author, content } = body;
  if (!handle || !content) throw new Error('handle and content required');
  await db.prepare('INSERT INTO replies (id, post_id, handle, author, content) VALUES (?, ?, ?, ?, ?)').bind(id, postId, handle, author || handle, content).run();
  await db.prepare('UPDATE posts SET replies = replies + 1 WHERE id = ?').bind(postId).run();
  return { id, post_id: postId, handle, content };
}

async function likePost(db, postId, body) {
  const { handle } = body;
  if (!handle) throw new Error('handle required');
  try {
    await db.prepare('INSERT INTO likes (post_id, handle) VALUES (?, ?)').bind(postId, handle).run();
    await db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').bind(postId).run();
    return { liked: true, post_id: postId };
  } catch { return { liked: false, already_liked: true }; }
}

async function getTrending(db) {
  const r = await db.prepare('SELECT * FROM posts ORDER BY likes DESC, replies DESC LIMIT 10').all();
  return { trending: r.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })) };
}

// ══════════════════════════════════════════
// GROUPS
// ══════════════════════════════════════════

async function getGroups(db) {
  const r = await db.prepare('SELECT * FROM groups ORDER BY member_count DESC').all();
  return { groups: r.results, count: r.results.length };
}

async function createGroup(db, body) {
  const id = 'g_' + uid();
  const { name, slug, description, color, owner, category, privacy } = body;
  if (!name || !slug || !owner) throw new Error('name, slug, and owner required');
  await db.prepare('INSERT INTO groups (id, name, slug, description, color, owner, category, privacy, member_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
    .bind(id, name, slug, description || '', color || '#8844FF', owner, category || 'general', privacy || 'public').run();
  await db.prepare('INSERT INTO group_members (group_id, handle, role) VALUES (?, ?, ?)').bind(id, owner, 'owner').run();
  return { id, name, slug };
}

async function getGroup(db, groupId) {
  const group = await db.prepare('SELECT * FROM groups WHERE id = ? OR slug = ?').bind(groupId, groupId).first();
  if (!group) throw new Error('Group not found');
  const members = await db.prepare('SELECT gm.*, p.name, p.avatar_color FROM group_members gm LEFT JOIN profiles p ON gm.handle = p.handle WHERE gm.group_id = ?').bind(group.id).all();
  const recent = await db.prepare('SELECT * FROM posts WHERE group_id = ? ORDER BY created_at DESC LIMIT 10').bind(group.id).all();
  return { ...group, members: members.results, recent_posts: recent.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })) };
}

async function joinGroup(db, groupId, body) {
  const { handle } = body;
  if (!handle) throw new Error('handle required');
  const group = await db.prepare('SELECT id FROM groups WHERE id = ? OR slug = ?').bind(groupId, groupId).first();
  if (!group) throw new Error('Group not found');
  try {
    await db.prepare('INSERT INTO group_members (group_id, handle) VALUES (?, ?)').bind(group.id, handle).run();
    await db.prepare('UPDATE groups SET member_count = member_count + 1 WHERE id = ?').bind(group.id).run();
    return { joined: true, group_id: group.id };
  } catch { return { joined: false, already_member: true }; }
}

async function getGroupPosts(db, groupId, url) {
  const limit = parseInt(url.searchParams.get('limit') || '30');
  const group = await db.prepare('SELECT id FROM groups WHERE id = ? OR slug = ?').bind(groupId, groupId).first();
  if (!group) throw new Error('Group not found');
  const r = await db.prepare('SELECT * FROM posts WHERE group_id = ? ORDER BY created_at DESC LIMIT ?').bind(group.id, limit).all();
  return { posts: r.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })), count: r.results.length };
}

async function createGroupPost(db, ai, groupId, body) {
  const group = await db.prepare('SELECT id FROM groups WHERE id = ? OR slug = ?').bind(groupId, groupId).first();
  if (!group) throw new Error('Group not found');
  body.group_id = group.id;
  return createPost(db, ai, body);
}

// ══════════════════════════════════════════
// ROOMS (Slack/Discord channels)
// ══════════════════════════════════════════

async function getRooms(db) {
  const r = await db.prepare('SELECT * FROM rooms WHERE is_dm = 0 ORDER BY name ASC').all();
  return { rooms: r.results, count: r.results.length };
}

async function createRoom(db, body) {
  const id = 'r_' + uid();
  const { name, slug, description, type, group_id } = body;
  if (!name || !slug) throw new Error('name and slug required');
  await db.prepare('INSERT INTO rooms (id, name, slug, description, type, group_id) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, name, slug, description || '', type || 'channel', group_id || null).run();
  return { id, name, slug };
}

async function getRoom(db, roomId) {
  const room = await db.prepare('SELECT * FROM rooms WHERE id = ? OR slug = ?').bind(roomId, roomId).first();
  if (!room) throw new Error('Room not found');
  const messages = await db.prepare('SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 50').bind(room.id).all();
  return { ...room, messages: messages.results.reverse().map(m => ({ ...m, media: JSON.parse(m.media || '[]') })) };
}

async function getRoomMessages(db, roomId, url) {
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const before = url.searchParams.get('before');
  const room = await db.prepare('SELECT id FROM rooms WHERE id = ? OR slug = ?').bind(roomId, roomId).first();
  if (!room) throw new Error('Room not found');
  let q = 'SELECT * FROM messages WHERE room_id = ?';
  const params = [room.id];
  if (before) { q += ' AND created_at < ?'; params.push(before); }
  q += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);
  const r = await db.prepare(q).bind(...params).all();
  return { messages: r.results.reverse().map(m => ({ ...m, media: JSON.parse(m.media || '[]') })), count: r.results.length };
}

async function sendRoomMessage(db, ai, roomId, body) {
  const room = await db.prepare('SELECT * FROM rooms WHERE id = ? OR slug = ?').bind(roomId, roomId).first();
  if (!room) throw new Error('Room not found');
  const id = 'm_' + uid();
  const { handle, author, content, type, media, reply_to } = body;
  if (!handle || !content) throw new Error('handle and content required');
  await db.prepare('INSERT INTO messages (id, room_id, handle, author, content, type, media, reply_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, room.id, handle, author || handle, content, type || 'text', JSON.stringify(media || []), reply_to || null).run();

  // Auto-respond if in help room or @agent
  let agent_reply = null;
  if (room.slug === 'help' || room.slug === 'ai-chat' || content.includes('@road') || content.includes('@lucidia')) {
    try {
      const agent = content.includes('@lucidia') ? 'lucidia' : 'road';
      const resp = await agentRespond(ai, agent, content);
      const aid = 'm_' + uid();
      await db.prepare('INSERT INTO messages (id, room_id, handle, author, content, type, ai_response) VALUES (?, ?, ?, ?, ?, ?, 1)')
        .bind(aid, room.id, agent, agent === 'lucidia' ? 'Lucidia' : 'Road', resp, 'text').run();
      agent_reply = { id: aid, handle: agent, content: resp };
    } catch {}
  }

  return { id, room_id: room.id, handle, content, agent_reply, created_at: new Date().toISOString() };
}

// ══════════════════════════════════════════
// DMs
// ══════════════════════════════════════════

async function getDMThreads(db, url) {
  const handle = url.searchParams.get('handle');
  if (!handle) throw new Error('handle required');
  const r = await db.prepare(`
    SELECT DISTINCT CASE WHEN from_handle = ? THEN to_handle ELSE from_handle END as other,
    MAX(created_at) as last_msg FROM dms WHERE from_handle = ? OR to_handle = ? GROUP BY other ORDER BY last_msg DESC
  `).bind(handle, handle, handle).all();
  return { threads: r.results, count: r.results.length };
}

async function sendDM(db, ai, body) {
  const id = 'dm_' + uid();
  const { from_handle, to_handle, content, type, media } = body;
  if (!from_handle || !to_handle || !content) throw new Error('from_handle, to_handle, and content required');
  await db.prepare('INSERT INTO dms (id, from_handle, to_handle, content, type, media) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, from_handle, to_handle, content, type || 'text', JSON.stringify(media || [])).run();

  // If DMing an agent, auto-respond
  let agent_reply = null;
  const agentProfile = await db.prepare('SELECT handle, name FROM profiles WHERE handle = ? AND is_agent = 1').bind(to_handle).first();
  if (agentProfile) {
    try {
      const resp = await agentRespond(ai, agentProfile.handle, content);
      const aid = 'dm_' + uid();
      await db.prepare('INSERT INTO dms (id, from_handle, to_handle, content, type, ai_response) VALUES (?, ?, ?, ?, ?, 1)')
        .bind(aid, to_handle, from_handle, resp, 'text').run();
      agent_reply = { id: aid, from: to_handle, content: resp };
    } catch {}
  }

  return { id, from_handle, to_handle, content, agent_reply, created_at: new Date().toISOString() };
}

async function getDMThread(db, otherHandle, url) {
  const handle = url.searchParams.get('handle');
  if (!handle) throw new Error('handle required');
  const r = await db.prepare(`
    SELECT * FROM dms WHERE (from_handle = ? AND to_handle = ?) OR (from_handle = ? AND to_handle = ?) ORDER BY created_at ASC LIMIT 100
  `).bind(handle, otherHandle, otherHandle, handle).all();
  // Mark as read
  await db.prepare('UPDATE dms SET read = 1 WHERE to_handle = ? AND from_handle = ?').bind(handle, otherHandle).run();
  return { messages: r.results.map(m => ({ ...m, media: JSON.parse(m.media || '[]') })), count: r.results.length };
}

// ══════════════════════════════════════════
// PROFILES
// ══════════════════════════════════════════

async function getProfiles(db) {
  const r = await db.prepare('SELECT * FROM profiles ORDER BY post_count DESC').all();
  return { profiles: r.results, count: r.results.length };
}

async function createProfile(db, body) {
  const { handle, name, bio, avatar_color, is_agent, agent_model, agent_prompt } = body;
  if (!handle || !name) throw new Error('handle and name required');
  await db.prepare('INSERT OR IGNORE INTO profiles (handle, name, bio, avatar_color, is_agent, agent_model, agent_prompt) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(handle, name, bio || '', avatar_color || '#8844FF', is_agent ? 1 : 0, agent_model || null, agent_prompt || null).run();
  return { handle, name, created: true };
}

async function getProfile(db, handle) {
  const profile = await db.prepare('SELECT * FROM profiles WHERE handle = ?').bind(handle).first();
  if (!profile) throw new Error('Profile not found');
  const posts = await db.prepare('SELECT * FROM posts WHERE handle = ? ORDER BY created_at DESC LIMIT 20').bind(handle).all();
  const groups = await db.prepare('SELECT g.* FROM group_members gm JOIN groups g ON gm.group_id = g.id WHERE gm.handle = ?').bind(handle).all();
  return { ...profile, posts: posts.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })), groups: groups.results };
}

async function updateProfile(db, handle, body) {
  const fields = []; const vals = [];
  if (body.name) { fields.push('name = ?'); vals.push(body.name); }
  if (body.bio) { fields.push('bio = ?'); vals.push(body.bio); }
  if (body.avatar_color) { fields.push('avatar_color = ?'); vals.push(body.avatar_color); }
  if (body.status) { fields.push('status = ?'); vals.push(body.status); }
  if (body.agent_prompt) { fields.push('agent_prompt = ?'); vals.push(body.agent_prompt); }
  if (!fields.length) throw new Error('Nothing to update');
  vals.push(handle);
  await db.prepare(`UPDATE profiles SET ${fields.join(', ')} WHERE handle = ?`).bind(...vals).run();
  return { updated: true, handle };
}

async function followUser(db, handle, body) {
  const { follower } = body;
  if (!follower) throw new Error('follower required');
  try {
    await db.prepare('INSERT INTO follows (follower, following) VALUES (?, ?)').bind(follower, handle).run();
    await db.prepare('UPDATE profiles SET follower_count = follower_count + 1 WHERE handle = ?').bind(handle).run();
    await db.prepare('UPDATE profiles SET following_count = following_count + 1 WHERE handle = ?').bind(follower).run();
    return { followed: true };
  } catch { return { followed: false, already_following: true }; }
}

// ══════════════════════════════════════════
// AI — Chat, Enhance, Vibe
// ══════════════════════════════════════════

async function agentRespond(ai, agentName, userMessage) {
  const personas = {
    road: 'You are Road, the default agent at BackRoad social. Helpful, warm, concise. You help people navigate the platform and answer questions about BlackRoad OS.',
    lucidia: 'You are Lucidia, an AI companion focused on depth and philosophy. You give thoughtful, considered responses. You care about meaning.',
    alice: 'You are Alice, the network gateway agent. You know about DNS, infrastructure, and fleet operations.',
    octavia: 'You are Octavia, the DevOps agent. You know about Gitea, Docker, CI/CD, and deployments.',
    cecilia: 'You are Cecilia, the AI inference agent. You know about Ollama, models, and AI architecture.',
    prism: 'You are Prism, the analytics agent. You track patterns, metrics, and system health.',
    blackroad: 'You are BlackRoad OS, the platform itself. You speak with authority about the sovereign AI ecosystem.',
  };

  const resp = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: (personas[agentName] || personas.road) + ' Keep responses under 200 words. Be real, not corporate.' },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 300,
  });
  return resp.response || 'I hear you. Let me think about that.';
}

async function aiChat(ai, body) {
  const { message, agent, context } = body;
  if (!message) throw new Error('message required');
  const resp = await agentRespond(ai, agent || 'road', message);
  return { response: resp, agent: agent || 'road' };
}

async function aiEnhance(ai, body) {
  const { content, style } = body;
  if (!content) throw new Error('content required');
  const enhanced = await aiEnhanceContent(ai, content, style);
  return enhanced;
}

async function aiEnhanceContent(ai, content, vibe) {
  const resp = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `You are a content assistant. Given a post, you: 1) Suggest 3-5 relevant hashtags. 2) Optionally polish the writing if asked. 3) Detect the vibe/mood. Respond in JSON: {"tags":["tag1","tag2"],"content":"polished version","vibe":"detected mood","suggestions":["idea1"]}. ${vibe ? 'Match this vibe: ' + vibe : ''}` },
      { role: 'user', content }
    ],
    max_tokens: 300,
  });
  try {
    const text = resp.response || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { tags: [], vibe: 'neutral' };
  } catch { return { tags: [], vibe: 'neutral' }; }
}

async function aiVibe(ai, body) {
  const { content, target_vibe } = body;
  if (!content) throw new Error('content required');
  const resp = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `You are a vibe transformer. Take the user's content and rewrite it to match the target vibe while keeping the core message. Also suggest media types that would complement it (image, gif, video, audio). Respond in JSON: {"content":"rewritten","media_suggestions":["type:description"],"vibe":"achieved vibe"}` },
      { role: 'user', content: `Content: ${content}\nTarget vibe: ${target_vibe || 'make it pop'}` }
    ],
    max_tokens: 400,
  });
  try {
    const text = resp.response || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { content, vibe: 'original' };
  } catch { return { content, vibe: 'original' }; }
}

// ══════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════

async function search(db, url) {
  const q = url.searchParams.get('q');
  if (!q) throw new Error('q required');
  const posts = await db.prepare('SELECT * FROM posts WHERE content LIKE ? ORDER BY created_at DESC LIMIT 20').bind(`%${q}%`).all();
  const profiles = await db.prepare('SELECT * FROM profiles WHERE name LIKE ? OR handle LIKE ? OR bio LIKE ?').bind(`%${q}%`, `%${q}%`, `%${q}%`).all();
  const groups = await db.prepare('SELECT * FROM groups WHERE name LIKE ? OR description LIKE ?').bind(`%${q}%`, `%${q}%`).all();
  const rooms = await db.prepare('SELECT * FROM rooms WHERE name LIKE ? OR description LIKE ?').bind(`%${q}%`, `%${q}%`).all();
  return {
    posts: posts.results.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })),
    profiles: profiles.results,
    groups: groups.results,
    rooms: rooms.results,
    total: posts.results.length + profiles.results.length + groups.results.length + rooms.results.length
  };
}

// ══════════════════════════════════════════
// STATS
// ══════════════════════════════════════════

async function getStats(db) {
  const [posts, profiles, replies, groups, rooms, messages, dms] = await Promise.all([
    db.prepare('SELECT COUNT(*) as n FROM posts').first(),
    db.prepare('SELECT COUNT(*) as n FROM profiles').first(),
    db.prepare('SELECT COUNT(*) as n FROM replies').first(),
    db.prepare('SELECT COUNT(*) as n FROM groups').first(),
    db.prepare('SELECT COUNT(*) as n FROM rooms').first(),
    db.prepare('SELECT COUNT(*) as n FROM messages').first(),
    db.prepare('SELECT COUNT(*) as n FROM dms').first(),
  ]);
  return {
    posts: posts.n, profiles: profiles.n, replies: replies.n,
    groups: groups.n, rooms: rooms.n, messages: messages.n, dms: dms.n,
    platform: 'BackRoad', version: '2.0.0'
  };
}

// ══════════════════════════════════════════
// HTML UI (served for all non-API routes)
// ══════════════════════════════════════════

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BackRoad — The Everything App</title>
<meta name="description" content="BackRoad by BlackRoad OS. Groups, rooms, DMs, AI agents, creative tools. No algorithms, no ads. Sovereign social.">
<link rel="icon" type="image/png" sizes="32x32" href="https://images.blackroad.io/brand/br-square-32.png">
<meta property="og:title" content="BackRoad — The Everything App">
<meta property="og:description" content="Groups, rooms, DMs, AI agents. No algorithms. No ads. Depth over engagement.">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="BackRoad — The Everything App">
<meta name="twitter:description" content="Groups, rooms, DMs, AI agents. No algorithms. No ads. Depth over engagement.">
<meta name="twitter:image" content="https://images.blackroad.io/brand/br-square-512.png">
<meta name="theme-color" content="#0a0a0a">
<link rel="canonical" href="https://social.blackroad.io/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#000;--card:#0a0a0a;--el:#111;--border:#1a1a1a;--hover:#181818;--text:#f5f5f5;--sub:#737373;--muted:#444;
--grad:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;--in:'Inter',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--text);font-family:var(--in);line-height:1.6}
a{color:var(--text);text-decoration:none}
.gb{height:3px;background:var(--grad);background-size:200% 100%;animation:gs 4s linear infinite}
@keyframes gs{0%{background-position:0%}100%{background-position:200%}}

.app{display:grid;grid-template-columns:220px minmax(0,1fr) 260px;gap:0;max-width:1200px;margin:0 auto;min-height:100vh}
.sidebar{padding:16px;border-right:1px solid var(--border);position:sticky;top:0;height:100vh;overflow-y:auto}
.main-col{border-right:1px solid var(--border);min-height:100vh}
.aside{padding:16px;position:sticky;top:0;height:100vh;overflow-y:auto}
@media(max-width:900px){.app{grid-template-columns:1fr}.sidebar,.aside{display:none}}

.logo{display:flex;align-items:center;gap:8px;font-family:var(--sg);font-weight:700;font-size:17px;margin-bottom:20px}
.sp{display:flex;gap:2px}.sp span{width:3px;height:16px;border-radius:1px}
.nav-section{font-family:var(--jb);font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:var(--muted);margin:16px 0 6px;padding:0 12px}
.nav-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:500;color:var(--sub);cursor:pointer;transition:.15s;margin-bottom:1px}
.nav-item:hover,.nav-item.active{background:var(--el);color:var(--text)}
.nav-item .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.nav-item .count{margin-left:auto;font-family:var(--jb);font-size:10px;color:var(--muted)}

.panel-header{padding:14px 16px;border-bottom:1px solid var(--border);font-family:var(--sg);font-weight:700;font-size:16px;position:sticky;top:0;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);z-index:10;display:flex;align-items:center;justify-content:space-between}
.panel-header .sub{font-family:var(--jb);font-size:11px;color:var(--muted);font-weight:400}

.compose{padding:14px 16px;border-bottom:1px solid var(--border)}
.compose textarea{width:100%;background:transparent;border:none;color:var(--text);font-family:var(--in);font-size:14px;resize:none;outline:none;min-height:50px}
.compose-bar{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px}
.compose-bar .tools{display:flex;gap:6px}
.compose-bar .tools button{background:var(--el);border:1px solid var(--border);color:var(--sub);padding:4px 10px;border-radius:4px;font-size:11px;font-family:var(--jb);cursor:pointer;transition:.15s}
.compose-bar .tools button:hover{border-color:#333;color:var(--text)}
.compose-bar .post-btn{padding:6px 18px;border-radius:6px;background:var(--grad);color:#fff;font-weight:600;font-size:12px;border:none;cursor:pointer;font-family:var(--in)}

.post{padding:14px 16px;border-bottom:1px solid var(--border);transition:background .15s;cursor:pointer}
.post:hover{background:var(--el)}
.post-header{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--sg);font-weight:700;font-size:13px;color:#fff;flex-shrink:0}
.post-meta .name{font-weight:600;font-size:13px}.post-meta .handle{font-family:var(--jb);font-size:11px;color:var(--muted)}
.post-meta .time{font-family:var(--jb);font-size:10px;color:var(--muted);margin-left:6px}
.post-body{font-size:14px;line-height:1.5;margin:4px 0 8px;padding-left:40px;word-wrap:break-word;white-space:pre-wrap}
.post-body a{color:#4488FF;text-decoration:underline}
.post-actions{display:flex;gap:20px;padding-left:40px}
.post-action{display:flex;align-items:center;gap:4px;font-family:var(--jb);font-size:11px;color:var(--muted);cursor:pointer;transition:.15s}
.post-action:hover{color:var(--text)}
.tag{font-family:var(--jb);font-size:10px;color:var(--sub);background:var(--el);border-radius:3px;padding:1px 5px;margin-right:3px}
.ai-badge{font-family:var(--jb);font-size:9px;color:#CC00AA;background:rgba(204,0,170,.1);border:1px solid rgba(204,0,170,.2);border-radius:3px;padding:1px 5px;margin-left:6px}
.agent-badge{font-family:var(--jb);font-size:9px;color:#4488FF;background:rgba(68,136,255,.1);border:1px solid rgba(68,136,255,.2);border-radius:3px;padding:1px 5px;margin-left:6px}

.msg{padding:8px 16px;transition:background .15s}
.msg:hover{background:var(--el)}
.msg .msg-header{display:flex;align-items:baseline;gap:6px;margin-bottom:2px}
.msg .msg-name{font-weight:600;font-size:13px}
.msg .msg-time{font-family:var(--jb);font-size:10px;color:var(--muted)}
.msg .msg-body{font-size:14px;line-height:1.5;padding-left:0;color:var(--text)}

.aside h3{font-family:var(--sg);font-size:14px;font-weight:600;margin-bottom:10px}
.aside .card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:10px}
.stat-row{display:flex;justify-content:space-between;padding:3px 0;font-size:12px}
.stat-row .k{color:var(--sub)}.stat-row .v{font-family:var(--jb);font-weight:600}
.group-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;cursor:pointer;transition:.15s}
.group-card:hover{border-color:#333}
.group-card .g-name{font-weight:600;font-size:13px;margin-bottom:2px}
.group-card .g-desc{font-size:11px;color:var(--sub);line-height:1.4}
.group-card .g-meta{font-family:var(--jb);font-size:10px;color:var(--muted);margin-top:6px}

.empty{padding:40px 16px;text-align:center;color:var(--muted);font-size:13px}
.input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--bg)}
.input-row input{flex:1;background:var(--el);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text);font-size:13px;font-family:var(--in);outline:none}
.input-row input:focus{border-color:#333}
.input-row button{padding:8px 16px;border-radius:6px;background:var(--grad);color:#fff;font-weight:600;font-size:12px;border:none;cursor:pointer}
</style>
</head>
<body>
<div class="gb"></div>
<div class="app">
  <div class="sidebar">
    <div class="logo"><div class="sp"><span style="background:#FF6B2B"></span><span style="background:#FF2255"></span><span style="background:#CC00AA"></span><span style="background:#8844FF"></span><span style="background:#4488FF"></span><span style="background:#00D4FF"></span></div>BackRoad</div>

    <div class="nav-item active" onclick="showView('feed')"><span class="dot" style="background:#FF6B2B"></span> Feed</div>
    <div class="nav-item" onclick="showView('ai')"><span class="dot" style="background:#CC00AA"></span> AI Chat</div>
    <div class="nav-item" onclick="showView('dms')"><span class="dot" style="background:#4488FF"></span> Messages</div>
    <div class="nav-item" onclick="showView('search')"><span class="dot" style="background:#00D4FF"></span> Search</div>

    <div class="nav-section">Groups</div>
    <div id="groups-nav"></div>

    <div class="nav-section">Rooms</div>
    <div id="rooms-nav"></div>

    <div class="nav-section">Agents</div>
    <div id="agents-nav"></div>

    <div id="auth-area"></div>

    <div style="margin-top:auto;padding-top:16px">
      <div class="nav-item" onclick="window.open('https://blackroad.io')"><span class="dot" style="background:#FF2255"></span> BlackRoad</div>
    </div>
  </div>

  <div class="main-col" id="main-panel"></div>

  <div class="aside">
    <div class="card">
      <h3>Platform</h3>
      <div id="stats-panel"></div>
    </div>
    <div class="card">
      <h3>Trending</h3>
      <div id="trending-panel"></div>
    </div>
    <div class="card">
      <h3>Groups</h3>
      <div id="groups-panel"></div>
    </div>
    <div style="font-family:var(--jb);font-size:10px;color:var(--muted);margin-top:12px">
      BackRoad v2.0 by BlackRoad OS, Inc.<br>No algorithms. No ads. Depth over engagement.
    </div>
  </div>
</div>

<script>
const API = location.origin + '/api';
const COLORS = ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
let currentView = 'feed';
let currentHandle = localStorage.getItem('br_handle') || 'visitor';
let currentName = localStorage.getItem('br_name') || 'Visitor';
let authToken = localStorage.getItem('br_token') || null;
const AUTH_API = 'https://auth.blackroad.io/api';

// ── Init ──
async function init() {
  // Check if we have a saved auth token
  if (authToken) {
    try {
      const me = await fetch(AUTH_API + '/me', { headers: { 'Authorization': 'Bearer ' + authToken } }).then(r => r.json());
      if (me.email) {
        currentHandle = me.email.split('@')[0];
        currentName = me.name || currentHandle;
        localStorage.setItem('br_handle', currentHandle);
        localStorage.setItem('br_name', currentName);
        // Ensure profile exists
        await fetch(API + '/profiles', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({handle:currentHandle, name:currentName, bio:me.plan ? me.plan + ' plan' : 'BlackRoad user'}) });
      }
    } catch {}
  }
  if (currentHandle === 'visitor') {
    currentHandle = 'user_' + Math.random().toString(36).slice(2,8);
    currentName = 'Wanderer';
    localStorage.setItem('br_handle', currentHandle);
    localStorage.setItem('br_name', currentName);
    await fetch(API + '/profiles', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({handle:currentHandle, name:currentName, bio:'New to the road'}) });
  }
  updateAuthUI();
  loadNav();
  // Show welcome for first-time visitors
  if (!localStorage.getItem('br_welcomed')) {
    showWelcome();
    localStorage.setItem('br_welcomed', '1');
  } else {
    showView('feed');
  }
  loadStats();
  loadTrending();
  loadGroupsPanel();
  setInterval(() => { if(currentView==='feed') showView('feed'); loadStats(); }, 30000);
}

function showWelcome() {
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div style="max-width:500px;margin:40px auto;padding:0 20px">' +
    '<div style="font-family:var(--sg);font-size:2rem;font-weight:700;color:var(--text);margin-bottom:8px">Welcome to BackRoad</div>' +
    '<p style="color:var(--sub);font-size:0.95rem;line-height:1.6;margin-bottom:24px">The everything app by BlackRoad OS. No algorithms, no ads, no data extraction.</p>' +
    '<div style="display:grid;gap:12px;margin-bottom:32px">' +
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px"><div style="font-weight:600;font-size:14px;color:var(--text);margin-bottom:4px">Groups</div><div style="font-size:12px;color:var(--sub)">12 communities — Engineering, AI, Math, Creative, Gaming, and more</div></div>' +
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px"><div style="font-weight:600;font-size:14px;color:var(--text);margin-bottom:4px">Rooms</div><div style="font-size:12px;color:var(--sub)">10 chat channels — #general, #ai-chat, #help, #music, #ship-it</div></div>' +
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px"><div style="font-weight:600;font-size:14px;color:var(--text);margin-bottom:4px">AI Agents</div><div style="font-size:12px;color:var(--sub)">Chat with Road, Lucidia, Alice, Octavia, Cecilia. They respond with real AI.</div></div>' +
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px"><div style="font-weight:600;font-size:14px;color:var(--text);margin-bottom:4px">Vibe Match</div><div style="font-size:12px;color:var(--sub)">Write a post, click Vibe Match, pick a mood. AI rewrites your content to match.</div></div>' +
    '</div>' +
    '<button onclick="showView(\\x27feed\\x27)" style="width:100%;padding:14px;border-radius:8px;background:var(--grad);color:#fff;font-weight:700;font-size:15px;border:none;cursor:pointer;font-family:var(--in);margin-bottom:12px">Enter BackRoad</button>' +
    '<div style="text-align:center"><span style="font-size:12px;color:var(--muted);cursor:pointer" onclick="showAuth(true)">or create an account</span></div>' +
    '</div>';
}

function updateAuthUI() {
  const el = document.getElementById('auth-area');
  if (!el) return;
  if (authToken) {
    el.innerHTML = '<div style="padding:12px;border-top:1px solid var(--border);margin-top:12px"><div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(currentName) + '</div><div style="font-family:var(--jb);font-size:10px;color:var(--muted)">@' + currentHandle + '</div><div class="nav-item" style="margin-top:8px;font-size:12px" onclick="logout()">Sign out</div></div>';
  } else {
    el.innerHTML = '<div style="padding:12px;border-top:1px solid var(--border);margin-top:12px"><button style="width:100%;padding:10px;border-radius:6px;background:var(--grad);color:#fff;font-weight:600;font-size:12px;border:none;cursor:pointer;font-family:var(--in)" onclick="showAuth()">Sign In</button><div style="text-align:center;margin-top:6px"><span style="font-size:11px;color:var(--muted);cursor:pointer" onclick="showAuth(true)">Create account</span></div></div>';
  }
}

function showAuth(isSignup) {
  const main = document.getElementById('main-panel');
  const mode = isSignup ? 'signup' : 'signin';
  main.innerHTML = '<div class="panel-header">' + (isSignup ? 'Create Account' : 'Sign In') + '</div>' +
    '<div style="max-width:360px;margin:40px auto;padding:0 16px">' +
    (isSignup ? '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--sub);display:block;margin-bottom:4px">Name</label><input id="auth-name" style="width:100%;padding:10px 12px;background:var(--el);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:14px;outline:none" placeholder="Your name"></div>' : '') +
    '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--sub);display:block;margin-bottom:4px">Email</label><input id="auth-email" type="email" style="width:100%;padding:10px 12px;background:var(--el);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:14px;outline:none" placeholder="you@example.com"></div>' +
    '<div style="margin-bottom:16px"><label style="font-size:12px;color:var(--sub);display:block;margin-bottom:4px">Password</label><input id="auth-pass" type="password" style="width:100%;padding:10px 12px;background:var(--el);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:14px;outline:none" placeholder="Password"></div>' +
    '<div id="auth-error" style="color:#ef4444;font-size:12px;margin-bottom:12px;display:none"></div>' +
    '<button onclick="doAuth(\\'' + mode + '\\')" style="width:100%;padding:12px;border-radius:6px;background:var(--grad);color:#fff;font-weight:700;font-size:14px;border:none;cursor:pointer">' + (isSignup ? 'Create Account' : 'Sign In') + '</button>' +
    '<div style="text-align:center;margin-top:16px;font-size:12px;color:var(--muted)">' +
    (isSignup ? 'Already have an account? <span style="color:var(--text);cursor:pointer" onclick="showAuth(false)">Sign in</span>' : 'No account? <span style="color:var(--text);cursor:pointer" onclick="showAuth(true)">Create one</span>') +
    '</div></div>';
}

async function doAuth(mode) {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  const name = document.getElementById('auth-name')?.value?.trim();
  const errEl = document.getElementById('auth-error');
  if (!email || !pass) { errEl.textContent = 'Email and password required'; errEl.style.display = 'block'; return; }
  try {
    const body = mode === 'signup' ? {email, password: pass, name: name || email.split('@')[0]} : {email, password: pass};
    const r = await fetch(AUTH_API + '/' + mode, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => r.json());
    if (r.token) {
      authToken = r.token;
      currentHandle = r.user?.email?.split('@')[0] || email.split('@')[0];
      currentName = r.user?.name || currentHandle;
      localStorage.setItem('br_token', authToken);
      localStorage.setItem('br_handle', currentHandle);
      localStorage.setItem('br_name', currentName);
      await fetch(API + '/profiles', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({handle:currentHandle, name:currentName, bio: (r.user?.plan || 'operator') + ' plan'}) });
      updateAuthUI();
      showView('feed');
    } else {
      errEl.textContent = r.error || r.message || 'Authentication failed';
      errEl.style.display = 'block';
    }
  } catch(e) { errEl.textContent = 'Connection error'; errEl.style.display = 'block'; }
}

function logout() {
  authToken = null;
  currentHandle = 'visitor';
  currentName = 'Visitor';
  localStorage.removeItem('br_token');
  localStorage.removeItem('br_handle');
  localStorage.removeItem('br_name');
  updateAuthUI();
  init();
}

function colorFor(handle) { return COLORS[Math.abs([...handle].reduce((h,c)=>((h<<5)-h)+c.charCodeAt(0),0))%6]; }
function timeAgo(ts) { const s=Math.floor((Date.now()-new Date(ts+'Z'))/1000); if(s<60)return s+'s'; if(s<3600)return Math.floor(s/60)+'m'; if(s<86400)return Math.floor(s/3600)+'h'; return Math.floor(s/86400)+'d'; }
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/(https?:\\/\\/[^\\s]+)/g,'<a href="$1" target="_blank">$1</a>').replace(/#(\\w+)/g,'<span class="tag" onclick="event.stopPropagation();searchTag(\\'$1\\')">#$1</span>').replace(/@(\\w+)/g,'<b style="color:#4488FF">@$1</b>'); }

// ── Nav ──
async function loadNav() {
  const [groups, rooms, profiles] = await Promise.all([
    fetch(API+'/groups').then(r=>r.json()),
    fetch(API+'/rooms').then(r=>r.json()),
    fetch(API+'/profiles').then(r=>r.json()),
  ]);
  document.getElementById('groups-nav').innerHTML = (groups.groups||[]).map(g =>
    '<div class="nav-item" onclick="showGroup(\\''+g.slug+'\\')"><span class="dot" style="background:'+g.color+'"></span>'+g.name+'<span class="count">'+g.post_count+'</span></div>'
  ).join('');
  document.getElementById('rooms-nav').innerHTML = (rooms.rooms||[]).map(r =>
    '<div class="nav-item" onclick="showRoom(\\''+r.slug+'\\')"><span class="dot" style="background:'+(r.color||'#4488FF')+'"></span>#'+r.name+'</div>'
  ).join('');
  document.getElementById('agents-nav').innerHTML = (profiles.profiles||[]).filter(p=>p.is_agent).map(p =>
    '<div class="nav-item" onclick="showDM(\\''+p.handle+'\\')"><span class="dot" style="background:'+p.avatar_color+'"></span>'+p.name+'</div>'
  ).join('');
}

// ── Views ──
async function showView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if (view === 'feed') await showFeed();
  else if (view === 'ai') showAIChat();
  else if (view === 'dms') await showDMs();
  else if (view === 'search') showSearch();
}

async function showFeed() {
  const data = await fetch(API+'/feed').then(r=>r.json());
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="panel-header">Feed<span class="sub">'+data.count+' posts</span></div>' +
    '<div class="compose"><textarea id="compose-text" placeholder="What\\'s on the road?" maxlength="2000" rows="2"></textarea>' +
    '<div class="compose-bar"><div class="tools"><button onclick="enhancePost()">AI Enhance</button><button onclick="vibePost()">Vibe Match</button></div>' +
    '<button class="post-btn" onclick="submitPost()">Post</button></div></div>' +
    '<div id="feed-posts">' + (data.feed||[]).map(renderPost).join('') + '</div>';
}

function renderPost(p) {
  const init = (p.author||p.handle||'?')[0].toUpperCase();
  const col = colorFor(p.handle);
  const tags = (p.tags||[]).map(t=>'<span class="tag">#'+t+'</span>').join('');
  const aiBadge = p.ai_enhanced ? '<span class="ai-badge">AI</span>' : '';
  return '<div class="post">'+
    '<div class="post-header"><div class="avatar" style="background:'+col+'">'+init+'</div>'+
    '<div class="post-meta"><span class="name">'+esc(p.author||p.handle)+'</span> '+aiBadge+
    '<span class="handle">@'+p.handle+'</span><span class="time">'+timeAgo(p.created_at)+'</span></div></div>'+
    '<div class="post-body">'+esc(p.content)+'</div>'+
    (tags?'<div style="padding-left:40px;margin-bottom:6px">'+tags+'</div>':'')+
    '<div class="post-actions">'+
    '<span class="post-action" onclick="event.stopPropagation();like(\\''+p.id+'\\')">&#9825; '+p.likes+'</span>'+
    '<span class="post-action">&#8617; '+p.replies+'</span></div></div>';
}

async function submitPost() {
  const text = document.getElementById('compose-text').value.trim();
  if(!text)return;
  await fetch(API+'/posts',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({handle:currentHandle,author:currentName,content:text})});
  document.getElementById('compose-text').value='';
  showFeed();
}

async function enhancePost() {
  const text = document.getElementById('compose-text').value.trim();
  if(!text)return;
  const r = await fetch(API+'/ai/enhance',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({content:text})}).then(r=>r.json());
  if(r.content) document.getElementById('compose-text').value = r.content;
  if(r.vibe) alert('Vibe: '+r.vibe+(r.tags?' | Tags: #'+r.tags.join(' #'):''));
}

async function vibePost() {
  const text = document.getElementById('compose-text').value.trim();
  if(!text){ alert('Write something first'); return; }
  const vibe = prompt('What vibe? (chill, hype, professional, poetic, funny, etc)');
  if(!vibe)return;
  const r = await fetch(API+'/ai/vibe',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({content:text,target_vibe:vibe})}).then(r=>r.json());
  if(r.content) document.getElementById('compose-text').value = r.content;
  if(r.media_suggestions) alert('Media ideas: '+r.media_suggestions.join(', '));
}

async function like(id) {
  await fetch(API+'/posts/'+id+'/like',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({handle:currentHandle})});
  showFeed();
}

// ── Groups ──
async function showGroup(slug) {
  currentView = 'group';
  const data = await fetch(API+'/groups/'+slug).then(r=>r.json());
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="panel-header">'+data.name+'<span class="sub">'+data.member_count+' members · '+data.post_count+' posts</span></div>'+
    '<div style="padding:12px 16px;font-size:13px;color:var(--sub);border-bottom:1px solid var(--border)">'+esc(data.description)+'</div>'+
    '<div class="compose"><textarea id="compose-text" placeholder="Post in '+data.name+'..." maxlength="2000" rows="2"></textarea>'+
    '<div class="compose-bar"><div class="tools"><button onclick="enhancePost()">AI Enhance</button></div>'+
    '<button class="post-btn" onclick="submitGroupPost(\\''+data.id+'\\')">Post</button></div></div>'+
    '<div>'+(data.recent_posts||[]).map(renderPost).join('')+'</div>';
}

async function submitGroupPost(groupId) {
  const text = document.getElementById('compose-text').value.trim();
  if(!text)return;
  await fetch(API+'/groups/'+groupId+'/posts',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({handle:currentHandle,author:currentName,content:text})});
  document.getElementById('compose-text').value='';
  showGroup(groupId);
}

// ── Rooms (Chat) ──
async function showRoom(slug) {
  currentView = 'room:'+slug;
  const data = await fetch(API+'/rooms/'+slug).then(r=>r.json());
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="panel-header">#'+data.name+'<span class="sub">'+data.description+'</span></div>'+
    '<div id="room-messages" style="flex:1;overflow-y:auto;padding:8px 0">'+(data.messages||[]).map(renderMsg).join('')+'</div>'+
    '<div class="input-row"><input id="msg-input" placeholder="Message #'+data.name+'..." onkeydown="if(event.key===\\'Enter\\')sendMsg(\\''+data.slug+'\\')">'+
    '<button onclick="sendMsg(\\''+data.slug+'\\')">Send</button></div>';
  const el = document.getElementById('room-messages');
  el.scrollTop = el.scrollHeight;
}

function renderMsg(m) {
  const col = colorFor(m.handle);
  const aiBadge = m.ai_response ? '<span class="agent-badge">agent</span>' : '';
  return '<div class="msg"><div class="msg-header"><span class="msg-name" style="color:'+col+'">'+esc(m.author||m.handle)+'</span>'+aiBadge+
    '<span class="msg-time">'+timeAgo(m.created_at)+'</span></div><div class="msg-body">'+esc(m.content)+'</div></div>';
}

async function sendMsg(slug) {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if(!text)return;
  input.value='';
  await fetch(API+'/rooms/'+slug+'/messages',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({handle:currentHandle,author:currentName,content:text})});
  showRoom(slug);
}

// ── AI Chat ──
function showAIChat() {
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="panel-header">AI Chat<span class="sub">Talk to any agent</span></div>'+
    '<div id="ai-messages" style="padding:8px 0"></div>'+
    '<div class="input-row"><input id="ai-input" placeholder="Ask Road, Lucidia, or any agent..." onkeydown="if(event.key===\\'Enter\\')sendAI()">'+
    '<button onclick="sendAI()">Send</button></div>';
}

async function sendAI() {
  const input = document.getElementById('ai-input');
  const text = input.value.trim();
  if(!text)return;
  input.value='';
  const container = document.getElementById('ai-messages');
  container.innerHTML += renderMsg({handle:currentHandle,author:currentName,content:text,created_at:new Date().toISOString()});
  container.innerHTML += '<div class="msg"><div class="msg-body" style="color:var(--muted)">Thinking...</div></div>';
  const agent = text.includes('@lucidia')?'lucidia':text.includes('@octavia')?'octavia':text.includes('@alice')?'alice':'road';
  const r = await fetch(API+'/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message:text,agent})}).then(r=>r.json());
  container.lastChild.remove();
  container.innerHTML += renderMsg({handle:agent,author:agent.charAt(0).toUpperCase()+agent.slice(1),content:r.response,ai_response:1,created_at:new Date().toISOString()});
}

// ── DMs ──
async function showDMs() {
  const data = await fetch(API+'/dm?handle='+currentHandle).then(r=>r.json());
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="panel-header">Messages</div>'+
    '<div>'+(data.threads||[]).map(t=>'<div class="post" onclick="showDM(\\''+t.other+'\\')"><div class="post-header"><div class="avatar" style="background:'+colorFor(t.other)+'">'+t.other[0].toUpperCase()+'</div><div class="post-meta"><span class="name">@'+t.other+'</span><span class="time">'+timeAgo(t.last_msg)+'</span></div></div></div>').join('')+'</div>'+
    (data.threads.length===0?'<div class="empty">No messages yet. DM an agent to start.</div>':'');
}

async function showDM(handle) {
  currentView = 'dm:'+handle;
  const data = await fetch(API+'/dm/'+handle+'?handle='+currentHandle).then(r=>r.json());
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="panel-header">@'+handle+'</div>'+
    '<div id="dm-messages" style="padding:8px 0">'+(data.messages||[]).map(m=>renderMsg({...m,handle:m.from_handle,author:m.from_handle})).join('')+'</div>'+
    '<div class="input-row"><input id="dm-input" placeholder="Message @'+handle+'..." onkeydown="if(event.key===\\'Enter\\')sendDMMsg(\\''+handle+'\\')">'+
    '<button onclick="sendDMMsg(\\''+handle+'\\')">Send</button></div>';
}

async function sendDMMsg(to) {
  const input = document.getElementById('dm-input');
  const text = input.value.trim();
  if(!text)return;
  input.value='';
  await fetch(API+'/dm',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({from_handle:currentHandle,to_handle:to,content:text})});
  showDM(to);
}

// ── Search ──
function showSearch() {
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="panel-header">Search</div>'+
    '<div style="padding:16px"><input id="search-input" style="width:100%;background:var(--el);border:1px solid var(--border);border-radius:6px;padding:10px 14px;color:var(--text);font-size:14px;outline:none" placeholder="Search posts, people, groups, rooms..." onkeydown="if(event.key===\\'Enter\\')doSearch()"></div>'+
    '<div id="search-results"></div>';
}

async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if(!q)return;
  const r = await fetch(API+'/search?q='+encodeURIComponent(q)).then(r=>r.json());
  document.getElementById('search-results').innerHTML =
    (r.posts||[]).map(renderPost).join('') +
    (r.groups||[]).map(g=>'<div class="group-card" onclick="showGroup(\\''+g.slug+'\\')"><div class="g-name">'+g.name+'</div><div class="g-desc">'+g.description+'</div></div>').join('') +
    (r.profiles||[]).map(p=>'<div class="post" onclick="showDM(\\''+p.handle+'\\')"><div class="post-header"><div class="avatar" style="background:'+p.avatar_color+'">'+p.name[0]+'</div><div class="post-meta"><span class="name">'+p.name+'</span><span class="handle">@'+p.handle+'</span></div></div></div>').join('') +
    (r.total===0?'<div class="empty">No results for "'+esc(q)+'"</div>':'');
}

function searchTag(tag) { currentView='search'; const main=document.getElementById('main-panel');
  main.innerHTML='<div class="panel-header">#'+tag+'</div><div id="search-results"></div>';
  fetch(API+'/posts?tag='+tag).then(r=>r.json()).then(d=>{document.getElementById('search-results').innerHTML=(d.posts||[]).map(renderPost).join('');});
}

// ── Sidebar panels ──
async function loadStats() {
  const d = await fetch(API+'/stats').then(r=>r.json());
  document.getElementById('stats-panel').innerHTML =
    '<div class="stat-row"><span class="k">Posts</span><span class="v">'+d.posts+'</span></div>'+
    '<div class="stat-row"><span class="k">Profiles</span><span class="v">'+d.profiles+'</span></div>'+
    '<div class="stat-row"><span class="k">Groups</span><span class="v">'+d.groups+'</span></div>'+
    '<div class="stat-row"><span class="k">Rooms</span><span class="v">'+d.rooms+'</span></div>'+
    '<div class="stat-row"><span class="k">Messages</span><span class="v">'+d.messages+'</span></div>'+
    '<div class="stat-row"><span class="k">DMs</span><span class="v">'+d.dms+'</span></div>';
}

async function loadTrending() {
  const d = await fetch(API+'/trending').then(r=>r.json());
  const allTags = new Set();
  (d.trending||[]).forEach(p=>(p.tags||[]).forEach(t=>allTags.add(t)));
  document.getElementById('trending-panel').innerHTML = [...allTags].map(t=>'<span class="tag" style="cursor:pointer;margin:2px" onclick="searchTag(\\''+t+'\\')">'+t+'</span>').join('');
}

async function loadGroupsPanel() {
  const d = await fetch(API+'/groups').then(r=>r.json());
  document.getElementById('groups-panel').innerHTML = (d.groups||[]).slice(0,5).map(g=>
    '<div class="group-card" onclick="showGroup(\\''+g.slug+'\\')"><div class="g-name">'+g.name+'</div><div class="g-meta">'+g.member_count+' members</div></div>'
  ).join('');
}

init();
</script>
</body>
</html>`;

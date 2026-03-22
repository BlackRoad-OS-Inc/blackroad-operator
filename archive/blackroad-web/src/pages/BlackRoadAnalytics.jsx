import { useState, useEffect } from 'react';

const mono = "'JetBrains Mono', monospace";
const grotesk = "'Space Grotesk', sans-serif";
const STATS_URL = 'https://stats-blackroad.amundsonalexa.workers.dev';

export default function BlackRoadAnalytics() {
  const [range, setRange] = useState('24h');
  const [data, setData] = useState(null);
  const [fleet, setFleet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${STATS_URL}/analytics?range=${range}`).then(r => r.json()).catch(() => null),
      fetch(`${STATS_URL}/fleet`).then(r => r.json()).catch(() => null),
    ]).then(([analytics, fleetData]) => {
      setData(analytics);
      setFleet(fleetData);
      setLoading(false);
    });
  }, [range]);

  const s = {
    page: { minHeight: '100vh', background: '#000', color: '#f0f0f0', padding: '40px 24px 80px', marginLeft: 48 },
    container: { maxWidth: 900, margin: '0 auto' },
    h1: { fontFamily: grotesk, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 },
    sub: { fontFamily: mono, fontSize: 11, color: '#383838', marginBottom: 32 },
    tabs: { display: 'flex', gap: 8, marginBottom: 32 },
    tab: (active) => ({
      fontFamily: mono, fontSize: 11, padding: '6px 14px', cursor: 'pointer',
      background: 'none', border: `1px solid ${active ? '#333' : '#141414'}`,
      color: active ? '#f0f0f0' : '#444', borderRadius: 2,
    }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#141414', border: '1px solid #141414', marginBottom: 32 },
    stat: { background: '#000', padding: '24px 16px', textAlign: 'center' },
    statNum: { fontFamily: grotesk, fontSize: 32, fontWeight: 700 },
    statLabel: { fontFamily: mono, fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 },
    section: { marginBottom: 40 },
    sectionTitle: { fontFamily: grotesk, fontSize: 18, fontWeight: 700, marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #141414' },
    row: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0a0a0a', gap: 12 },
    barContainer: { flex: 1, height: 8, background: '#111', borderRadius: 4, overflow: 'hidden' },
    bar: (pct, color) => ({ height: '100%', width: `${pct}%`, background: color || '#8844FF', borderRadius: 4, transition: 'width 0.4s' }),
    label: { fontFamily: mono, fontSize: 11, color: '#555', width: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    val: { fontFamily: mono, fontSize: 11, color: '#777', width: 50, textAlign: 'right' },
    empty: { fontFamily: mono, fontSize: 12, color: '#333', padding: 40, textAlign: 'center' },
    fleetGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: '#141414', border: '1px solid #141414' },
    fleetCard: { background: '#000', padding: 16 },
    dot: (up) => ({ width: 6, height: 6, borderRadius: '50%', background: up ? '#00ff88' : '#ff3355', display: 'inline-block', marginRight: 6 }),
  };

  const maxViews = data?.top_pages?.length ? Math.max(...data.top_pages.map(p => p.views)) : 1;
  const maxEvents = data?.top_events?.length ? Math.max(...data.top_events.map(e => e.count)) : 1;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.h1}>Analytics</h1>
        <p style={s.sub}>Sovereign analytics · No cookies · No PII · Real-time from D1</p>

        <div style={s.tabs}>
          {['24h', '7d', '30d'].map(r => (
            <button key={r} style={s.tab(range === r)} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>

        {loading ? (
          <div style={s.empty}>Loading analytics...</div>
        ) : !data ? (
          <div style={s.empty}>No data available</div>
        ) : (
          <>
            <div style={s.grid}>
              <div style={s.stat}><div style={s.statNum}>{data.views ?? 0}</div><div style={s.statLabel}>Page Views</div></div>
              <div style={s.stat}><div style={s.statNum}>{data.unique_sessions ?? 0}</div><div style={s.statLabel}>Sessions</div></div>
              <div style={s.stat}><div style={s.statNum}>{data.events ?? 0}</div><div style={s.statLabel}>Events</div></div>
              <div style={s.stat}><div style={s.statNum}>{data.countries?.length ?? 0}</div><div style={s.statLabel}>Countries</div></div>
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Top Pages</h2>
              {data.top_pages?.length ? data.top_pages.map((p, i) => (
                <div key={i} style={s.row}>
                  <div style={s.label}>{p.path}</div>
                  <div style={s.barContainer}><div style={s.bar(p.views / maxViews * 100)} /></div>
                  <div style={s.val}>{p.views}</div>
                </div>
              )) : <div style={s.empty}>No page views yet</div>}
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Events</h2>
              {data.top_events?.length ? data.top_events.map((e, i) => (
                <div key={i} style={s.row}>
                  <div style={s.label}>{e.name}</div>
                  <div style={s.barContainer}><div style={s.bar(e.count / maxEvents * 100, '#FF6B2B')} /></div>
                  <div style={s.val}>{e.count}</div>
                </div>
              )) : <div style={s.empty}>No events yet</div>}
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Countries</h2>
              {data.countries?.length ? data.countries.map((c, i) => (
                <div key={i} style={s.row}>
                  <div style={s.label}>{c.country || 'Unknown'}</div>
                  <div style={s.barContainer}><div style={s.bar(c.views / (data.countries[0]?.views || 1) * 100, '#00D4FF')} /></div>
                  <div style={s.val}>{c.views}</div>
                </div>
              )) : <div style={s.empty}>No country data</div>}
            </div>
          </>
        )}

        {fleet?.data?.nodes && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Fleet Status</h2>
            <div style={s.fleetGrid}>
              {fleet.data.nodes.map((n, i) => (
                <div key={i} style={s.fleetCard}>
                  <div style={{ fontFamily: grotesk, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    <span style={s.dot(n.status === 'online')} />{n.name}
                  </div>
                  {n.status === 'online' ? (
                    <div style={{ fontFamily: mono, fontSize: 9, color: '#444', lineHeight: 1.8 }}>
                      {n.cpu_temp}°C · {n.disk_pct}% disk<br />
                      {n.ollama_models} models · {n.uptime}
                    </div>
                  ) : (
                    <div style={{ fontFamily: mono, fontSize: 9, color: '#ff3355' }}>Offline</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: '#222', marginTop: 8 }}>
              Updated {fleet.updated_at ? new Date(fleet.updated_at).toLocaleString() : '—'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// BlackRoad Universal Navigation — injected into ALL workers
// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Usage: import { NAV_HTML } from './nav.js' then inject after <body>

export const NAV_CSS = `
<style id="br-nav-style">
#br-nav{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);border-bottom:1px solid #1a1a1a;font-family:'Space Grotesk',-apple-system,sans-serif}
#br-nav .br-nav-inner{max-width:1200px;margin:0 auto;padding:0 20px;height:48px;display:flex;align-items:center;justify-content:space-between}
#br-nav .br-nav-left{display:flex;align-items:center;gap:12px}
#br-nav .br-nav-home{text-decoration:none;display:flex;align-items:center;gap:8px}
#br-nav .br-nav-mark{display:flex;gap:2px}
#br-nav .br-nav-mark span{width:6px;height:6px;border-radius:50%}
#br-nav .br-nav-title{color:#f5f5f5;font-weight:600;font-size:14px;white-space:nowrap}
#br-nav .br-nav-sep{color:#333;font-size:14px}
#br-nav .br-nav-page{color:#999;font-size:13px;font-weight:400}
#br-nav .br-nav-links{display:flex;align-items:center;gap:4px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
#br-nav .br-nav-links::-webkit-scrollbar{display:none}
#br-nav .br-nav-links a{color:#888;text-decoration:none;font-size:12px;padding:6px 10px;border-radius:6px;white-space:nowrap;transition:color 0.15s,background 0.15s}
#br-nav .br-nav-links a:hover{color:#f5f5f5;background:#111}
#br-nav .br-nav-links a.active{color:#f5f5f5;background:#1a1a1a}
#br-nav .br-nav-back{color:#666;text-decoration:none;font-size:12px;padding:6px 8px;border-radius:6px;display:flex;align-items:center;gap:4px;transition:color 0.15s;cursor:pointer;border:none;background:none}
#br-nav .br-nav-back:hover{color:#f5f5f5}
#br-nav .br-nav-menu{display:none;background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:6px}
#br-nav-dropdown{display:none;position:fixed;top:48px;left:0;right:0;background:rgba(0,0,0,0.96);backdrop-filter:blur(12px);border-bottom:1px solid #1a1a1a;z-index:9998;padding:12px 20px;max-height:calc(100vh - 48px);overflow-y:auto}
#br-nav-dropdown.open{display:flex;flex-wrap:wrap;gap:4px}
#br-nav-dropdown a{color:#888;text-decoration:none;font-size:13px;padding:8px 14px;border-radius:6px;transition:color 0.15s,background 0.15s}
#br-nav-dropdown a:hover,#br-nav-dropdown a.active{color:#f5f5f5;background:#111}
body{padding-top:48px !important}
@media(max-width:768px){
  #br-nav .br-nav-links{display:none}
  #br-nav .br-nav-menu{display:block}
}
</style>`;

export const NAV_PRODUCTS = [
  { href: 'https://blackroad.io', label: 'Home', id: 'home' },
  { href: 'https://chat.blackroad.io', label: 'Chat', id: 'chat' },
  { href: 'https://search.blackroad.io', label: 'Search', id: 'search' },
  { href: 'https://tutor.blackroad.io', label: 'Tutor', id: 'tutor' },
  { href: 'https://pay.blackroad.io', label: 'Pay', id: 'pay' },
  { href: 'https://canvas.blackroad.io', label: 'Canvas', id: 'canvas' },
  { href: 'https://cadence.blackroad.io', label: 'Cadence', id: 'cadence' },
  { href: 'https://video.blackroad.io', label: 'Video', id: 'video' },
  { href: 'https://radio.blackroad.io', label: 'Radio', id: 'radio' },
  { href: 'https://game.blackroad.io', label: 'Game', id: 'game' },
  { href: 'https://live.blackroad.io', label: 'Live', id: 'live' },
  { href: 'https://roundtrip.blackroad.io', label: 'Agents', id: 'roundtrip' },
  { href: 'https://roadcode.blackroad.io', label: 'RoadCode', id: 'roadcode' },
  { href: 'https://hq.blackroad.io', label: 'HQ', id: 'hq' },
  { href: 'https://app.blackroad.io', label: 'Dashboard', id: 'app' },
  { href: 'https://auth.blackroad.io', label: 'Auth', id: 'auth' },
  { href: 'https://brand.blackroad.io', label: 'Brand', id: 'brand' },
];

const MARK_COLORS = ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];

export function buildNavHTML(currentId) {
  const mark = MARK_COLORS.map(c => `<span style="background:${c}"></span>`).join('');
  const links = NAV_PRODUCTS.map(p =>
    `<a href="${p.href}"${p.id === currentId ? ' class="active"' : ''}>${p.label}</a>`
  ).join('');
  const dropdownLinks = NAV_PRODUCTS.map(p =>
    `<a href="${p.href}"${p.id === currentId ? ' class="active"' : ''}>${p.label}</a>`
  ).join('');
  const current = NAV_PRODUCTS.find(p => p.id === currentId);
  const pageLabel = current ? current.label : '';

  return `${NAV_CSS}
<nav id="br-nav">
  <div class="br-nav-inner">
    <div class="br-nav-left">
      <button class="br-nav-back" onclick="history.length>1?history.back():location.href='https://blackroad.io'" title="Back" aria-label="Go back">&larr;</button>
      <a href="https://blackroad.io" class="br-nav-home">
        <div class="br-nav-mark">${mark}</div>
        <span class="br-nav-title">BlackRoad</span>
      </a>
      ${pageLabel ? `<span class="br-nav-sep">/</span><span class="br-nav-page">${pageLabel}</span>` : ''}
    </div>
    <div class="br-nav-links">${links}</div>
    <button class="br-nav-menu" onclick="document.getElementById('br-nav-dropdown').classList.toggle('open')" aria-label="Menu">&#9776;</button>
  </div>
</nav>
<div id="br-nav-dropdown">${dropdownLinks}</div>
<script>
document.addEventListener('click',function(e){
  var dd=document.getElementById('br-nav-dropdown');
  if(dd&&dd.classList.contains('open')&&!e.target.closest('#br-nav')&&!e.target.closest('#br-nav-dropdown')){dd.classList.remove('open')}
});
document.querySelectorAll('#br-nav a, #br-nav-dropdown a').forEach(function(a){a.removeAttribute('target')});
</script>`;
}

// For workers that use inline template strings, export a pre-built string function
export function navString(currentId) {
  return buildNavHTML(currentId);
}

/* BlackRoad OS — floating CTA banner for cross-domain sites */
(function(){
  if(document.getElementById('br-cta-banner')) return;
  if(location.hostname === 'blackroad.io') return; /* already has CTAs */
  var b = document.createElement('div');
  b.id = 'br-cta-banner';
  b.innerHTML = '<a href="https://search.blackroad.io" style="color:#f5f5f5;text-decoration:none;font-weight:600;">Try BlackRoad OS Free &rarr;</a> <a href="https://chat.blackroad.io" style="color:#a3a3a3;text-decoration:underline;text-underline-offset:3px;margin-left:12px;font-size:0.8rem;">Chat</a> <a href="https://roundtrip.blackroad.io" style="color:#a3a3a3;text-decoration:underline;text-underline-offset:3px;margin-left:12px;font-size:0.8rem;">200 Agents</a>';
  b.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9998;background:#131313;border-top:1px solid #1a1a1a;padding:10px 20px;text-align:center;font-family:"JetBrains Mono",Inter,monospace;font-size:0.82rem;display:flex;align-items:center;justify-content:center;gap:4px;';
  document.body.appendChild(b);
})();

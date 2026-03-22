export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lucidia — BlackRoad OS</title>
<link rel="icon" href="https://blackroad.io/favicon-32.png">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px}
  .grad{background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  h1{font-size:clamp(36px,8vw,72px);font-weight:700;letter-spacing:-0.04em;margin-bottom:16px}
  p{font-family:'Inter',sans-serif;font-size:18px;color:#555;max-width:520px;line-height:1.7;margin-bottom:32px}
  .tagline{font-family:'JetBrains Mono',monospace;font-size:12px;color:#333;margin-top:40px}
  a{color:#4488FF;text-decoration:none;font-family:'Inter',sans-serif;font-size:15px;padding:12px 28px;border:1px solid #222;display:inline-block;transition:all 0.2s}
  a:hover{border-color:#4488FF;background:rgba(68,136,255,0.08)}
  .domain{font-family:'JetBrains Mono',monospace;font-size:11px;color:#222;margin-top:60px}
</style>
</head>
<body>
  <h1 class="grad">${host === 'lucidia.studio' ? 'Lucidia Studio' : 'Lucidia'}</h1>
  <p>${host === 'lucidia.studio' 
    ? 'Creative tools and AI-powered content creation. Built on BlackRoad OS — sovereign, persistent, remembered.' 
    : 'AI with persistent memory. She remembers every conversation, every decision, every context. Your AI actually knows who you are.'}</p>
  <a href="https://blackroad.io">Explore BlackRoad OS →</a>
  <div class="tagline">Remember the Road. Pave Tomorrow.</div>
  <div class="domain">© 2026 BlackRoad OS, Inc.</div>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }
};

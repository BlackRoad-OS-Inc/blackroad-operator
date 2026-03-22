export default {
  async fetch(request) {
    const codex = {
      total_files: 8000,
      indexed: 7842,
      categories: ['agents', 'deployment', 'infrastructure', 'automation', 'ui', 'api', 'database'],
      recent: [
        { file: 'enhance-ui.sh', type: 'ui', status: 'executed' },
        { file: 'enhance-all-github-ui.sh', type: 'deployment', status: 'ready' },
        { file: 'blackroad-codex-scanner.py', type: 'indexing', status: 'active' }
      ],
      search_enabled: true,
      memory_integration: true
    }
    
    return new Response(`
<!DOCTYPE html>
<html><head><title>BlackRoad Codex</title>
<style>
body { font-family: monospace; background: #000; color: #0f0; padding: 2rem; }
.header { font-size: 2rem; margin-bottom: 2rem; text-shadow: 0 0 10px #0f0; }
.stat { background: #111; border: 1px solid #0f0; padding: 1rem; margin: 0.5rem 0; }
.file { color: #0ff; cursor: pointer; }
.file:hover { text-decoration: underline; }
pre { background: #111; padding: 1rem; border-left: 3px solid #0f0; overflow-x: auto; }
</style></head><body>
<div class="header">📚 BLACKROAD CODEX</div>
<div class="stat">Total Scripts: <strong>${codex.total_files}</strong></div>
<div class="stat">Indexed: <strong>${codex.indexed}</strong> (${Math.round(codex.indexed/codex.total_files*100)}%)</div>
<div class="stat">Categories: ${codex.categories.join(', ')}</div>
<h3 style="margin-top:2rem;">Recent Activity</h3>
${codex.recent.map(f => `<div class="stat"><span class="file">${f.file}</span> [${f.type}] - ${f.status}</div>`).join('')}
<pre>
> codex search "deploy"
> codex index /Users/alexa
> codex memory --sync
> codex agents --list
</pre>
</body></html>
    `, { headers: { 'content-type': 'text/html' } })
  }
}

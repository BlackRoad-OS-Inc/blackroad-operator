/* BlackRoad OS Feedback Widget — drop-in, no dependencies */
(function(){
  if(document.getElementById('br-feedback-widget')) return;

  var css = document.createElement('style');
  css.textContent = [
    '#br-feedback-toggle{position:fixed;bottom:20px;right:20px;z-index:9999;background:#131313;border:1px solid #1a1a1a;color:#a3a3a3;padding:8px 14px;border-radius:8px;cursor:pointer;font-family:"JetBrains Mono",monospace;font-size:0.75rem;transition:border-color 0.2s,color 0.2s}',
    '#br-feedback-toggle:hover{border-color:#525252;color:#f5f5f5}',
    '#br-feedback-panel{position:fixed;bottom:60px;right:20px;z-index:9999;background:#131313;border:1px solid #1a1a1a;border-radius:12px;padding:16px;width:300px;display:none;font-family:Inter,sans-serif}',
    '#br-feedback-panel.open{display:block}',
    '#br-feedback-panel textarea{width:100%;min-height:80px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;color:#d4d4d4;padding:10px;font-size:0.85rem;font-family:inherit;resize:vertical;box-sizing:border-box}',
    '#br-feedback-panel textarea:focus{outline:none;border-color:#525252}',
    '#br-feedback-panel .fb-title{font-size:0.8rem;font-weight:600;color:#f5f5f5;margin-bottom:8px}',
    '#br-feedback-panel .fb-hint{font-size:0.7rem;color:#525252;margin-bottom:10px}',
    '#br-feedback-send{background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);color:#f5f5f5;border:none;padding:8px 16px;border-radius:6px;font-weight:700;font-size:0.8rem;cursor:pointer;margin-top:8px;width:100%}',
    '#br-feedback-send:hover{opacity:0.9}',
    '#br-feedback-send:disabled{opacity:0.4;cursor:default}',
    '#br-feedback-status{font-size:0.7rem;color:#525252;margin-top:6px;text-align:center}'
  ].join('\n');
  document.head.appendChild(css);

  var toggle = document.createElement('button');
  toggle.id = 'br-feedback-toggle';
  toggle.textContent = 'Feedback';
  document.body.appendChild(toggle);

  var panel = document.createElement('div');
  panel.id = 'br-feedback-panel';
  panel.innerHTML = '<div class="fb-title">Send Feedback</div>' +
    '<div class="fb-hint">What do you think? Bug reports, ideas, anything.</div>' +
    '<textarea id="br-feedback-text" placeholder="Type your feedback..."></textarea>' +
    '<button id="br-feedback-send">Send</button>' +
    '<div id="br-feedback-status"></div>';
  document.body.appendChild(panel);

  toggle.addEventListener('click', function(){
    panel.classList.toggle('open');
  });

  document.getElementById('br-feedback-send').addEventListener('click', function(){
    var text = document.getElementById('br-feedback-text').value.trim();
    if(!text) return;
    var btn = this;
    var status = document.getElementById('br-feedback-status');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = '';

    fetch('https://roundtrip.blackroad.io/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        agent: 'feedback',
        message: '[FEEDBACK from ' + location.hostname + location.pathname + '] ' + text,
        channel: 'general'
      })
    }).then(function(r){ return r.json(); }).then(function(){
      status.textContent = 'Sent. Thank you!';
      status.style.color = '#22c55e';
      document.getElementById('br-feedback-text').value = '';
      btn.textContent = 'Send';
      btn.disabled = false;
      setTimeout(function(){ panel.classList.remove('open'); }, 1500);
    }).catch(function(){
      status.textContent = 'Failed to send. Try again.';
      status.style.color = '#ef4444';
      btn.textContent = 'Send';
      btn.disabled = false;
    });
  });
})();

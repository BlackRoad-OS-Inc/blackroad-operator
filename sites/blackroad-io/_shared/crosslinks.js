/* BlackRoad OS — cross-domain link footer for SEO */
(function(){
  if(document.getElementById('br-crosslinks')) return;
  var links = [
    ['blackroad.io','Main'],
    ['blackroadai.com','AI'],
    ['blackroad.company','Company'],
    ['blackroad.network','Network'],
    ['blackroad.systems','Status'],
    ['blackroad.me','IDE'],
    ['blackroadquantum.com','Math'],
    ['roadchain.io','Blockchain'],
    ['roadcoin.io','Payments'],
    ['lucidia.earth','Lucidia'],
    ['search.blackroad.io','Search'],
    ['chat.blackroad.io','Chat'],
    ['roundtrip.blackroad.io','Agents'],
    ['pay.blackroad.io','Pricing'],
    ['social.blackroad.io','Social']
  ];
  var host = location.hostname;
  var html = links.filter(function(l){ return l[0] !== host; }).map(function(l){
    return '<a href="https://'+l[0]+'" style="color:#525252;text-decoration:none;font-size:0.7rem;transition:color 0.2s;" onmouseover="this.style.color=\'#f5f5f5\'" onmouseout="this.style.color=\'#525252\'">'+l[1]+'</a>';
  }).join(' · ');
  var d = document.createElement('div');
  d.id = 'br-crosslinks';
  d.style.cssText = 'text-align:center;padding:8px 16px;font-family:"JetBrains Mono",monospace;border-top:1px solid #1a1a1a;background:#0a0a0a;';
  d.innerHTML = html;
  var footer = document.querySelector('footer');
  if(footer) footer.parentNode.insertBefore(d, footer.nextSibling);
  else document.body.appendChild(d);
})();

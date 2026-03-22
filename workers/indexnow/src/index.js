const KEY = 'blackroad2026indexnow';
const HOSTS = ['blackroad.io','blackroad.company','blackroadai.com','blackroadinc.us','blackroadquantum.com','blackroad.me','blackroad.network','blackroad.systems','roadchain.io','roadcoin.io','lucidia.earth','lucidia.studio','lucidiaqi.com','blackboxprogramming.io','blackroadqi.com','chat.blackroad.io','search.blackroad.io','roundtrip.blackroad.io','auth.blackroad.io','app.blackroad.io'];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === `/${KEY}.txt`) return new Response(KEY, {headers:{'Content-Type':'text/plain'}});
    
    if (url.pathname === '/submit') {
      const urls = HOSTS.flatMap(h => [`https://${h}/`, `https://${h}/sitemap.xml`]);
      const results = {};
      for (const engine of ['api.indexnow.org', 'www.bing.com']) {
        try {
          const r = await fetch(`https://${engine}/indexnow`, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({host:'blackroad.io', key:KEY, keyLocation:`https://blackroad-indexnow.amundsonalexa.workers.dev/${KEY}.txt`, urlList:urls})
          });
          results[engine] = r.status;
        } catch(e) { results[engine] = e.message; }
      }
      return Response.json({submitted:urls.length, results}, {headers:{'Content-Type':'application/json'}});
    }
    return Response.json({service:'IndexNow', key:KEY, submit:'/submit'});
  }
};

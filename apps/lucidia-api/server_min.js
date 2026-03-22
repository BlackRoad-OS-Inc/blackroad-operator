const http = require('http'); const fs = require('fs'); const {spawnSync}=require('child_process'); const p=require('path'); const crypto=require('crypto');
const PORT=4000, LOG='/var/log/blackroad/api.log';
const ENV=Object.fromEntries(fs.readFileSync('/etc/blackroad/deploy.env','utf8').split('\n').filter(Boolean).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const SECRET=ENV.DEPLOY_SECRET, WEBROOT=ENV.WEBROOT||'/var/www/blackroad', TMP='/tmp/blackroad-deploy'; fs.mkdirSync(TMP,{recursive:true});
const log=m=>fs.appendFileSync(LOG,`[${new Date().toISOString()}] ${m}\n`);
const ok=(r,o)=>{r.writeHead(200,{'content-type':'application/json'}); r.end(JSON.stringify(o));}
const bad=(r,c,e)=>{r.writeHead(c,{'content-type':'application/json'}); r.end(JSON.stringify({ok:false,error:e}));}
const verify=(sig,buf)=>sig&&sig.startsWith('sha256=')&&(()=>{const a=Buffer.from(sig.slice(7),'hex');const b=crypto.createHmac('sha256',SECRET).update(buf).digest();return a.length===b.length&&crypto.timingSafeEqual(a,b)})();
const backup=()=>{const ts=new Date().toISOString().replace(/[:.]/g,'-'),f=`/var/backups/blackroad/site-${ts}.tgz`;try{spawnSync('tar',['czf',f,'-C',WEBROOT,'.'],{stdio:'ignore'})}catch{} try{fs.readdirSync('/var/backups/blackroad').filter(x=>/^site-.*\.tgz$/.test(x)).sort().reverse().slice(5).forEach(x=>fs.unlinkSync(p.join('/var/backups/blackroad',x)))}catch{}}
http.createServer((q,s)=>{
  if(q.method==='GET'&&q.url==='/api/health') return ok(s,{ok:true,ts:new Date().toISOString()});
  if(q.method==='POST'&&q.url==='/api/deploy'){const sig=q.headers['x-signature'];const chunks=[];q.on('data',c=>chunks.push(c));q.on('end',()=>{
    const body=Buffer.concat(chunks); if(!verify(sig,body)) return bad(s,403,'bad_signature');
    const T=p.join(TMP,'bundle.tgz'), D=p.join(TMP,'new'); fs.writeFileSync(T,body); spawnSync('rm',['-rf',D]); fs.mkdirSync(D,{recursive:true});
    const ex=spawnSync('tar',['xzf',T,'-C',D]); if(ex.status!==0) return bad(s,400,'bad_tar');
    backup(); const rs=spawnSync('rsync',['-a','--delete',D+'/',WEBROOT+'/']); if(rs.status!==0) return bad(s,500,'rsync_failed');
    fs.writeFileSync(p.join(WEBROOT,'.deployed'), new Date().toISOString()); return ok(s,{ok:true});
  }); return;}
  s.writeHead(404); s.end('not found');
}).listen(4000,'127.0.0.1',()=>log('API on 127.0.0.1:4000'));

PORT=3000
EOF

docker compose -f docker-compose.prod.yml up -d
docker ps
systemctl stop nginx
systemctl disable nginx
docker compose up -d
cd /root/blackroad-prism-console
printf "NODE_ENV=production\nPORT=3000\nNODE_IMAGE=node:22-alpine\n" > .env
docker compose -f docker-compose.prod.yml up -d
cd /root/blackroad-prism-console && printf "NODE_ENV=production\nPORT=3000\nNODE_IMAGE=node:22-alpine\n" > .env && cat .env && docker compose -f docker-compose.prod.yml up -d
cd /root/blackroad-prism-console
printf "NODE_ENV=production\nPORT=3000\nNODE_IMAGE=node:22-alpine\n" > .env
cat .env
docker compose -f docker-compose.prod.yml up -d
docker login ghcr.io
curl blackroad.io
docker ps
docker exec -it nginx cat /etc/nginx/conf.d/default.conf
nano /etc/nginx/conf.d/default.conf
docker exec -it nginx nginx -s reload
sudo nginx -t && sudo systemctl reload nginx
docker ps
docker exec -it nginx sh
curl blackroad.io
docker cp nginx:/etc/nginx/conf.d/default.conf ./nginx.conf
volumes:
  - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
docker compose up -d
cd /root/blackroad-prism-console
cat > nginx.conf <<'EOF'
server {
    listen 80;
    server_name blackroad.io blackroadinc.us;

    location / {
        proxy_pass http://llm:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

docker compose -f docker-compose.yml up -d
curl blackroad.io
cd /root/blackroad-prism-console
cat > .env <<'EOF'
NODE_ENV=production
PORT=3000
NODE_IMAGE=node:22-alpine
EOF

docker compose --env-file .env up -d --build
docker ps
curl blackroad.io
docker logs llm | tail -n 40
# stop everything
docker stop nginx llm 2>/dev/null || true
docker rm nginx llm 2>/dev/null || true
# start backend container manually (FastAPI on port 8000)
docker run -d --name llm -p 8000:8000 blackroad-prism-console-llm
# replace nginx config to reverse-proxy to backend
cat > /root/nginx.conf <<'EOF'
server {
    listen 80;
    server_name blackroad.io blackroadinc.us;

    location / {
        proxy_pass http://172.17.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# start nginx with that config
docker run -d --name nginx -p 80:80 -v /root/nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine
curl blackroad.io
docker update --restart=always nginx llm
git add .
git commit -m "trigger deploy"
git push origin main
ssh-keygen -t ed25519 -C "root@shellfish-droplet"
cat ~/.ssh/id_ed25519.pub
git remote set-url origin git@github.com:blackboxprogramming/blackroad-prism-console.git
git add .
git commit -m "trigger deploy"
git push origin main
cd /root/blackroad-prism-console
git pull --rebase origin main
git push origin main
docker stop nginx && docker rm nginx
docker run -d   --name caddy   -p 80:80 -p 443:443   -v /root/Caddyfile:/etc/caddy/Caddyfile   -v caddy_data:/data   -v caddy_config:/config   caddy:2
cat > /root/Caddyfile <<'EOF'
blackroad.io, blackroadinc.us {
    reverse_proxy 172.17.0.1:8000
}
EOF

docker restart caddy
# stop and remove any old Caddy container
docker stop caddy 2>/dev/null || true
docker rm caddy 2>/dev/null || true
# remove the existing directory and recreate as a plain file
rm -rf /root/Caddyfile
# create a new proper file for Caddy config
cat > /root/Caddyfile <<'EOF'
blackroad.io, blackroadinc.us {
    reverse_proxy 172.17.0.1:8000
}
EOF

# start Caddy fresh
docker run -d   --name caddy   -p 80:80 -p 443:443   -v /root/Caddyfile:/etc/caddy/Caddyfile:ro   -v caddy_data:/data   -v caddy_config:/config   caddy:2
docker ps
curl -I https://blackroad.io
curl -I https://blackroad.io/docs
curl -I https://blackroad.io/api
docker ps
docker update --restart=always caddy llm
curl -I https://blackroad.io
curl -I https://blackroadinc.us
cat >> /root/blackroad-prism-console/app/main.py <<'EOF'

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
def home():
    return "<h1>Blackroad API Online ✅</h1><p>Welcome to blackroad.io</p>"
EOF

docker restart llm
# 1️⃣ Go to the folder that holds the static site
cd /root/blackroad-prism-console/BlackRoad
# 2️⃣ Initialize or reset a clean git repo pointing to your GitHub Pages repo
git init -b main
git remote add origin git@github.com:blackboxprogramming/blackroad.io.git
# 3️⃣ Stage and commit everything
git add .
git commit -m "Deploy static site for blackroad.io"
# 4️⃣ Push to GitHub Pages
git push -f origin main
curl -I https://blackroad.io
# 1️⃣ Switch to the static site folder in the repo
cd /root/blackroad-prism-console/BlackRoad
# 2️⃣ Initialize it as its own repo targeting GitHub Pages
git init -b main
git remote add origin git@github.com:blackboxprogramming/blackroad.io.git
# 3️⃣ Stage and commit the full website
git add .
git commit -m "Deploy pretty static site for blackroad.io"
# 4️⃣ Push it to GitHub Pages (force overwrite to be safe)
git push -f origin main
mkdir -p /srv/blackroad-site && cp -r /root/blackroad-prism-console/BlackRoad/* /srv/blackroad-site/
cat > /root/Caddyfile <<'EOF'
blackroad.io, blackroadinc.us {
    handle_path /api/* {
        reverse_proxy 172.17.0.1:8000
    }
    handle {
        root * /srv/blackroad-site
        file_server
    }
}
EOF

docker restart caddy
mkdir -p /srv/blackroad-site && cp -r /root/blackroad-prism-console/BlackRoad/* /srv/blackroad-site/
rm -rf /srv/blackroad-site
cp -r /root/blackroad-prism-console/BlackRoad /srv/blackroad-site
blackroad.io, blackroadinc.us {
    handle_path /api/* {
        reverse_proxy 172.17.0.1:8000
    }
    handle {
        root * /srv/blackroad-site
        file_server
    }
}
# make sure the static site folder exists
rm -rf /srv/blackroad-site
cp -r /root/blackroad-prism-console/BlackRoad /srv/blackroad-site
# write the Caddy configuration into /root/Caddyfile
cat > /root/Caddyfile <<'EOF'
blackroad.io, blackroadinc.us {
    handle_path /api/* {
        reverse_proxy 172.17.0.1:8000
    }
    handle {
        root * /srv/blackroad-site
        file_server
    }
}
EOF

# restart the Caddy container to apply the new config
docker restart caddy
# make sure the static site folder exists
rm -rf /srv/blackroad-site
cp -r /root/blackroad-prism-console/BlackRoad /srv/blackroad-site
# write the Caddy configuration into /root/Caddyfile
cat > /root/Caddyfile <<'EOF'
blackroad.io, blackroadinc.us {
    handle_path /api/* {
        reverse_proxy 172.17.0.1:8000
    }
    handle {
        root * /srv/blackroad-site
        file_server
    }
}
EOF

# restart the Caddy container to apply the new config
docker restart caddy
# Generate a new SSH key for deployment
ssh-keygen -t ed25519 -C "deploy@blackroad.io"
# Press Enter to accept defaults (don’t set a password)
cat ~/.ssh/id_ed25519.pub
# run this inside the folder that contains your website code (e.g. /srv/blackroad-site)
git init
git add .
git commit -m "Initial commit of static site"
git remote add origin git@github.com:blackboxprogramming/blackroad.io.git
git push -u origin main
# write a fresh Caddyfile – don’t paste config directly into the shell
cat > /root/Caddyfile <<'EOF'
blackroad.io, blackroadinc.us {
    handle_path /api/* {
        reverse_proxy 172.17.0.1:8000
    }
    handle {
        root * /srv/blackroad-site
        file_server
    }
}
EOF

# restart Caddy so it picks up the change
docker restart caddy
cd /root/blackroad-prism-console/BlackRoad
# initialize the repo and create the main branch if it doesn’t exist
git init
git add .
git commit -m "Deploy static site for blackroad.io"
git branch -M main
# set the remote (if not already added) and push
git remote add origin git@github.com:blackboxprogramming/blackroad.io.git
git push -u origin main --force
curl blackroad.io
curldocker ps
docker ps
curl -I http://localhost
curl -I https://localhost --insecure
curl -I https://blackroad.io --resolve blackroad.io:443:127.0.0.1 --insecure
HTTP/2 200
server: Caddy
dig blackroad.io
nslookup blackroad.io
curl -I https://blackroad.io
docker logs caddy --tail 50
curl -I http://localhost
curl -I https://blackroad.io --insecure
docker ps
ls -l /srv/blackroad-site
cat /root/Caddyfile
docker restart caddy
curl -I http://localhost
curl -I https://blackroad.io --insecure
ls -l /srv/blackroad-site
cat /root/Caddyfile
docker stop caddy && docker rm caddy
docker run -d   --name caddy   -p 80:80 -p 443:443   -v /root/Caddyfile:/etc/caddy/Caddyfile:ro   -v /srv/blackroad-site:/srv/blackroad-site:ro   -v caddy_data:/data   -v caddy_config:/config   caddy:2
docker ps
curl -I https://blackroad.io --insecure
npm ci && npm run build
tar -czf blackroad-site.tar.gz dist
cd /root/blackroad-prism-console/sites/blackroad
npm ci
npm run build
tar -czf /root/blackroad-site.tar.gz dist
tar -xzf /root/blackroad-site.tar.gz -C /srv/blackroad-site --strip-components=1
docker restart caddy
curl -I https://blackroad.io --insecure
curl https://blackroad.io/api --insecure
nano .github/workflows/deploy.yml
git add .
cd /root/blackroad-prism-console/sites/blackroad
npm ci --force
npm run build --if-present
rm -rf /srv/blackroad-site/*
cp -r dist/* /srv/blackroad-site/
docker restart caddy
curl -I https://blackroad.io --insecure
Web console: https://shellfish-droplet:9090/ or https://174.138.44.45:9090/
Last login: Fri Oct 24 23:24:25 2025 from 198.211.111.194
[root@shellfish-droplet ~]# cd /root/blackroad-prism-console/sites/blackroad
[root@shellfish-droplet blackroad]# npm ci --force
npm run build --if-present
npm warn using --force Recommended protections disabled.
added 574 packages in 20s
> blackroad-site@0.3.1 prebuild
> node ./scripts/build-docs.cjs && node ./scripts/build-blog.cjs && node ./scripts/build-codex.cjs
Invalid frontmatter in phase-2.md: data must have required property 'type', data must have required property 'id', data must have required property 'summary', data must have required property 'tags', data must have required property 'updated', data must have required property 'version', data must have required property 'copy_filename'
[root@shellfish-droplet blackroad]# rm -rf /srv/blackroad-site/*
cp -r dist/* /srv/blackroad-site/
docker restart caddy
cp: cannot stat 'dist/*': No such file or directory
caddy
[root@shellfish-droplet blackroad]# curl -I https://blackroad.io --insecure
HTTP/2 404 
alt-svc: h3=":443"; ma=2592000
server: Caddy
date: Fri, 24 Oct 2025 23:29:32 GMT
[root@shellfish-droplet blackroad]# 
cd /root/blackroad-prism-console/sites/blackroad
npm ci --force
NODE_ENV=production vite build
ls -l dist
rm -rf /srv/blackroad-site/*
cp -r dist/* /srv/blackroad-site/
docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad && npm install vite --save-dev && npm ci --force && node -e "fs=require('fs');f='content/docs/phase-2.md';if(fs.existsSync(f)){fs.writeFileSync(f,'---\ntype: post\nid: phase-2\nsummary: \"\"\ntags: []\nupdated: \"2025-10-24\"\nversion: \"1.0\"\ncopy_filename: phase-2.md\n---\n\n# Phase 2\n');}" && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad && npm install --legacy-peer-deps && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
cd /root/blackroad-prism-console/sites/blackroad && npm install react react-dom react-router-dom --legacy-peer-deps && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad/src && sed -i '/^  import /d' App.jsx && sed -i '/^import .*jsx";/!b;n' App.jsx && cd .. && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
cd /root/blackroad-prism-console/sites/blackroad/src && awk '!seen[$0]++ || $0 !~ /^import .*\.jsx";/' App.jsx > App.fixed && mv App.fixed App.jsx && cd .. && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad/src && awk 'NR<120 || $0 !~ /^import /' App.jsx > App.fixed && mv -f App.fixed App.jsx && cd .. && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
cd /root/blackroad-prism-console/sites/blackroad/src && sed -i '/^<<<<<<< /d;/^=======/d;/^>>>>>>> /d' App.jsx && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
cd /root/blackroad-prism-console/sites/blackroad && sed -i '/^<<<<<<< /d;/^=======/d;/^>>>>>>> /d' src/App.jsx && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
cd /root/blackroad-prism-console/sites/blackroad/src && sed -i '/^export default function App/d' App.jsx && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad/src && sed -i 's/<nav>/<nav>/g' App.jsx && sed -i 's@<nav[^>]*>@&</nav>@g' App.jsx && cd .. && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad/src && sed -i 's#</nav>#</aside>#g; s#</aside>#</div>#g; $a </div>' App.jsx && cd .. && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
cd /root/blackroad-prism-console/sites/blackroad && git restore src/App.jsx && npm ci && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad && git restore src/App.jsx && npm install && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
cd /root/blackroad-prism-console/sites/blackroad/src && awk '!seen[$0]++ || $0 !~ /^import /' App.jsx > App.fixed && mv -f App.fixed App.jsx && cd .. && npm install && npx vite build && rm -rf /srv/blackroad-site/* && cp -r dist/* /srv/blackroad-site/ && docker restart caddy
curl -I https://blackroad.io --insecure
git submodule add https://github.com/blackboxprogramming/blackroad-prism-console.git blackroad_prism_console
sudo apt update -y && sudo apt install nginx -y
sudo dnf update -y
systemctl enable --now cockpit.socket
firewall-cmd --add-service=cockpit --permanent
firewall-cmd --reload
https://174.138.44.45:9090
dnf install firewalld -y
systemctl enable --now firewalld
firewall-cmd --add-service=cockpit --permanent
firewall-cmd --reload
# on the droplet
ssh-keygen -t ed25519 -C "shellfish-droplet"
cat ~/.ssh/id_ed25519.pub
ssh-import-id gh:blackboxprogramming
dnf install -y ssh-import-id
ssh-import-id gh:blackboxprogramming
dnf install firewalld -y
systemctl enable --now firewalld
firewall-cmd --add-service=cockpit --permanent
firewall-cmd --reload
  ssh -T git@github.com
 # Install cloudflared
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download
  /cloudflared-linux-x86_64.rpm -o cloudflared.rpm
  dnf install -y ./cloudflared.rpm
  cloudflared service install eyJhIjoiODQ4Y2YwYjE4ZDUxZTAxNzBlMGQxNTM3YWVjMz
  UwNWEiLCJ0IjoiNjMxYWQ1NTMtODFkNS00ZTA5LWE4OTEtYjA1MTNmMGIzNzg3IiwicyI6Illq
  VmhZV013TXpVdE0yUTROeTAwWXpWaUxXSmhNakV0TTJWbE5UQmtZall4WXpZdyJ9
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download
  /cloudflared-linux-x86_64.rpm -o cloudflared.rpm
curl -fs https://sshid.io/blackroad-sandbox >> ~/.ssh/authorized_keys
hostname -I
systemctl enable --now cockpit.socket
  mkdir -p ~/.ssh
  echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad" >> ~/.ssh/authorized_keys
  chmod 700 ~/.ssh
  chmod 600 ~/.ssh/authorized_keys
systemctl enable --now cockpit.socket
ssh root@159.65.43.12
systemctl enable --now cockpit.socket
ssh pi@192.168.4.38
        tailscale up --accept-routes --login-server=https://headscale.blackroad.io
tailscale status
hostname
tailscale
tailscale up
tailscale up --accept-routes --login-server=https://headscale.blackroad.io
ssh pi@100.66.235.47
ssh alice@100.66.240.12
Activate the web console with: systemctl enable --now cockpit.socket
Last login: Fri Dec 19 23:56:00 2025 from 162.243.188.66
[root@shellfish-droplet ~]# systemctl enable --now cockpit.socket
[root@shellfish-droplet ~]# # update system
apt update && apt upgrade -y
# enable web console
systemctl enable --now cockpit.socket
# enable ssh
systemctl enable ssh
systemctl restart ssh
# set hostname
hostnamectl set-hostname shellfish-drop
# firewall
ufw allow OpenSSH
ufw allow 9090/tcp
ufw --force enable
# create user
adduser alexa
usermod -aG sudo alexa
# copy ssh keys
rsync -a ~/.ssh /home/alexa/
chown -R alexa:alexa /home/alexa/.ssh
# install basics
apt install -y curl git tmux htop
# install tailscale
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
# verify
hostname
ss -tulpn | grep ssh
ip a
-bash: apt: command not found
Failed to enable unit: Unit file ssh.service does not exist.
Failed to restart ssh.service: Unit ssh.service not found.
-bash: ufw: command not found
usermod: group 'sudo' does not exist
-bash: apt: command not found
Installing Tailscale for centos 9, using method dnf
+ '[' 3 = 3 ']'
+ dnf install -y 'dnf-command(config-manager)'
Waiting for process with pid 1010497 to finish.
Last metadata expiration check: 0:00:02 ago on Sat 20 Dec 2025 12:58:10 AM UTC.
Package dnf-plugins-core-4.3.0-24.el9.noarch is already installed.
Dependencies resolved.
==============================================================================================================
 Package                              Architecture       Version                     Repository          Size
==============================================================================================================
Upgrading:
 dnf-plugins-core                     noarch             4.3.0-25.el9                baseos              36 k
 python3-dnf-plugins-core             noarch             4.3.0-25.el9                baseos             263 k
 yum-utils                            noarch             4.3.0-25.el9                baseos              39 k
Transaction Summary
==============================================================================================================
Upgrade  3 Packages
Total download size: 337 k
Downloading Packages:
(1/3): dnf-plugins-core-4.3.0-25.el9.noarch.rpm                               3.9 MB/s |  36 kB     00:00    
(2/3): yum-utils-4.3.0-25.el9.noarch.rpm                                      3.4 MB/s |  39 kB     00:00    
(3/3): python3-dnf-plugins-core-4.3.0-25.el9.noarch.rpm                        14 MB/s | 263 kB     00:00    
--------------------------------------------------------------------------------------------------------------
Total                                                                         2.8 MB/s | 337 kB     00:00     
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Preparing        :                                                                                      1/1 
  Upgrading        : python3-dnf-plugins-core-4.3.0-25.el9.noarch                                         1/6 
  Upgrading        : dnf-plugins-core-4.3.0-25.el9.noarch                                                 2/6 
  Upgrading        : yum-utils-4.3.0-25.el9.noarch                                                        3/6 
  Cleanup          : yum-utils-4.3.0-24.el9.noarch                                                        4/6 
  Cleanup          : dnf-plugins-core-4.3.0-24.el9.noarch                                                 5/6 
  Cleanup          : python3-dnf-plugins-core-4.3.0-24.el9.noarch                                         6/6 
  Running scriptlet: python3-dnf-plugins-core-4.3.0-24.el9.noarch                                         6/6 
  Verifying        : dnf-plugins-core-4.3.0-25.el9.noarch                                                 1/6 
  Verifying        : dnf-plugins-core-4.3.0-24.el9.noarch                                                 2/6 
  Verifying        : python3-dnf-plugins-core-4.3.0-25.el9.noarch                                         3/6 
  Verifying        : python3-dnf-plugins-core-4.3.0-24.el9.noarch                                         4/6 
  Verifying        : yum-utils-4.3.0-25.el9.noarch                                                        5/6 
  Verifying        : yum-utils-4.3.0-24.el9.noarch                                                        6/6 
Upgraded:
  dnf-plugins-core-4.3.0-25.el9.noarch              python3-dnf-plugins-core-4.3.0-25.el9.noarch             
  yum-utils-4.3.0-25.el9.noarch                    
Complete!
+ dnf config-manager --add-repo https://pkgs.tailscale.com/stable/centos/9/tailscale.repo
Adding repo from: https://pkgs.tailscale.com/stable/centos/9/tailscale.repo
+ '[' -n '' ']'
+ dnf install -y tailscale
Tailscale stable                                                              5.9 kB/s | 832  B     00:00    
Package tailscale-1.92.3-1.x86_64 is already installed.
Dependencies resolved.
Nothing to do.
Complete!
+ systemctl enable --now tailscaled
+ set +x
Installation complete! Log in to start using Tailscale by running:
tailscale up
Error: changing settings via 'tailscale up' requires mentioning all
non-default flags. To proceed, either re-run your command with --reset or
use the command below to explicitly mention the current value of
all non-default settings:
        tailscale up --accept-routes --login-server=https://headscale.blackroad.io
shellfish-drop
tcp   LISTEN 0      128          0.0.0.0:22         0.0.0.0:*    users:(("sshd",pid=599387,fd=7))                         
tcp   LISTEN 0      128             [::]:22            [::]:*    users:(("sshd",pid=599387,fd=8))                         
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether da:05:db:40:88:df brd ff:ff:ff:ff:ff:ff
    altname enp0s3
    altname ens3
    inet 174.138.44.45/20 brd 174.138.47.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet 10.10.0.5/16 brd 10.10.255.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::d805:dbff:fe40:88df/64 scope link 
       valid_lft forever preferred_lft forever
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 0e:8f:db:cd:1e:0c brd ff:ff:ff:ff:ff:ff
    altname enp0s4
    altname ens4
    inet 10.116.0.2/20 brd 10.116.15.255 scope global noprefixroute eth1
       valid_lft forever preferred_lft forever
    inet6 fe80::c8f:dbff:fecd:1e0c/64 scope link 
       valid_lft forever preferred_lft forever
4: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether b2:17:39:5b:a3:dd brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::b017:39ff:fe5b:a3dd/64 scope link 
       valid_lft forever preferred_lft forever
53: br-4551a28c3fbc: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 2a:02:47:77:31:a5 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global br-4551a28c3fbc
       valid_lft forever preferred_lft forever
    inet6 fe80::2802:47ff:fe77:31a5/64 scope link 
       valid_lft forever preferred_lft forever
142: vethf5b68f1@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP group default 
    link/ether 1a:09:2c:79:de:e2 brd ff:ff:ff:ff:ff:ff link-netnsid 2
    inet6 fe80::1809:2cff:fe79:dee2/64 scope link 
       valid_lft forever preferred_lft forever
143: tailscale0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1280 qdisc fq_codel state UNKNOWN group default qlen 500
    link/none 
    inet6 fe80::b888:7f03:1b6a:d703/64 scope link stable-privacy 
       valid_lft forever preferred_lft forever
[root@shellfish-droplet ~]# # update system
dnf update -y               # update system
dnf update -y
# cockpit (already enabled, but safe)
dnf install -y cockpit cockpit.socket
systemctl enable --now cockpit.socket
# ssh (service name is sshd, not ssh)
dnf install -y openssh-server
systemctl enable --now sshd
systemctl restart sshd
# hostname (already set, but confirm)
# hostname (already set, but confirm)op
hostnamectl set-hostname shellfish-drop
# firewall (firewalld, not ufw)
dnf install -y firewalldirewalld
systemctl enable --now firewalldervice=ssh
firewall-cmd --permanent --add-service=sshcp
firewall-cmd --permanent --add-port=9090/tcp
firewall-cmd --reload
# create user
# create userexa
useradd -m alexa
passwd alexa
# sudo group is "wheel"
usermod -aG wheel alexa
# copy ssh keys
# copy ssh keysalexa/.ssh
mkdir -p /home/alexa/.ssha/.ssh/
cp -r ~/.ssh/* /home/alexa/.ssh//.ssh
chown -R alexa:alexa /home/alexa/.ssh
chmod 700 /home/alexa/.ssh/*
chmod 600 /home/alexa/.ssh/*
# basics
# basicsall -y curl git tmux htop
dnf install -y curl git tmux htop
# tailscale (already installed, just bring it up correctly)
# tailscale (already installed, just bring it up correctly)/headscale.blackroad.io
tailscale up --reset --accept-routes --login-server=https://headscale.blackroad.io
# verify
hostnamen | grep sshd
ss -tulpn | grep sshd
ip a
Last metadata expiration check: 0:00:38 ago on Sat 20 Dec 2025 12:58:19 AM UTC.
Dependencies resolved.
==============================================================================================================
 Package                                    Arch      Version                       Repository           Size
==============================================================================================================
Installing:
 kernel                                     x86_64    5.14.0-651.el9                baseos              453 k
Upgrading:
 NetworkManager                             x86_64    1:1.54.2-1.el9                baseos              2.4 M
 NetworkManager-libnm                       x86_64    1:1.54.2-1.el9                baseos              1.9 M
 NetworkManager-team                        x86_64    1:1.54.2-1.el9                baseos               37 k
 NetworkManager-tui                         x86_64    1:1.54.2-1.el9                baseos              248 k
 binutils                                   x86_64    2.35.2-69.el9                 baseos              4.6 M
 binutils-gold                              x86_64    2.35.2-69.el9                 baseos              734 k
 centos-gpg-keys                            noarch    9.0-32.el9                    baseos               24 k
 centos-stream-release                      noarch    9.0-32.el9                    baseos               24 k
 centos-stream-repos                        noarch    9.0-32.el9                    baseos              8.6 k
 container-selinux                          noarch    4:2.244.0-1.el9               appstream            60 k
 containerd.io                              x86_64    2.2.1-1.el9                   docker-ce-stable     35 M
 crypto-policies                            noarch    20251126-1.gite9c4db2.el9     baseos               89 k
 crypto-policies-scripts                    noarch    20251126-1.gite9c4db2.el9     baseos              101 k
 cups-libs                                  x86_64    1:2.3.3op2-36.el9             baseos              260 k
 curl                                       x86_64    7.76.1-38.el9                 baseos              292 k
systemctl enable --now cockpit.socket
# update system
apt update && apt upgrade -y
# enable web console
systemctl enable --now cockpit.socket
# enable ssh
systemctl enable ssh
systemctl restart ssh
# set hostname
hostnamectl set-hostname shellfish-drop
# firewall
ufw allow OpenSSH
ufw allow 9090/tcp
ufw --force enable
# create user
adduser alexa
usermod -aG sudo alexa
# copy ssh keys
rsync -a ~/.ssh /home/alexa/
chown -R alexa:alexa /home/alexa/.ssh
# install basics
apt install -y curl git tmux htop
# install tailscale
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
# verify
hostname
ss -tulpn | grep ssh
ip a
# update system
dnf update -y
# cockpit (already enabled, but safe)
dnf install -y cockpit
systemctl enable --now cockpit.socket
# ssh (service name is sshd, not ssh)
dnf install -y openssh-server
systemctl enable --now sshd
systemctl restart sshd
# hostname (already set, but confirm)
hostnamectl set-hostname shellfish-drop
# firewall (firewalld, not ufw)
dnf install -y firewalld
systemctl enable --now firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-port=9090/tcp
firewall-cmd --reload
# create user
useradd -m alexa
passwd alexa
# sudo group is "wheel"
usermod -aG wheel alexa
# copy ssh keys
mkdir -p /home/alexa/.ssh
cp -r ~/.ssh/* /home/alexa/.ssh/
chown -R alexa:alexa /home/alexa/.ssh
chmod 700 /home/alexa/.ssh
chmod 600 /home/alexa/.ssh/*
# basics
dnf install -y curl git tmux htop
# tailscale (already installed, just bring it up correctly)
tailscale up --reset --accept-routes --login-server=https://headscale.blackroad.io
brew install claude
dnf install -y nodejs npm
node -v
npm -v
npm install -g @anthropic-ai/claude-code
claude --version
export ANTHROPIC_API_KEY="sk-ant-XXXXXXXXXXXXXXXX"
echo 'export ANTHROPIC_API_KEY="sk-ant-XXXXXXXXXXXXXXXX"' >> ~/.bashrc
source ~/.bashrc
claude
hostname
hostname -I
sudo tee /usr/local/bin/br-menu >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

TITLE="🖤🛣️  BlackRoad Menu"
MESH_CONF="/etc/blackroad/mesh.conf"

pause(){ echo; read -r -p "Press Enter..." _; }

hdr(){
  clear || true
  echo "────────────────────────────────────────"
  echo "  $TITLE"
  echo "  Host: $(hostname)   User: $(whoami)"
  echo "  Time: $(date)"
  echo "────────────────────────────────────────"
  echo
}

ensure_mesh_conf(){
  if [[ ! -f "$MESH_CONF" ]]; then
    sudo mkdir -p /etc/blackroad
    sudo tee "$MESH_CONF" >/dev/null <<'CONF'
# name user host
aria    pi    192.168.4.64
lucidia  pi   192.168.4.38
alice   alice 192.168.4.49
shellfish root 174.138.44.45
CONF
  fi
}

mesh_ssh(){
  ensure_mesh_conf
  hdr
  echo "Mesh SSH (uses your current SSH keys + known_hosts)"
  echo
  nl -w2 -s'. ' <(awk 'NF && $1 !~ /^#/ {print $1" "$2" "$3}' "$MESH_CONF")
  echo " 0. Back"
  echo
  read -r -p "Pick a node #: " choice

  if [[ "$choice" == "0" ]]; then return 0; fi

  # Convert choice -> line
  line="$(awk 'NF && $1 !~ /^#/ {print}' "$MESH_CONF" | sed -n "${choice}p" || true)"
  if [[ -z "${line}" ]]; then echo "Nope. Bad choice."; pause; return 0; fi

  name="$(awk '{print $1}' <<<"$line")"
  user="$(awk '{print $2}' <<<"$line")"
  host="$(awk '{print $3}' <<<"$line")"

  echo
  echo "→ ssh ${user}@${host}  (${name})"
  echo
  exec ssh "${user}@${host}"
}

tailscale_menu(){
  hdr
  if command -v tailscale >/dev/null 2>&1; then
    tailscale status || true
  else
    echo "tailscale not installed."
  fi
  pause
}

status_menu(){
  hdr
  echo "Hostname: $(hostname)"
  echo "Uptime:   $(uptime -p || uptime)"
  echo
  echo "IPs:"
  hostname -I 2>/dev/null || true
  echo
  echo "Disk:"
  df -h / | sed -n '1,2p'
  echo
  echo "Memory:"
  free -h 2>/dev/null || vm_stat 2>/dev/null || true
  pause
}

update_menu(){
  hdr
  echo "Updating packages..."
  echo
  if command -v apt >/dev/null 2>&1; then
    sudo apt update
    sudo apt upgrade -y
  else
    echo "apt not found on this box."
  fi
  pause
}

while true; do
  hdr
  echo "1) Status (br-status)"
  echo "2) Mesh SSH (jump to nodes)   ← NEW ITEM"
  echo "3) Tailscale status"
  echo "4) Update OS packages"
  echo "5) Reboot"
  echo "0) Exit"
  echo
  read -r -p "Select: " sel
  case "$sel" in
    1) status_menu ;;
    2) mesh_ssh ;;
    3) tailscale_menu ;;
    4) update_menu ;;
    5) sudo reboot ;;
    0) exit 0 ;;
    *) echo "nah"; pause ;;
  esac
done
EOF

sudo chmod +x /usr/local/bin/br-menu
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAG0KSI0MH5FBBAL4QTjfRSE//n9VzEYFDG8zYG1eHOm alexa@mac' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
npm install cloudflared
npm install claude
npm install codex
npm install openai
npm install vpn
curl "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer KLb3-fDYfF5SCTeV9NvADuVVFWv8IEy2dCsxnsRD"
mkdir -p /root/.ssh
chmod 700 /root/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAG0KSI0MH5FBBAL4QTjfRSE//n9VzEYFDG8zYG1eHOm alexa@mac' >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
npm install docker
claude
whoami
hostname -I
curl -I http://localhost:4000/health
curl -I http://localhost:4000/api/health
cd /opt/blackroad-prism-console
npm install
npm run dev
cat << 'EOF' > quantum_qutrit_node.sh
#!/bin/bash
# Raspberry Pi Qutrit Node

python3 - << 'PYTHON_EOF'
import socket

UDP_PORT = 5005
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(("", UDP_PORT))

print("\n[NODE] Synchronized to Qutrit Field. Awaiting Energy Shift...")

while True:
    data, addr = sock.recvfrom(1024)
    state_id, r, g, b, label = data.decode().split(',')
    
    print(f"\n[SHIFT] GLOBAL ENERGY LEVEL: {state_id} ({label})")
    print(f" -> Visualization: RGB({r}, {g}, {b})")
    
    if state_id == "2":
        print(" -> WARNING: High energy state detected. Physical entanglement peaking.")
PYTHON_EOF
EOF

chmod +x quantum_qutrit_node.sh
./quantum_qutrit_node.sh
whoami
hostname -I
ssh alice
sleep 1; tmux -V; which tmux; exit
# ═══════════════════════════════════════════════════════════
# BLACKROAD TRIANGLE EMBLEMS
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ CORE TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m△\e[0m  up"
echo -e "  \e[38;5;202m▽\e[0m  down"
echo -e "  \e[38;5;198m◁\e[0m  left"
echo -e "  \e[38;5;163m▷\e[0m  right"
echo -e "  \e[38;5;33m▲\e[0m  up-full"
echo -e "  \e[38;5;255m▼\e[0m  down-full"
echo ""
echo -e "\e[38;5;255m◈ ELEMENT TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m△\e[38;5;208m⟩\e[0m  fire"
echo -e "  \e[38;5;33m⟨\e[38;5;255m▽\e[38;5;33m⟩\e[0m  water"
echo -e "  \e[38;5;202m⟨\e[38;5;255m△̲\e[38;5;202m⟩\e[0m  air"
echo -e "  \e[38;5;198m⟨\e[38;5;255m▽̲\e[38;5;198m⟩\e[0m  earth"
echo -e "  \e[38;5;163m⟨\e[38;5;255m✡\e[38;5;163m⟩\e[0m  spirit"
echo ""
echo -e "\e[38;5;255m◈ ARROW TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m⊲\e[0m  play-l"
echo -e "  \e[38;5;202m⊳\e[0m  play-r"
echo -e "  \e[38;5;198m⋖\e[0m  less"
echo -e "  \e[38;5;163m⋗\e[0m  more"
echo -e "  \e[38;5;33m⋘\e[0m  rewind"
ps aux | grep caddy | grep -v grep
find / -name Caddyfile 2>/dev/null
nano /etc/caddy/Caddyfile
mkdir -p /srv/blackroad
cat >/srv/blackroad/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BlackRoad</title>
  <style>
    body {
      background:#0b0b0b;
      color:#e6e6e6;
      font-family: system-ui;
      padding: 48px;
    }
  </style>
</head>
<body>
  <h1>BlackRoad</h1>
  <p>Infrastructure online.</p>
</body>
</html>
EOF

pkill caddy
sleep 2
caddy start --config /etc/caddy/Caddyfile
service caddy restart || true
curl -I http://blackroad.io
du -sh /var/log/* 2>/dev/null
rm -f /var/log/*.gz /var/log/*.[0-9]
rm -rf /var/lib/docker/containers/*/*-json.log 2>/dev/null || true
df -h /
mkdir -p /tmp/caddy
nano /etc/caddy/Caddyfile
mkdir -p /tmp/blackroad
cat >/tmp/blackroad/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BlackRoad</title>
</head>
<body style="background:#0b0b0b;color:#e6e6e6;font-family:system-ui;padding:48px">
  <h1>BlackRoad</h1>
  <p>Infrastructure online.</p>
</body>
</html>
EOF

pkill caddy
sleep 2
caddy run --config /etc/caddy/Caddyfile &
python3 - <<'EOF'
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"HELLO WORLD\n")

HTTPServer(("0.0.0.0", 8080), H).serve_forever()
EOF

ss -ltnp | grep 8080 || netstat -tulpn | grep 8080
lsof -i :8080
python3 - <<'EOF'
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"HELLO WORLD\n")

HTTPServer(("0.0.0.0", 9001), H).serve_forever()
EOF

ssh pi@aria
systemctl
whoami
hostname -I
systemctl enable --now cockpit.socket
help
continue
ollama
ollama list
deploy
hostname
~
not
mkdir
ollama
ollama list
mkdir --help
-m
ollama ls
ollama serve
deploy
ollama list
whoami am I
EOF
systemctl enable --now cockpit.socket
 journalctl -xe | tail -50
systemctl status cockpit.socket

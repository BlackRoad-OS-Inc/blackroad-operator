# SSH

**Source:** google-docs

---

Grok we’ve got the following

A @ 159.65.43.12 TTL 600 seconds

CNAME www blackroad.io.

TXT _acme-challenge pQfEslsaXYUWV_huYgVjHIn77qzwMfu2Khmt64uQN98

I have a droplets oceans with 4 GB Memory / 80 GB Disk / NYC3 - Ubuntu 22.04 (LTS) x64

Public Network

Anybody can access the Droplet via these public addresses

Public IPv4 address

159.65.43.12 Copy

Public gateway

159.65.32.1 Copy

Subnet mask

255.255.240.0 Copy

Reserved IP:

Enable now

Public IPv6 Address

Enabling IPv6 will require updates to the network settings of the Droplet. Read more.

Your Droplet must be powered off before enabling public IPv6 network.

txt acme-challenge.www b99qtgUOZO-ICf60nVA-ffP18ZQm2MdthxU6I0jUu-c

Then I have an 8gb rasperry pi on 71.89.25.69 that I ssh through 192.168.795

And then I’ve got my usual Mac login

Last login: Mon Jul  7 13:25:12 on ttys000

alexa@Alexas-MacBook-Pro-2 ~ %

My pi password is lucidia

My oceans is Codex2025

And my Mac is jimmyg2014

Droplets has no firewalls

And chat is saying this for nginx

# Redirect plain-HTTP → HTTPS

server {

listen 80;

server_name blackroad.io www.blackroad.io;

return 301 https://$host$request_uri;

}

# HTTPS site for blackroad.io

server {

listen 443 ssl http2;

server_name blackroad.io www.blackroad.io;

ssl_certificate     /etc/letsencrypt/live/blackroad.io/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/blackroad.io/privkey.pem;

location / {

proxy_pass http://127.0.0.1:9000;   # <-- your second app on port 9000

include       proxy_params;

}

}

# Redirect plain-HTTP → HTTPS

server {

listen 80;

server_name blackroadinc.us www.blackroadinc.us;

return 301 https://$host$request_uri;

}

# HTTPS site for blackroadinc.us

server {

listen 443 ssl http2;

server_name blackroadinc.us www.blackroadinc.us;

ssl_certificate     /etc/letsencrypt/live/blackroadinc.us/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/blackroadinc.us/privkey.pem;

location / {

proxy_pass http://127.0.0.1:8000;   # <-- your first app on port 8000

include       proxy_params;

}

}

My goal is to understand how I should incorporate all together to ensure max safety storage and usability

Please get hello world printed behind a login screen for all websites and our websites our logins can be like user user password lucidia

DNS records

root@codex-infinity:~# ssh -i ~/.ssh/droplet_key root@159.65.43.12

Warning: Identity file /root/.ssh/droplet_key not accessible: No such file or directory.

The authenticity of host '159.65.43.12 (159.65.43.12)' can't be established.

ED25519 key fingerprint is SHA256:ntOYfBt85Xf11bW38r18J4hKpaZhvh19i9RPW7m7keU.

This key is not known by any other names

Are you sure you want to continue connecting (yes/no/[fingerprint])?

[PM2] Spawning PM2 daemon with pm2_home=/root/.pm2

[PM2] PM2 Successfully daemonized

[PM2] Starting /var/www/blackroad.io/app.js in fork_mode (1 instance)

[PM2] Done.

┌────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐

│ id │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │

├────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤

│ 0  │ blackroad.io    │ default     │ 1.0.0   │ fork    │ 35517    │ 0s     │ 0    │ online    │ 0%       │ 25.0mb   │ root     │ disabled │

└────┴─────────────────┴─────────────┴─────────┴─────────┴─────────���┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

[PM2] Starting /var/www/blackroadinc.us/app.js in fork_mode (1 instance)

[PM2] Done.

┌────┬────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐

│ id │ name               │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │

├────┼────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤

│ 0  │ blackroad.io       │ default     │ 1.0.0   │ fork    │ 35539    │ 0s     │ 1    │ online    │ 40%      │ 38.8mb   │ root     │ disabled │

│ 1  │ blackroadinc.us    │ default     │ 1.0.0   │ fork    │ 35547    │ 0s     │ 0    │ online    │ 0%       │ 10.1mb   │ root     │ disabled │

└────┴────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘

[PM2] Saving current process list...

[PM2] Successfully saved in /root/.pm2/dump.pm2

[PM2] Init System found: systemd

Platform systemd

Template

[Unit]

Description=PM2 process manager

Documentation=https://pm2.keymetrics.io/

After=network.target

[Service]

Type=forking

User=root

LimitNOFILE=infinity

LimitNPROC=infinity

LimitCORE=infinity

Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin

Environment=PM2_HOME=/root/.pm2

PIDFile=/root/.pm2/pm2.pid

Restart=on-failure

ExecStart=/usr/local/lib/node_modules/pm2/bin/pm2 resurrect

ExecReload=/usr/local/lib/node_modules/pm2/bin/pm2 reload all

ExecStop=/usr/local/lib/node_modules/pm2/bin/pm2 kill

[Install]

WantedBy=multi-user.target

Target path

/etc/systemd/system/pm2-root.service

Command list

[ 'systemctl enable pm2-root' ]

[PM2] Writing init configuration in /etc/systemd/system/pm2-root.service

[PM2] Making script booting at startup...

[PM2] [-] Executing: systemctl enable pm2-root...

Created symlink /etc/systemd/system/multi-user.target.wants/pm2-root.service → /etc/systemd/system/pm2-root.service.

[PM2] [v] Command successfully executed.

+---------------------------------------+

[PM2] Freeze a process list on reboot via:

$ pm2 save

[PM2] Remove init script via:

$ pm2 unstartup systemd

root@codex-infinity:/var/www/blackroadinc.us#

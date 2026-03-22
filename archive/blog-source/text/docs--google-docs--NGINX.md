# NGINX

**Source:** google-docs

---

NGINX

server {

listen 80;

server_name blackroad.io www.blackroad.io;

return 301 https://$host$request_uri;

}

server {

listen 443 ssl http2;

server_name blackroad.io www.blackroad.io;

ssl_certificate     /etc/letsencrypt/live/blackroad.io/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/blackroad.io/privkey.pem;

location / {

proxy_pass http://127.0.0.1:9000;  # BlackRoad.io app on 9000

include proxy_params;

}

}

server {

listen 80;

server_name blackroadinc.us www.blackroadinc.us;

return 301 https://$host$request_uri;

}

server {

listen 443 ssl http2;

server_name blackroadinc.us www.blackroadinc.us;

ssl_certificate     /etc/letsencrypt/live/blackroadinc.us/fullchain.pem;

ssl_certificate_key /etc/letsencrypt/live/blackroadinc.us/privkey.pem;

location / {

proxy_pass http://127.0.0.1:8000;  # BlackRoadInc.us app on 8000

include proxy_params;

}

}

#!/bin/bash
# Start nginx load balancer as user process

NGINX_DIR="$HOME/load-balancer"
cd "$NGINX_DIR"

# Create minimal nginx config that runs as user
cat > nginx-full.conf << 'NGINX_EOF'
daemon off;
worker_processes 1;
error_log /tmp/nginx-lb-error.log;
pid /tmp/nginx-lb.pid;

events {
    worker_connections 1024;
}

http {
    access_log /tmp/nginx-lb-access.log;
    client_body_temp_path /tmp/nginx-client-body;
    proxy_temp_path /tmp/nginx-proxy;
    fastcgi_temp_path /tmp/nginx-fastcgi;
    uwsgi_temp_path /tmp/nginx-uwsgi;
    scgi_temp_path /tmp/nginx-scgi;
    
    include nginx.conf;
}
NGINX_EOF

# Start nginx
/usr/sbin/nginx -c "$NGINX_DIR/nginx-full.conf" -p "$NGINX_DIR"

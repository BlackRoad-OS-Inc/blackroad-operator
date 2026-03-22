#!/bin/bash
# Manual deployment script (run with sudo)

echo "🚀 Deploying www.blackroad.io..."

# Copy nginx config
sudo cp ~/www.blackroad.io/nginx.conf /etc/nginx/sites-available/www.blackroad.io
sudo ln -sf /etc/nginx/sites-available/www.blackroad.io /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployed! Visit http://www.blackroad.io"

#!/bin/bash
set -e

echo "🚀 Deploying Stripe Payment System to Pi Cluster"
echo "=================================================="

PI_HOST="${1:-alice}"
PI_USER="${2:-alice}"
PI_IP="192.168.4.49"

echo "📡 Target: $PI_USER@$PI_HOST ($PI_IP)"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf /tmp/stripe-services.tar.gz \
  services/api \
  services/web \
  infra/stripe-products.json \
  STRIPE_INTEGRATION_GUIDE.md \
  STRIPE_QUICK_START.md

echo "✅ Package created: stripe-services.tar.gz"
echo ""

# Transfer to Pi
echo "📤 Transferring to Pi..."
scp /tmp/stripe-services.tar.gz $PI_USER@$PI_IP:/tmp/

echo "✅ Files transferred"
echo ""

# Deploy on Pi
echo "🔧 Deploying on Pi..."
ssh $PI_USER@$PI_IP << 'EOFPI'
set -e

echo "📂 Setting up deployment directory..."
mkdir -p ~/blackroad-stripe
cd ~/blackroad-stripe

echo "📦 Extracting package..."
tar -xzf /tmp/stripe-services.tar.gz

echo "🔧 Installing dependencies..."

# Install Node.js if needed
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install API service
echo "Installing API service..."
cd services/api
npm install
npm run build

# Install web service  
echo "Installing web service..."
cd ../web
npm install
npm run build

echo ""
echo "✅ Stripe services deployed!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in .env files"
echo "2. Start services with PM2 or Docker"
echo "3. Configure nginx reverse proxy"
echo ""
EOFPI

echo "=================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=================================================="
echo ""
echo "Services installed at: ~/blackroad-stripe/"
echo ""
echo "To start services:"
echo "  ssh $PI_USER@$PI_HOST"
echo "  cd ~/blackroad-stripe/services/api && npm start"
echo "  cd ~/blackroad-stripe/services/web && npm start"


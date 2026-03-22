#!/bin/bash

echo "🚀 DEPLOYING MINIO TO CECILIA"
echo "=============================="
echo ""
echo "Target: cecilia (192.168.4.89)"
echo "Storage: 457GB NVMe (411GB free!)"
echo ""

# Create deployment script that will run on cecilia
cat > /tmp/minio-setup-cecilia.sh << 'ENDSCRIPT'
#!/bin/bash

echo "📦 Installing Minio on Cecilia"
echo "==============================="
echo ""

# Create minio user
echo "1️⃣ Creating minio user..."
sudo useradd -r -s /sbin/nologin minio 2>/dev/null || echo "  User already exists"

# Create data directory on NVMe
echo "2️⃣ Creating data directory..."
sudo mkdir -p /mnt/minio/data
sudo chown -R minio:minio /mnt/minio

# Download Minio binary
echo "3️⃣ Downloading Minio..."
if [ ! -f /usr/local/bin/minio ]; then
    wget -q https://dl.min.io/server/minio/release/linux-arm64/minio -O /tmp/minio
    sudo mv /tmp/minio /usr/local/bin/
    sudo chmod +x /usr/local/bin/minio
    echo "  ✅ Downloaded"
else
    echo "  ✅ Already installed"
fi

# Create credentials
echo "4️⃣ Setting up credentials..."
MINIO_ROOT_USER="blackroad"
MINIO_ROOT_PASSWORD="blackroad-$(openssl rand -hex 8)"

echo "$MINIO_ROOT_USER" | sudo tee /etc/minio-root-user > /dev/null
echo "$MINIO_ROOT_PASSWORD" | sudo tee /etc/minio-root-password > /dev/null
sudo chmod 600 /etc/minio-root-*

# Create systemd service
echo "5️⃣ Creating systemd service..."
sudo tee /etc/systemd/system/minio.service > /dev/null << 'ENDSERVICE'
[Unit]
Description=Minio Object Storage
Documentation=https://min.io/docs/minio/linux/index.html
After=network.target

[Service]
Type=simple
User=minio
Group=minio
EnvironmentFile=-/etc/default/minio
ExecStart=/usr/local/bin/minio server /mnt/minio/data --console-address ":9001" --address ":9000"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
ENDSERVICE

# Create environment file
sudo tee /etc/default/minio > /dev/null << ENDENV
MINIO_ROOT_USER=$(cat /etc/minio-root-user)
MINIO_ROOT_PASSWORD=$(cat /etc/minio-root-password)
MINIO_VOLUMES="/mnt/minio/data"
MINIO_OPTS="--address :9000 --console-address :9001"
ENDENV

# Start service
echo "6️⃣ Starting Minio service..."
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio

# Wait for startup
sleep 5

# Check status
echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "📊 Minio Status:"
sudo systemctl status minio --no-pager | head -10
echo ""
echo "🔐 Access Credentials:"
echo "  Username: $(cat /etc/minio-root-user)"
echo "  Password: $(cat /etc/minio-root-password)"
echo ""
echo "🌐 Access URLs:"
echo "  API:     http://192.168.4.89:9000"
echo "  Console: http://192.168.4.89:9001"
echo "  Tailscale API:     http://100.72.180.98:9000"
echo "  Tailscale Console: http://100.72.180.98:9001"
echo ""
echo "💾 Storage:"
df -h /mnt/minio/data
echo ""
echo "🎯 Quick test:"
echo "  curl http://192.168.4.89:9000/minio/health/live"
ENDSCRIPT

# Copy and execute on cecilia
echo "Copying setup script to cecilia..."
scp /tmp/minio-setup-cecilia.sh cecilia:/tmp/

echo ""
echo "Executing on cecilia..."
ssh cecilia "bash /tmp/minio-setup-cecilia.sh"


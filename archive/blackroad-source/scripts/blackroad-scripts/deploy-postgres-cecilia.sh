#!/bin/bash

echo "🐘 DEPLOYING POSTGRESQL TO CECILIA"
echo "===================================="
echo ""
echo "Target: cecilia (192.168.4.89)"
echo "Storage: NVMe at /mnt/postgres"
echo ""

# Create deployment script
cat > /tmp/postgres-setup-cecilia.sh << 'ENDSCRIPT'
#!/bin/bash

echo "🐘 Installing PostgreSQL on Cecilia"
echo "===================================="
echo ""

# Update package list
echo "1️⃣ Updating package list..."
sudo apt update -qq

# Install PostgreSQL
echo "2️⃣ Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib > /dev/null 2>&1
echo "  ✅ Installed"

# Stop service to configure
echo "3️⃣ Stopping service for configuration..."
sudo systemctl stop postgresql

# Create data directory on NVMe
echo "4️⃣ Creating data directory on NVMe..."
sudo mkdir -p /mnt/postgres/data
sudo chown -R postgres:postgres /mnt/postgres

# Get PostgreSQL version
PG_VERSION=$(ls /etc/postgresql/ | head -1)
echo "  PostgreSQL version: $PG_VERSION"

# Update config to use NVMe
echo "5️⃣ Configuring PostgreSQL to use NVMe storage..."
sudo sed -i "s|data_directory = '/var/lib/postgresql/$PG_VERSION/main'|data_directory = '/mnt/postgres/data'|g" /etc/postgresql/$PG_VERSION/main/postgresql.conf

# Copy existing data if it exists
if [ -d "/var/lib/postgresql/$PG_VERSION/main" ] && [ ! -f "/mnt/postgres/data/PG_VERSION" ]; then
    echo "6️⃣ Migrating existing data to NVMe..."
    sudo -u postgres cp -rp /var/lib/postgresql/$PG_VERSION/main/* /mnt/postgres/data/
    echo "  ✅ Data migrated"
else
    echo "6️⃣ Initializing new database cluster..."
    sudo -u postgres /usr/lib/postgresql/$PG_VERSION/bin/initdb -D /mnt/postgres/data
    echo "  ✅ Database initialized"
fi

# Configure for remote access
echo "7️⃣ Configuring remote access..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/$PG_VERSION/main/postgresql.conf

# Add host-based authentication for local network and Tailscale
sudo tee -a /etc/postgresql/$PG_VERSION/main/pg_hba.conf > /dev/null << 'ENDAUTH'
# Local network access
host    all             all             192.168.4.0/22          scram-sha-256
# Tailscale network access
host    all             all             100.0.0.0/8             scram-sha-256
ENDAUTH

# Performance tuning for NVMe
echo "8️⃣ Applying performance tuning..."
sudo tee -a /etc/postgresql/$PG_VERSION/main/postgresql.conf > /dev/null << 'ENDPERF'

# Performance tuning for NVMe SSD + 8GB RAM
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
ENDPERF

# Start service
echo "9️⃣ Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

sleep 3

# Create blackroad user and database
echo "🔟 Creating blackroad user and database..."
sudo -u postgres psql << 'ENDSQL'
-- Create user
CREATE USER blackroad WITH PASSWORD 'blackroad-postgres-$(openssl rand -hex 8)';
ALTER USER blackroad CREATEDB;

-- Create database
CREATE DATABASE blackroad OWNER blackroad;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE blackroad TO blackroad;

\q
ENDSQL

# Get password for display
POSTGRES_PASSWORD=$(sudo -u postgres psql -t -c "SELECT rolpassword FROM pg_authid WHERE rolname='blackroad';" | tr -d ' ')

# Create credentials file
echo "blackroad" | sudo tee /etc/postgresql-user > /dev/null
echo "$POSTGRES_PASSWORD" | sudo tee /etc/postgresql-password > /dev/null
sudo chmod 600 /etc/postgresql-*

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "📊 PostgreSQL Status:"
sudo systemctl status postgresql --no-pager | head -10

echo ""
echo "🔐 Access Credentials:"
echo "  Database: blackroad"
echo "  Username: blackroad"
echo "  Password: [saved to /etc/postgresql-password]"

echo ""
echo "🌐 Connection Strings:"
echo "  Local:     postgresql://blackroad@192.168.4.89:5432/blackroad"
echo "  Tailscale: postgresql://blackroad@100.72.180.98:5432/blackroad"

echo ""
echo "💾 Storage:"
du -sh /mnt/postgres/data
df -h /mnt/postgres

echo ""
echo "🧪 Quick test:"
echo "  psql postgresql://blackroad@192.168.4.89:5432/blackroad"

ENDSCRIPT

# Copy and execute
echo "Copying setup script to cecilia..."
scp /tmp/postgres-setup-cecilia.sh cecilia:/tmp/

echo ""
echo "Executing on cecilia (this will take a few minutes)..."
ssh cecilia "bash /tmp/postgres-setup-cecilia.sh"


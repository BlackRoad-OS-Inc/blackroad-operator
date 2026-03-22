# BlackRoad Autonomous Services

## 🤖 Autonomous Operation

All services now run autonomously with:
- ✅ Auto-restart on crash
- ✅ Health monitoring
- ✅ Self-healing
- ✅ Log management
- ✅ Process supervision

---

## 🚀 Quick Start

### Option 1: Simple Autonomous Manager (Recommended for Development)

```bash
# Start services
~/autonomous-services.sh start

# Enable auto-recovery monitoring
~/autonomous-services.sh watch

# Check status
~/autonomous-services.sh status

# View logs
~/autonomous-services.sh logs auth
~/autonomous-services.sh logs domains

# Restart services
~/autonomous-services.sh restart

# Stop services
~/autonomous-services.sh stop
```

### Option 2: PM2 (Recommended for Production)

```bash
# Setup PM2 (one-time)
~/setup-pm2-services.sh
npm install -g pm2

# Start all services
pm2 start /tmp/blackroad-ecosystem.config.js

# Monitor in real-time
pm2 monit

# View status
pm2 status

# View logs
pm2 logs
pm2 logs blackroad-auth
pm2 logs blackroad-domains

# Restart service
pm2 restart blackroad-auth

# Save configuration
pm2 save

# Setup auto-start on boot
pm2 startup
# Follow the instructions it prints

# Stop all
pm2 stop all

# Delete all
pm2 delete all
```

### Option 3: Systemd (Linux Only)

```bash
# Install services (requires sudo)
sudo ~/install-systemd-services.sh

# Start services
sudo systemctl start blackroad-auth
sudo systemctl start blackroad-domains

# Enable auto-start on boot
sudo systemctl enable blackroad-auth
sudo systemctl enable blackroad-domains

# Check status
sudo systemctl status blackroad-auth
sudo systemctl status blackroad-domains

# View logs
journalctl -u blackroad-auth -f
journalctl -u blackroad-domains -f

# Restart
sudo systemctl restart blackroad-auth

# Stop
sudo systemctl stop blackroad-auth
```

---

## 🏥 Health Monitoring

### Automatic Health Checks

Run the health monitor daemon:

```bash
# Start health monitor (runs in foreground)
~/health-monitor.sh

# Or run in background
nohup ~/health-monitor.sh > /dev/null 2>&1 &
```

**Features:**
- Checks every 30 seconds
- Auto-restarts after 3 consecutive failures
- Logs all events to `~/.blackroad/logs/health-monitor.log`
- Monitors: auth:3004, domains:3005, gateway:3030

### Manual Health Checks

```bash
# Check auth service
curl http://localhost:3004/api/health

# Check domains service
curl http://localhost:3005/api/health

# Check gateway
curl http://localhost:3030/api/stats
```

---

## 📊 Service Management

### View All Logs

```bash
# Auth service
tail -f ~/.blackroad/logs/auth.log

# Domains service
tail -f ~/.blackroad/logs/domains.log

# Gateway
tail -f ~/.blackroad/logs/gateway.log

# Health monitor
tail -f ~/.blackroad/logs/health-monitor.log
```

### Check Process Status

```bash
# Check PIDs
ls -la ~/.blackroad/pids/

# Check if running
ps aux | grep "blackroad-os-auth\|blackroad-os-domains"
```

### Resource Usage

```bash
# CPU and memory usage
top -pid $(cat ~/.blackroad/pids/auth.pid)
top -pid $(cat ~/.blackroad/pids/domains.pid)
```

---

## 🔄 Auto-Recovery Features

### Simple Manager (`autonomous-services.sh`)
- Process monitoring via PID files
- HTTP health checks
- Auto-restart on failure
- 30-second check interval
- Configurable retry logic

### PM2
- Automatic restart on crash
- Memory limit monitoring (500MB)
- CPU usage tracking
- Cluster mode support
- Log rotation
- Startup scripts

### Systemd
- Service dependencies
- Auto-start on boot
- Resource limits (CPU 50%, RAM 512MB)
- Security sandboxing
- Journal logging
- Watchdog support

---

## 🎯 Deployment Scenarios

### Development (Local)
```bash
~/autonomous-services.sh start
~/autonomous-services.sh watch  # Terminal 1
```

### Staging (Railway/Pi)
```bash
npm install -g pm2
pm2 start /tmp/blackroad-ecosystem.config.js
pm2 save
pm2 startup
```

### Production (Linux Server)
```bash
sudo ~/install-systemd-services.sh
sudo systemctl enable --now blackroad-auth
sudo systemctl enable --now blackroad-domains
```

---

## 📁 File Structure

```
~/.blackroad/
├── pids/                    # Process ID files
│   ├── auth.pid
│   ├── domains.pid
│   └── gateway.pid
├── logs/                    # Service logs
│   ├── auth.log
│   ├── auth-error.log
│   ├── domains.log
│   ├── domains-error.log
│   ├── gateway.log
│   └── health-monitor.log

~/
├── autonomous-services.sh        # Simple process manager
├── setup-pm2-services.sh        # PM2 configuration
├── install-systemd-services.sh  # Systemd installer
├── health-monitor.sh            # Health check daemon
├── blackroad-auth.service       # Systemd unit (auth)
└── blackroad-domains.service    # Systemd unit (domains)
```

---

## 🛠️ Configuration

### Environment Variables

**Auth Service:**
```bash
cd ~/services/auth
cp .env.example .env
# Edit .env with your values
```

**Domains Service:**
```bash
cd ~/services/domains
cp .env.example .env
# Edit .env with your values
```

### Adjust Health Check Interval

Edit `~/health-monitor.sh`:
```bash
CHECK_INTERVAL=30  # Change to desired seconds
MAX_FAILURES=3     # Change failure threshold
```

---

## 🔥 Troubleshooting

### Service Won't Start

```bash
# Check logs
~/autonomous-services.sh logs auth

# Try manual start
cd ~/services/auth
npm run dev
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3004
lsof -i :3005

# Kill the process
kill <PID>
```

### PM2 Issues

```bash
# Reset PM2
pm2 kill
pm2 start /tmp/blackroad-ecosystem.config.js

# Clear logs
pm2 flush
```

### Systemd Issues

```bash
# Check service status
sudo systemctl status blackroad-auth

# View full logs
journalctl -u blackroad-auth --no-pager

# Reload configuration
sudo systemctl daemon-reload
```

---

## ✅ Verification

After starting services, verify they're running:

```bash
# Check all services
~/autonomous-services.sh status

# Test endpoints
curl http://localhost:3004/api/health
curl http://localhost:3005/api/health
curl http://localhost:3030/api/stats

# Check auto-restart (kill a service and watch it restart)
kill $(cat ~/.blackroad/pids/auth.pid)
sleep 35
~/autonomous-services.sh status  # Should show recovered
```

---

## 🎉 Success Indicators

- ✅ Services start automatically
- ✅ Services restart on crash
- ✅ Health checks pass
- ✅ Logs are being written
- ✅ PID files are created
- ✅ HTTP endpoints respond
- ✅ Memory usage under limits
- ✅ CPU usage acceptable

**Your services are now fully autonomous!** 🤖

# URGENT: Alice Disk Full - Fix Guide

**Status:** CRITICAL - Disk 100% full (15G / 15G used)
**Device:** alice (192.168.4.49)
**Issue:** No space left on device - dpkg broken, can't install packages

---

## 🚨 Immediate Actions (Run on alice)

### 1. Clean Journal Logs (Already partially done - freed 147MB)

```bash
sudo journalctl --vacuum-size=50M
sudo journalctl --vacuum-time=7d
```

### 2. Clean Docker Images and Containers

```bash
# Remove unused Docker stuff
sudo docker system prune -af --volumes

# Or more aggressive:
sudo docker container prune -f
sudo docker image prune -af
sudo docker volume prune -f
```

### 3. Clean Package Cache

```bash
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y
```

### 4. Remove Duplicate Git Repos

You have duplicate blackroad-prism-console directories:
- `/home/alice/blackroad-prism-console` (694MB)
- `/home/alice/blackroad-prism-console-1` (410MB)
- `/home/alice/Desktop/blackroad-prism-console` (410MB)

```bash
# Remove duplicates (CAREFUL - choose which to keep!)
cd ~
rm -rf ~/blackroad-prism-console-1
rm -rf ~/Desktop/blackroad-prism-console
```

### 5. Clean npm cache

```bash
npm cache clean --force
rm -rf ~/.npm/_cacache
```

### 6. Clean Downloads folder

```bash
# Check what's in Downloads
ls -lh ~/Downloads

# Remove if not needed
rm -rf ~/Downloads/*
```

---

## 📊 Disk Usage Breakdown (from your output)

| Directory | Size | Notes |
|-----------|------|-------|
| `/var/log` | 1.3GB | **Journals already cleaned by 147MB** |
| `/home/alice/blackroad-prism-console` | 694MB | Main copy |
| `/home/alice/Downloads` | 411MB | Check and clean |
| `/home/alice/blackroad-prism-console-1` | 410MB | **Duplicate - remove** |
| `/home/alice/Desktop/blackroad-prism-console` | 410MB | **Duplicate - remove** |
| `/home/alice/.vscode/extensions` | 404MB | VS Code extensions |
| `/home/alice/.cache` | 239MB | Cache - can clean |
| `/home/alice/.npm` | 209MB | npm cache - can clean |
| `/var/lib/rancher/k3s` | 506MB | Kubernetes data |
| `/var/lib/dpkg` | 71MB | Package database |

**Total recoverable:** ~1.5GB+ immediately

---

## 🔧 Step-by-Step Recovery

Copy and paste these commands one by one on alice:

```bash
# 1. Free up Docker space
echo "Cleaning Docker..."
sudo docker system prune -af --volumes
df -h /

# 2. Remove duplicate git repos
echo "Removing duplicates..."
rm -rf ~/blackroad-prism-console-1
rm -rf ~/Desktop/blackroad-prism-console
df -h /

# 3. Clean npm
echo "Cleaning npm cache..."
npm cache clean --force
rm -rf ~/.npm/_cacache
df -h /

# 4. Clean downloads
echo "Cleaning downloads..."
rm -rf ~/Downloads/*
df -h /

# 5. Clean caches
echo "Cleaning system caches..."
rm -rf ~/.cache/*
df -h /

# 6. Fix dpkg
echo "Fixing dpkg..."
sudo dpkg --configure -a

# 7. Clean apt
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y
```

---

## ✅ After Freeing Space

### Fix hostname resolution issue

```bash
# Fix /etc/hosts
sudo sed -i '/raspberrypi/d' /etc/hosts
sudo sh -c 'grep -q "127.0.1.1 alice" /etc/hosts || echo "127.0.1.1 alice" >> /etc/hosts'

# Verify
cat /etc/hosts
```

### Update system

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 🎯 Long-term Solutions

### 1. Set up log rotation

```bash
sudo nano /etc/systemd/journald.conf
```

Change:
```
SystemMaxUse=100M
SystemKeepFree=500M
SystemMaxFileSize=10M
```

Then:
```bash
sudo systemctl restart systemd-journald
```

### 2. Regular Docker cleanup cron job

```bash
# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * 0 docker system prune -af --volumes") | crontab -
```

### 3. Monitor disk usage

Add to `~/.bashrc`:
```bash
alias diskcheck='df -h / && echo && du -sh /* 2>/dev/null | sort -h | tail -10'
```

---

## 📝 Commands to Run Right Now

**Priority order:**

1. **Free Docker space:**
   ```bash
   sudo docker system prune -af --volumes
   ```

2. **Remove duplicates:**
   ```bash
   rm -rf ~/blackroad-prism-console-1 ~/Desktop/blackroad-prism-console
   ```

3. **Clean caches:**
   ```bash
   npm cache clean --force
   rm -rf ~/.npm ~/.cache
   ```

4. **Check progress:**
   ```bash
   df -h /
   ```

This should free up ~1.5-2GB immediately!

---

## 🔍 After Cleanup - Verify

```bash
df -h /
du -sh /home/alice/* 2>/dev/null | sort -h
sudo dpkg --configure -a
```

---

**Created:** December 20, 2025
**Urgency:** CRITICAL
**Expected Recovery:** 1.5-2GB free space

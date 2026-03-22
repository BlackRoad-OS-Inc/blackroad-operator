# 🚗💨 BlackRoad OS Pyto Server - START HERE

**Welcome! Your complete Python server for iOS Pyto is ready.**

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Install Dependencies in Pyto
```python
import pip
pip.main(['install', 'fastapi', 'uvicorn', 'pydantic', 'websockets', 'httpx', 'psutil'])
```

### 2️⃣ Run the Server
- Open `main.py` in Pyto
- Tap play button (▶️)
- Server starts on port 8080

### 3️⃣ Test It Works
```python
import requests
print(requests.get('http://localhost:8080/health').json())
```

**✅ If you see `{'status': 'ok', ...}` - you're all set!**

---

## 📱 Files to Transfer to Pyto

**Essential (Minimum):**
- ✅ `main.py` - The complete server (800+ lines)

**Helpful:**
- `install_dependencies_pyto.py` - Auto-install dependencies
- `PYTO_SETUP.md` - Complete iOS setup guide

**Optional:**
- `test_client.py` - Test all endpoints
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick reference

---

## 🎯 What You Can Do

### Spawn Agents (30,000+ capacity)
```python
import requests
requests.post('http://localhost:8080/agents/spawn', json={
    "role": "Financial Analyst",
    "capabilities": ["analyze_transactions"],
    "pack": "pack-finance"
}).json()
```

### Monitor Lucidia Breath (Golden Ratio φ = 1.618)
```python
requests.get('http://localhost:8080/lucidia/breath').json()
```

### Use Truth Engine (PS-SHA∞)
```python
requests.post('http://localhost:8080/truth/append', json={
    "data": "My first truth entry",
    "author": "me"
}).json()
```

### Real-time WebSocket
```python
import websocket
ws = websocket.WebSocket()
ws.connect('ws://localhost:8080/ws')
print(ws.recv())  # Receives breath updates
```

---

## 📚 Available Packs (5)

1. **pack-finance** - Financial analysis, portfolio management
2. **pack-legal** - Contract review, compliance
3. **pack-research-lab** - Literature review, data analysis
4. **pack-creator-studio** - Content generation, media
5. **pack-infra-devops** - Infrastructure, CI/CD

---

## 🔗 Useful Endpoints

**Health & Status:**
- `GET /health` - Health check
- `GET /ready` - Readiness
- `GET /version` - Version info

**Agents:**
- `POST /agents/spawn` - Spawn agent
- `GET /agents` - List agents
- `GET /agents/{id}` - Get agent details
- `DELETE /agents/{id}` - Terminate agent

**Lucidia:**
- `GET /lucidia/breath` - Current breath state
- `GET /lucidia/stats` - Statistics

**Truth Engine:**
- `POST /truth/append` - Add entry
- `GET /truth/chain` - View chain
- `GET /truth/verify` - Verify integrity

**Packs:**
- `GET /packs` - List all packs
- `GET /packs/{id}` - Pack details

**System:**
- `GET /system/info` - System info
- `GET /system/metrics` - CPU/memory
- `WS /ws` - WebSocket updates

**📖 Full API docs:** `http://localhost:8080/docs`

---

## 🆘 Troubleshooting

### Can't install dependencies?
```python
# Upgrade pip first
import pip
pip.main(['install', '--upgrade', 'pip'])
```

### Server won't start?
```python
# Check Python version (needs 3.9+)
import sys
print(sys.version)
```

### Port already in use?
Change port in `main.py`:
```python
# Line ~14
PORT = int(os.getenv("PORT", "3000"))  # Changed from 8080
```

---

## 🚀 Deploy to Cloud (When Ready)

**Railway (Free):**
```bash
railway login
railway up
```

**Docker:**
```bash
docker-compose up -d
```

**Full deployment guide:** See `DEPLOYMENT.md`

---

## 📊 System Stats

- **Lines of code:** 2,600+
- **API endpoints:** 30+
- **Agent capacity:** 30,000
- **Packs:** 5 built-in
- **Files:** 14 total
- **Dependencies:** 6 packages

---

## 🎓 Learn More

1. **PYTO_SETUP.md** - Complete iOS setup guide
2. **README.md** - Full documentation (500+ lines)
3. **QUICKSTART.md** - 5-minute quick start
4. **DEPLOYMENT.md** - Cloud deployment (600+ lines)
5. **STATUS.md** - Complete project status

---

## 💡 Pro Tips

**Tip 1: Use Shortcuts**
Create iOS Shortcuts to start/stop server automatically

**Tip 2: Save State**
Export agent data to iCloud Drive before closing Pyto

**Tip 3: Monitor Memory**
Check `/system/metrics` to avoid iOS memory limits

**Tip 4: Background Run**
Use iOS Guided Access to keep Pyto active

---

## 🏆 Features

✅ Agent spawning & management
✅ Pack system (5 domain packs)
✅ PS-SHA∞ truth engine
✅ Lucidia breath sync (φ = 1.618)
✅ WebSocket real-time updates
✅ Health checks & metrics
✅ Interactive API docs
✅ CORS enabled
✅ Production-ready

---

## 📞 Need Help?

- **Quick help:** See QUICKSTART.md
- **iOS setup:** See PYTO_SETUP.md
- **Full docs:** See README.md
- **Email:** blackroad.systems@gmail.com

---

## 🎉 You're Ready!

**Next step:** Transfer `main.py` to Pyto and run it!

**Test command:**
```python
import requests
print(requests.get('http://localhost:8080/health').json())
```

**See:** `{'status': 'ok', ...}` = Success! ✅

---

**🚗💨 Drive the future of autonomous computing!**

Built with ❤️ for the BlackRoad OS ecosystem

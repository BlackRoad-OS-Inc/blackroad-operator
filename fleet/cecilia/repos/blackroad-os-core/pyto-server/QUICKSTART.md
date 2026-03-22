# ⚡ BlackRoad OS Pyto Server - Quick Start

**Get running in 5 minutes!**

---

## 🚀 Fastest Path: Run Locally

```bash
# 1. Install dependencies (one-time)
pip install fastapi uvicorn pydantic websockets httpx psutil

# 2. Run server
python main.py

# 3. Test in browser
open http://localhost:8080/docs
```

**That's it! 🎉**

---

## 📱 Run on iOS (Pyto)

```python
# 1. Install dependencies in Pyto console
import pip
pip.main(['install', 'fastapi', 'uvicorn', 'pydantic', 'websockets', 'httpx', 'psutil'])

# 2. Run main.py
# (Tap play button ▶️)

# 3. Test
import requests
print(requests.get('http://localhost:8080/health').json())
```

---

## ☁️ Deploy to Railway (Free)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up

# 4. Get URL
railway domain
```

**Your server is now live! 🌐**

---

## 🧪 Quick API Test

```bash
# Health check
curl http://localhost:8080/health

# Spawn an agent
curl -X POST http://localhost:8080/agents/spawn \
  -H "Content-Type: application/json" \
  -d '{"role": "Test Agent", "capabilities": ["test"], "runtime_type": "llm_brain"}'

# List agents
curl http://localhost:8080/agents

# Check Lucidia breath
curl http://localhost:8080/lucidia/breath

# View API docs
open http://localhost:8080/docs
```

---

## 📊 What You Get

✅ **30+ REST API endpoints**
- Agent management (spawn, list, terminate)
- Pack system (5 built-in packs)
- PS-SHA∞ truth engine
- Lucidia breath synchronization
- WebSocket real-time updates

✅ **Production-ready features**
- Health checks
- Metrics monitoring
- CORS enabled
- Interactive API docs
- WebSocket support

✅ **30,000+ agent capacity**
- In-memory by default
- Scales to PostgreSQL/Redis
- Breath-synchronized spawning

---

## 🎯 Common Use Cases

### Financial Analysis
```bash
curl -X POST http://localhost:8080/agents/spawn -d '{
  "role": "Financial Analyst",
  "capabilities": ["analyze_transactions"],
  "pack": "pack-finance"
}'
```

### Legal Review
```bash
curl -X POST http://localhost:8080/agents/spawn -d '{
  "role": "Contract Reviewer",
  "capabilities": ["contract_review"],
  "pack": "pack-legal"
}'
```

### Research Assistant
```bash
curl -X POST http://localhost:8080/agents/spawn -d '{
  "role": "Research Assistant",
  "capabilities": ["literature_review"],
  "pack": "pack-research-lab"
}'
```

---

## 📚 Next Steps

1. **Explore API:** Visit http://localhost:8080/docs
2. **Run tests:** `python test_client.py`
3. **Deploy:** See `DEPLOYMENT.md` for Railway/Docker
4. **Customize:** Edit `main.py` to add features

---

## 🆘 Troubleshooting

**Port already in use?**
```bash
# Change port
PORT=3000 python main.py
```

**Dependencies won't install?**
```bash
# Upgrade pip
pip install --upgrade pip

# Try again
pip install -r requirements.txt
```

**Server won't start?**
```bash
# Check Python version (needs 3.11+)
python --version

# Reinstall
pip install -r requirements.txt --force-reinstall
```

---

## 📞 Need Help?

- **Full docs:** See `README.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Issues:** GitHub Issues
- **Email:** blackroad.systems@gmail.com

---

**Ready to go! 🚗💨**

Start with the "Run Locally" section above and you'll be operational in under 5 minutes.

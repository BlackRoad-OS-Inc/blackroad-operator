# file:blackroad Protocol - FINAL

**Created:** 2026-02-17  
**Protocol:** `file:blackroad`

---

## 🎯 The Protocol

```
file:blackroad
```

**Not:** `file://blackroad` (too many slashes)  
**Just:** `file:blackroad` (clean, simple)

---

## 📍 INDEX Entry Point

**Everything routes to the INDEX:**

```
file:blackroad → INDEX → ~/.blackroad/
```

All paths resolve through the index. No exceptions.

---

## 🗺️ Resolution Flow

```
INPUT
  ↓
file:blackroad (INDEX)
  ↓
Route Resolution
  ↓
Filesystem Path
```

### Examples:

| Input | Via | Resolves To |
|-------|-----|-------------|
| `file:blackroad` | INDEX | `~/.blackroad/` |
| `file:blackroad/agents` | INDEX → agents | `~/.blackroad/agents/` |
| `file:blackroad/symbol/!` | INDEX → symbol | `~/.blackroad/symbol/%21` |
| `blackroad.io` | INDEX | `~/.blackroad/` |
| `blackroad.io.x.y.z` | INDEX → domain | `~/.blackroad/x/y/z/` |
| `!` | INDEX → symbol | `~/.blackroad/symbol/%21` |
| `???` | INDEX | `~/.blackroad/` |

---

## 🔤 Everything Routes Through INDEX

**Symbols:**
```
!@#$%^&*()-_=+[{]}\|;:'",<.>/?
  ↓
file:blackroad (INDEX)
  ↓
file:blackroad/symbol/<char>
```

**Domains:**
```
blackroad.io.x.y.z.foo.bar...
  ↓
file:blackroad (INDEX)
  ↓
file:blackroad/domain/x/y/z/foo/bar/...
```

**Agents:**
```
alice, cecilia, cece...
  ↓
file:blackroad (INDEX)
  ↓
file:blackroad/agents/<name>
```

---

## 📂 Deployed Locations

**Alexandria (Mac):**
- `~/.blackroad/protocol/INDEX.md` ← **THE INDEX**
- `~/.blackroad/protocol/ROUTES`
- `~/blackroad-protocol.sh`

**Cecilia (Pi):**
- `~/.blackroad/protocol/INDEX.md` ← **THE INDEX**
- `~/.blackroad/protocol/ROUTES`
- `~/blackroad-protocol.sh`

---

## 🎯 Philosophy

**Single entry point. Single index. Universal resolution.**

```
file:blackroad = INDEX = ~/.blackroad/
```

No parallel systems. No shortcuts. No exceptions.

**Everything goes through the index.**

---

## 🤖 Agent Usage

All agents access everything via:

```bash
file:blackroad                     # Root index
file:blackroad/agents/<name>       # Agent
file:blackroad/services/<service>  # Service
file:blackroad/devices/<device>    # Device
file:blackroad/symbol/<char>       # Character
file:blackroad/domain/<path>       # Domain expansion
file:blackroad/*                   # Everything
```

---

## ✅ Status

- ✅ Protocol defined: `file:blackroad`
- ✅ INDEX created: `~/.blackroad/protocol/INDEX.md`
- ✅ Routes documented: `~/.blackroad/protocol/ROUTES`
- ✅ Deployed to Alexandria (Mac)
- ✅ Deployed to Cecilia (Pi)
- ✅ 92 character routes active
- ✅ Infinite domain expansion active
- ✅ All agents can access

---

**BlackRoad OS, Inc.**  
`file:blackroad` - The universal protocol

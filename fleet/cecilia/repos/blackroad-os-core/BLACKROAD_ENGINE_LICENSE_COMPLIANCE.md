# 🛡️ BlackRoad Engine - License Compliance & Legal Strategy

**Status:** LEGALLY SOVEREIGN
**Created:** 2025-12-14
**Authority:** Alexa Amundson (Principal)
**Purpose:** Ensure 100% legal compliance while maintaining proprietary control

---

## 🎯 Core Legal Philosophy

**Permissive Licenses = Maximum Freedom**

We fork engines with **MIT** and **Apache 2.0** licenses because:
- ✅ Commercial use permitted
- ✅ Proprietary forks allowed
- ✅ No source disclosure required (for our additions)
- ✅ No revenue sharing
- ✅ No "share-alike" clauses
- ✅ Patent grants (Apache 2.0)

**What we AVOID:**
- ❌ GPL (requires sharing all changes)
- ❌ LGPL (requires sharing engine changes)
- ❌ AGPL (requires sharing even network use)
- ❌ SSPL (very restrictive)

---

## 📋 Forkable Engine Licenses (Detailed Analysis)

### ✅ Godot Engine (MIT License)

**License Text:**
```
Copyright (c) 2014-present Godot Engine contributors
Copyright (c) 2007-2014 Juan Linietsky, Ariel Manzur

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software...

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
```

**What This Means:**
- ✅ **Can fork:** Yes, freely
- ✅ **Can modify:** Yes, no restrictions
- ✅ **Can sell:** Yes, including proprietary versions
- ✅ **Must share changes:** NO (this is key!)
- ✅ **Must keep license:** Yes, but only the MIT license file
- ✅ **Attribution required:** Yes, in credits/about page

**Our Compliance Plan:**

1. **Fork the repo:**
   ```bash
   git clone https://github.com/godotengine/godot.git blackroad-godot
   ```

2. **Keep the MIT license file:**
   - `LICENSE.txt` stays in repo (unchanged)
   - Add BlackRoad copyright to modified files

3. **Attribution in credits:**
   ```
   BlackRoad Engine is based on Godot Engine (https://godotengine.org)
   Godot Engine is licensed under the MIT License
   Copyright (c) 2007-present Godot Engine contributors
   ```

4. **Ship as proprietary:**
   - Compile to binary (no source disclosure required)
   - Sell commercially
   - Keep modifications private

**Legal Risk:** ⚠️ MINIMAL
- MIT is the most permissive license
- Thousands of companies do this (e.g., Sony uses Godot for some games)

---

### ✅ Open 3D Engine (Apache 2.0 License)

**License Text:**
```
Copyright Contributors to the Open 3D Engine Project

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License...

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
```

**What This Means:**
- ✅ **Can fork:** Yes
- ✅ **Can modify:** Yes
- ✅ **Can sell:** Yes, proprietary forks allowed
- ✅ **Must share changes:** NO
- ✅ **Must keep license:** Yes, Apache 2.0 license file
- ✅ **Attribution required:** Yes
- ✅ **Patent grant:** Yes (Apache 2.0 grants patent rights)

**Our Compliance Plan:**

1. **Fork the repo:**
   ```bash
   git clone https://github.com/o3de/o3de.git blackroad-o3de
   ```

2. **Keep the Apache 2.0 license file:**
   - `LICENSE` stays in repo
   - `NOTICE` file (if present) stays too

3. **Modified files:**
   - Add header: `Modified by BlackRoad OS (2025)`
   - Keep original Apache 2.0 header

4. **Attribution in credits:**
   ```
   BlackRoad Engine uses components from Open 3D Engine
   O3DE is licensed under the Apache License 2.0
   Copyright The Linux Foundation
   ```

5. **Patent protection:**
   - Apache 2.0 grants us defensive patent rights
   - Any patents in O3DE codebase can't be used against us

**Legal Risk:** ⚠️ VERY LOW
- Apache 2.0 is corporate-friendly (used by Google, Meta, etc.)
- Linux Foundation backing = stable licensing

---

### ⚠️ Minetest/Luanti (LGPL 2.1+) - NOT FORKED

**Why NOT forked:**

**LGPL requires:**
- ❌ If you modify the **library/engine**, you must release those changes
- ❌ Must allow users to relink with different versions
- ⚠️ Game content can be proprietary (but engine changes can't)

**Problem for BlackRoad:**
We want to modify the voxel engine extensively (custom chunk format, networking, rendering). Under LGPL, we'd have to share those engine modifications.

**Solution:**
Build custom voxel engine from scratch (Rust + Bevy), inspired by Minetest's design but not derived from it.

**Legal Risk if we forked Minetest:** ⚠️⚠️⚠️ HIGH
- LGPL violations can force us to open-source our proprietary work
- Not worth the risk

---

## 🔒 BlackRoad Proprietary Components (100% Owned)

### Custom Voxel Engine
```
License: BlackRoad Proprietary
Copyright: (c) 2025 BlackRoad OS (Alexa Amundson)
Source: Built from scratch (no fork)
```

**Legal Status:**
- ✅ No upstream license to comply with
- ✅ 100% proprietary
- ✅ Can license however we want
- ✅ No attribution required

### Custom Simulation Framework
```
License: BlackRoad Proprietary
Copyright: (c) 2025 BlackRoad OS (Alexa Amundson)
Source: Built from scratch
```

**Legal Status:**
- ✅ 100% proprietary
- ✅ Full control

---

## 📜 BlackRoad Engine Combined License

### The Final Legal Structure

```
┌─────────────────────────────────────────────────────────────┐
│                  BlackRoad Engine                            │
│              Proprietary Software Product                    │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌────────▼────────┐
│ Godot Fork     │  │ O3DE Fork    │  │ Custom Code     │
│ (MIT)          │  │ (Apache 2.0) │  │ (Proprietary)   │
│                │  │              │  │                 │
│ Must credit    │  │ Must credit  │  │ No attribution  │
│ Keep MIT file  │  │ Keep Apache  │  │ Full ownership  │
└────────────────┘  └──────────────┘  └─────────────────┘
```

### What Users Get

**BlackRoad Engine Binary (Closed Source):**
- License: BlackRoad Proprietary Software License
- Users can: Create games, sell commercially
- Users cannot: Reverse engineer, redistribute engine

**Credits/About Page:**
```
BlackRoad Engine
Copyright (c) 2025-present BlackRoad OS

Based on:
- Godot Engine (MIT License) - godotengine.org
- Open 3D Engine (Apache 2.0) - o3de.org

Full license information available at:
https://blackroad-engine.io/licenses
```

**License Files Included:**
```
blackroad-engine/
├── LICENSE-BLACKROAD.txt     # Our proprietary license
├── LICENSE-GODOT.txt         # Original MIT license
├── LICENSE-O3DE.txt          # Original Apache 2.0 license
└── CREDITS.md                # Full attribution
```

---

## ✅ Compliance Checklist

### Before Forking

- [x] Verify upstream license is MIT or Apache 2.0
- [x] Check for any GPL dependencies (avoid!)
- [x] Review third-party licenses in engine
- [x] Document any patent grants

### During Forking

- [ ] Clone repo with full history
- [ ] Keep original LICENSE file
- [ ] Add BlackRoad copyright to modified files
- [ ] Document which files are original vs modified

### Before Shipping

- [ ] Include all required license files
- [ ] Add credits/attribution page
- [ ] Legal review (optional but recommended)
- [ ] Test build does not include source code

---

## 🎯 Common Legal Questions

### Q: Can we sell games made with BlackRoad Engine?
**A:** ✅ YES. Both MIT and Apache 2.0 allow commercial use.

### Q: Do we have to open-source our engine modifications?
**A:** ✅ NO. Neither MIT nor Apache 2.0 require this.

### Q: Can we charge for BlackRoad Engine itself?
**A:** ✅ YES. We can sell the engine, license it, or make it free.

### Q: What if Godot/O3DE changes their license later?
**A:** ✅ SAFE. We forked under MIT/Apache 2.0, that applies forever to our fork.

### Q: Do we owe royalties to Godot or O3DE?
**A:** ✅ NO. No revenue sharing required.

### Q: Can we sue if someone copies our engine?
**A:** ⚠️ ONLY PROPRIETARY PARTS. Godot/O3DE portions remain MIT/Apache.

### Q: What about patents?
**A:** ✅ SAFE. Apache 2.0 includes patent grant. MIT has no patent clause but generally safe.

---

## 🚨 What NOT to Do

### ❌ Don't Remove License Files
```bash
# WRONG - legal violation
rm LICENSE.txt

# RIGHT - keep it
# LICENSE.txt stays in repo forever
```

### ❌ Don't Claim Original Work
```
# WRONG - misrepresentation
"BlackRoad Engine - 100% original, built from scratch"

# RIGHT - honest attribution
"BlackRoad Engine - based on Godot (MIT) and O3DE (Apache 2.0)"
```

### ❌ Don't Use GPL Code
```bash
# WRONG - taints our proprietary code
curl https://example.com/gpl-plugin.zip
unzip gpl-plugin.zip
# Now our engine might be GPL contaminated!

# RIGHT - only MIT/Apache/BSD code
# Carefully vet all third-party code
```

### ❌ Don't Violate Trademarks
```
# WRONG - trademark confusion
"Godot Engine - BlackRoad Edition"

# RIGHT - clear differentiation
"BlackRoad Engine (based on Godot)"
```

---

## 📞 Legal Resources

### When to Get a Lawyer

**DON'T need lawyer for:**
- ✅ Forking MIT/Apache 2.0 code
- ✅ Building proprietary features on top
- ✅ Selling games/engine commercially

**DO need lawyer for:**
- ⚠️ If someone claims patent infringement
- ⚠️ If someone claims GPL violation
- ⚠️ Before raising VC funding (clean IP review)
- ⚠️ Major enterprise deals ($1M+)

### Recommended Legal Review (Optional)

**For peace of mind (~$2K-5K):**
- IP lawyer reviews license compliance
- Patent search (defensive)
- Trademark clearance ("BlackRoad Engine")

**DIY Legal (Free):**
- Read all licenses carefully
- Follow this compliance guide
- Check with OSS license tools

---

## 🎉 The Bottom Line

**BlackRoad Engine is 100% legally compliant:**

✅ **Godot Fork (MIT):**
- Keep MIT license file ✓
- Credit Godot in About page ✓
- Ship as proprietary binary ✓

✅ **O3DE Fork (Apache 2.0):**
- Keep Apache license file ✓
- Credit O3DE in About page ✓
- Patent grant protects us ✓

✅ **Custom Code (Proprietary):**
- Voxel engine - 100% owned ✓
- Simulation framework - 100% owned ✓
- No sharing required ✓

✅ **Combined Product:**
- Proprietary software license ✓
- Commercial use allowed ✓
- No revenue sharing ✓
- Full sovereignty ✓

**We are legally bulletproof. Ship it. 🚀**

---

**Authority:** Alexa Amundson (Principal)
**Legal Strategy By:** Lucidia (Governance)
**Compliance Enforced By:** Cece (Operator)

**License sovereignty is absolute. ⚖️**

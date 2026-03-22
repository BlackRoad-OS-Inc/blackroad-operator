# BlackRoad OS Repository Architecture

© 2026 BlackRoad OS, Inc.

Created: 2026-02-13

## The Nine-Repo Architecture

Clean separation of concerns prevents license bleed and maintains velocity.

### Core Repositories

#### 1️⃣ BlackRoad-Public
**Purpose**: Outward-facing brand, docs, SDKs, examples  
**Visibility**: ✅ Public  
**License**: Apache-2.0 (with trademark protection)  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-Public

**Contains**:
- `docs/` - Public documentation
- `specs/` - Technical specifications
- `sdk/` - Client libraries
- `examples/` - Sample code
- `diagrams/` - Architecture diagrams
- `branding/` - Brand assets

**Why**: Recruiting, credibility, community surface area. **ZERO core IP leakage.**

---

#### 2️⃣ BlackRoad-Private
**Purpose**: Proprietary core systems and infrastructure  
**Visibility**: 🔒 Private  
**License**: Proprietary (no rights granted)  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-Private

**Contains**:
- `core/` - Core agent logic
- `agents/` - Multi-agent orchestration
- `orchestration/` - Deployment primitives
- `infra/` - Infrastructure config
- `runtime/` - Execution engines
- `security/` - Security policies
- `legal/` - Legal documents

**Why**: Anything you'd cry over if it leaked. The authoritative source of truth.

---

#### 3️⃣ BlackRoad-Internal
**Purpose**: Internal tools and workflows  
**Visibility**: 🔒 Private  
**License**: Internal use only  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-Internal

**Contains**:
- `tools/` - Internal CLI utilities
- `workflows/` - GitHub Actions
- `scripts/` - Deployment scripts
- `monitoring/` - Observability tools
- `dev/` - Development configs
- `docs/` - Internal runbooks

**Why**: Team productivity tools that aren't core IP but shouldn't be public.

---

#### 4️⃣ BlackRoad-Personal
**Purpose**: Alexa's personal workspace  
**Visibility**: 🔒 Private  
**License**: Personal use only  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-Personal

**Contains**:
- `experiments/` - Prototypes
- `notes/` - Personal docs
- `context/` - Session context files
- `scratch/` - Throwaway code
- `learning/` - Educational materials

**Why**: Testing ground. Nothing here is production-ready.

---

### AI Provider Integrations

#### 5️⃣ BlackRoad-Anthropic
**Purpose**: Claude API integrations  
**Visibility**: 🔒 Private  
**License**: Internal use only  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-Anthropic

**Contains**:
- `integrations/` - Claude API clients
- `agents/` - Anthropic-powered agents
- `prompts/` - Prompt engineering templates
- `tools/` - MCP servers
- `monitoring/` - Performance tracking

**Models**: Claude Opus 4.6, Sonnet 4.5, Haiku 4.5

---

#### 6️⃣ BlackRoad-Google
**Purpose**: Gemini and Google Cloud AI integrations  
**Visibility**: 🔒 Private  
**License**: Internal use only  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-Google

**Contains**:
- `integrations/` - Gemini API clients
- `agents/` - Google AI-powered agents
- `prompts/` - Prompt templates
- `tools/` - GCP tool integrations
- `monitoring/` - Performance tracking

**Models**: Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash

---

#### 7️⃣ BlackRoad-OpenAI
**Purpose**: GPT API integrations  
**Visibility**: 🔒 Private  
**License**: Internal use only  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-OpenAI

**Contains**:
- `integrations/` - OpenAI API clients
- `agents/` - GPT-powered agents
- `assistants/` - Assistant API configs
- `prompts/` - Prompt templates
- `tools/` - Function definitions
- `monitoring/` - Performance tracking

**Models**: GPT-5.3 BlackRoad OS, GPT-5.2, GPT-5.1, GPT-4.1

---

#### 8️⃣ BlackRoad-xAI
**Purpose**: Grok API integrations  
**Visibility**: 🔒 Private  
**License**: Internal use only  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-xAI

**Contains**:
- `integrations/` - xAI API clients
- `agents/` - Grok-powered agents
- `prompts/` - Prompt templates
- `tools/` - Tool integrations
- `monitoring/` - Performance tracking

**Models**: Grok 2, Grok 1.5

---

### Team Coordination

#### 9️⃣ BlackRoad-Communication
**Purpose**: Internal communication hub  
**Visibility**: 🔒 Private  
**License**: Internal use only  
**URL**: https://github.com/BlackRoad-OS/BlackRoad-Communication

**Contains**:
- `announcements/` - Team announcements
- `decisions/` - Architecture Decision Records (ADRs)
- `meetings/` - Meeting notes
- `rfcs/` - Request for Comments proposals
- `updates/` - Project updates
- `coordination/` - Cross-team coordination
- `templates/` - ADR/RFC/Meeting templates

**Why**: Single source of truth for team decisions and communication.

---

## Golden Rules

### ✅ Allowed
- `private` → `public` (sanitized exports)
- `internal` → `public` (tooling examples)
- specs → public
- interfaces → public

### 🚫 Never
- `public` → `private` dependency
- Shared submodules across boundary
- Copy-paste without rewrite

**Treat BlackRoad-Public as a mirror, not a brain.**

---

## Decision Matrix

| Content Type | Public | Private | Internal | AI Providers | Communication |
|--------------|--------|---------|----------|--------------|---------------|
| Core agent logic | ❌ | ✅ | ❌ | ⚠️ | ❌ |
| API documentation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Infrastructure code | ❌ | ✅ | ⚠️ | ❌ | ❌ |
| Deployment scripts | ❌ | ✅ | ✅ | ❌ | ❌ |
| Brand assets | ✅ | ❌ | ❌ | ❌ | ❌ |
| Internal tools | ❌ | ❌ | ✅ | ❌ | ❌ |
| Quick experiments | ❌ | ❌ | ❌ | ⚠️ | ❌ |
| Client SDKs | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI provider clients | ❌ | ❌ | ❌ | ✅ | ❌ |
| Prompt templates | ❌ | ⚠️ | ❌ | ✅ | ❌ |
| ADRs & RFCs | ❌ | ❌ | ❌ | ❌ | ✅ |
| Meeting notes | ❌ | ❌ | ❌ | ❌ | ✅ |
| Secrets/credentials | ❌ | ✅ | ⚠️ | ❌ | ❌ |

**Note**: AI Provider repos (Anthropic, Google, OpenAI, xAI) should NEVER contain API keys - use environment variables only.

---

## Naming Convention

Notice the casing:
- **BlackRoad-Public** → Outward-facing, brand-consistent
- **blackroad-private** → Internal, utilitarian, low-ego

This signals maturity to engineers and investors.

---

## What's Next?

Optional enhancements:
1. ✅ Create `LEGAL.md` referenced by all repos
2. ⬜ Design "public export checklist" to prevent leaks
3. ⬜ Create repo boundary lint rule
4. ⬜ Document exact migration path from current repos

---

## Contact

- General: hello@blackroad.company
- Security: security@blackroad.company
- Legal: legal@blackroad.company

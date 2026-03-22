# BlackRoad OS Core Overview

`blackroad-os-core` is the **primary application kernel** and canonical domain library for the wider BlackRoad OS ecosystem. It serves as the **Main OS Brain 🧠** that powers the "computer in a browser" experience, defining the stable language shared by Operator, API, Prism Console, Web, and other services.

## 🎯 Mission

- Be the **primary application kernel** for BlackRoad OS
- Power the "computer in a browser" experience: windows, sessions, identity, and routing
- Expose clean hooks for `-web`, `-api`, `-operator`, `-prism-console`, packs, and agents
- Define canonical types and events that other repos should import, not redefine

## 📦 Module Map

### Core Domain Logic 🧠

- **Identity** (`src/identity/`): User, Org, Workspace models + PS-SHA∞ identity shapes
  - `User`, `Org`, `Workspace` - canonical entity definitions
  - `OrgMembership`, `WorkspaceMembership` - relationship models
  - `IdentityAnchor`, `PsShaInfinity` - worldline-style identifiers

- **Session** (`src/session/`): Session + state management
  - `Session`, `SessionContext` - what's open, where, and for whom
  - `WindowState` - tracking open windows/apps
  - `UserPreferences` - user settings and preferences

- **Permissions** (`src/permissions/`): Auth, roles, and capabilities
  - `Permission`, `Role`, `AccessPolicy` - RBAC primitives
  - `PermissionCheck`, `PermissionCheckResult` - access evaluation
  - `SystemRoles` - built-in role constants

### Desktop Shell 🖥️

- **Desktop** (`src/desktop/`): App registry and shell layout
  - `AppDefinition`, `AppRegistry` - what apps exist in the OS
  - `LayoutConfig`, `NavigationConfig` - how users move around
  - `DockItem`, `KeyboardShortcut` - shell interactions
  - `SystemApps` - built-in app constants

- **Context** (`src/context/`): Cross-app context passing
  - `AppContext` - shared context across all apps
  - `UserContextInfo`, `OrgContextInfo`, `WorkspaceContextInfo` - lightweight context objects
  - `ContextProvider` - context management interface
  - `DeepLink`, `parseDeepLink()`, `buildDeepLink()` - deep linking utilities

### Internal Glue 🌐

- **Events** (`src/events/`): Domain event contracts
  - `DomainEvent`, `DomainEventTypes` - canonical event shapes
  - User events: `USER_LOGGED_IN`, `USER_LOGGED_OUT`, `USER_ROLE_CHANGED`
  - Deployment events: `DEPLOYMENT_CHANGED`, `DEPLOYMENT_STARTED`
  - Agent events: `AGENT_RUN_STARTED`, `AGENT_RUN_COMPLETED`
  - `JournalEntry`, `RoadChainEvent` - audit trail types

- **Constants** (`src/constants/`): Canonical enums and metadata
  - `Environments`, `EnvironmentConfig` - environment definitions
  - `Teams`, `TeamConfig` - team/role metadata
  - `Packs`, `PackConfig` - domain pack definitions
  - `GenericStatuses`, `JobStatuses`, `DeploymentStatuses`, `AgentStatuses`
  - `Priorities`, `ErrorCodes` - shared constants

### Truth Engine 🧪

- **Truth** (`src/truth/`): Verification pipeline types
  - `TextSnapshot → VerificationJob → AgentAssessment → TruthState`
  - `aggregateTruthState()` - truth aggregation logic

### Supporting Modules

- **Results**: `Result`/`Ok`/`Err` helpers for success/failure handling
- **Agents**: Base agent metadata, runtime context, execution contract
- **Jobs**: Job lifecycle types and transition helpers
- **Services**: Service registry for BlackRoad OS services
- **Config**: Environment-based configuration loading
- **Logging**: Structured logging helpers

## 🔐 Security & Compliance

- All auth/identity logic uses typed, explicit Identity models (no "any" user objects)
- Avoid logging secrets, tokens, or direct PII (use IDs, hashes, safe labels)
- Emit audit-friendly events for critical actions (login, role change, env switch)

## 🧭 Design Principles

- `blackroad-os-core` is the **canonical truth** for:
  - "Who is this?" → `User`, `Session`
  - "Which org/env/workspace are they in?" → `Org`, `Workspace`, `SessionContext`
  - "Which apps are available and what can they see/do?" → `AppRegistry`, `Permission`

- Other repos should **import types/contracts** from here, not re-invent them:
  - `-web` uses view models & enums
  - `-api` uses domain types & error shapes
  - `-operator` uses IDs, statuses, and event names
  - `-prism-console` uses models for services, envs, and agents

- Pure TypeScript with no framework or transport coupling
- Stable barrel exports (`src/index.ts`) for consumers
- Minimal dependencies; favor deterministic pure functions and explicit data shapes

## 📖 Expected Consumers

- `blackroad-os-operator`: executes jobs and emits domain events using these primitives
- `blackroad-os-api`: shapes API responses and ledger payloads from shared types
- `blackroad-os-web`: renders UI using view models and enums
- `blackroad-os-prism-console`: renders events/RoadChain data produced with these schemas
- `blackroad-os-infra`: references stable type names in operational docs and runbooks
- `blackroad-os-docs`: describes the concepts surfaced here

## 🎯 Success Criteria

If a new agent or dev only reads this repo, they should be able to answer:

1. **Who/what is a "user", an "org", a "workspace", an "agent", and an "app" here?**
   → See `src/identity/identityTypes.ts`, `src/agents/agentBase.ts`, `src/desktop/desktopTypes.ts`

2. **How does the BlackRoad desktop decide what to show?**
   → See `src/desktop/desktopTypes.ts`, `src/session/sessionTypes.ts`, `src/context/contextTypes.ts`

3. **Which types and events should other repos reuse, not redefine?**
   → Everything exported from `src/index.ts` is canonical

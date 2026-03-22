# Concepts

## PS-SHA∞
A persistent, hash-chained identity and journaling construct that records every agent action or state transition. It anchors authenticity and replayability across deployments and orchestrations.

## Spiral Information Geometry
A geometric metaphor for mapping identities and knowledge onto a spiral manifold. It highlights path dependency, growth, and recurrence by positioning capabilities and factors along angular and radial dimensions.

## Agent
A bounded, task-executing entity with defined capabilities, beliefs, and identity bindings. Agents emit journal entries and can be orchestrated individually or in pods.

## Capability
A discrete skill or function an agent can execute. Capabilities can be composed, weighted, and mapped into SIG factor trees for planning and auditing.

## Task
A unit of work assigned to an agent or pod. Tasks reference capabilities, expected outcomes, and journal entries that record execution details.

## Event
A notable occurrence captured in the system, often triggering journal entries or orchestration decisions. Contradictions and policy checks emit events for review.

## Journal Entry
A PS-SHA∞-aligned record capturing `actorId`, `actionType`, `timestamp`, `payload`, and hash links to prior entries. It forms the verifiable worldline of an agent or system.

## Trinary Logic
A reasoning framework with states {+1, 0, -1} representing true, unknown, and negated values. It keeps uncertainty and conflict explicit for downstream reconciliation.

## Orchestrator
A coordination layer that routes tasks, aggregates beliefs, resolves contradictions, and enforces journaling policies across agents.

## Agent Pod
A group of agents operating as a unit for resiliency or task coverage. Pods share SIG context and may share portions of a PS-SHA∞ worldline while maintaining individual accountability.

## Finance Layer
A cluster of finance-specialized agents (close, treasury, FP&A, compliance, etc.) governed by a finance orchestrator and audited through PS-SHA∞.

## Contradiction Quarantine
A pattern where conflicting outputs are isolated, journaled, and held for mediation before actions are taken. This prevents silent failure and preserves evidence for audit.

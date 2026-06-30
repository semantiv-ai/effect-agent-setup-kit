# Source Setup Inventory

This base was curated from a larger Effect SDK setup on 2026-06-30 and scrubbed
for reuse as a generic agent-friendly Effect starter.

High-signal inputs:

- `AGENTS.md`
- `docs/agent-coding-guardrails.md`
- `docs/agentic-effect-setup-manual.md`
- `patterns/effect-code.md`
- `patterns/effect-testing.md`
- `.repos/effect-ai-chat-example/knowledge/rules/*`
- `.repos/effect-ai-chat-example/knowledge/skills/*`
- `.repos/effect-ai-chat-example/scripts/oxlint-rules/*`
- `scripts/diagnose-agent-gates.mjs`
- root `package.json`, `tsconfig.json`, `.oxlintrc.json`, and `vitest.config.ts`

Related files found during search:

- `patterns/agent-pattern-workflow.md`
- `patterns/custom-agent-lint-rules.md`
- `patterns/effect-ai-runtime.md`
- `patterns/effect-http-api.md`
- `patterns/effect-module-selection.md`
- `patterns/effect-rpc.md`
- `patterns/effect-schema-diagnostics.md`
- `patterns/effect-schema-v4-boundary-codecs.md`
- `patterns/effect-services-layers.md`
- `patterns/effect-skill-index.md`
- `patterns/effect-sql.md`
- `patterns/effect-workflow-cluster.md`
- `docs/process/self-hosting-agentic-development-process.md`
- `docs/reference/effect-stream-guide.md`
- `docs/reference/effect-services-layers-guide.md`

This base intentionally keeps only the minimal setup contract:

1. install dependencies;
2. patch TypeScript for the Effect language service;
3. run strict TypeScript;
4. run strict Effect diagnostics;
5. run type-aware oxlint;
6. run Effect tests;
7. run negative probes proving the guardrails fire.

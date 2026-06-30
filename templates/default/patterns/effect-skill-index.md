# Effect Skill Index

Use this file before non-trivial Effect work to choose the smallest relevant
local reference.

Always start with `.repos/effect-smol/LLMS.md` when it exists. Then read the
local pattern for this project and, when the task needs module-level detail,
open the matching copied skill under
`docs/reference/effect-ai-chat-example/knowledge/skills/`.

| Task | Read |
| --- | --- |
| Core Effect code, `Effect.fn`, yieldables, errors, concurrency primitives | `patterns/effect-code.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-core-v4.md` |
| Services, references, layers, memoization, runtime wiring | `patterns/effect-code.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-layers-v4.md` |
| Schema boundaries, codecs, tagged errors, brands, transformations | `patterns/effect-code.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-schema-v4.md` |
| Config and config providers | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-config-v4.md` |
| Streams, queues, callbacks, grouping, backpressure | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-stream-v4.md` |
| General Effect tests | `patterns/effect-testing.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-testing-v4.md` |
| Test clock and time-dependent tests | `patterns/effect-testing.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-test-clock-v4.md` |
| Property-based tests | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-fast-check-v4.md` |
| Effect AI declarations, tools, models, chat, embeddings | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-ai-v4.md` |
| Effect AI tests and model mocks | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-ai-testing-v4.md` |
| RPC declarations, handlers, clients, middleware, streaming | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-rpc-v4.md` |
| RPC tests and in-memory transports | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-rpc-testing-v4.md` |
| SQL repositories, migrations, resolvers, runtime validation | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-sql-v4.md` |
| SQL tests, transactions, testcontainers | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-sql-testing-v4.md` |
| Effect Atom / React reactivity | `docs/reference/effect-ai-chat-example/knowledge/rules/effect-atom.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-atom-v4.md` |
| Effect Atom tests | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-atom-testing-v4.md` |
| Optics | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-optic-v4.md` |
| LayerMap / keyed cached layers | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-layer-map-v4.md` |
| Dashboard UI, form validation, notifications | `docs/reference/effect-ai-chat-example/knowledge/rules/` |
| Repeated agent mistakes or custom lint ideas | `patterns/custom-agent-lint-rules.md`, `docs/reference/effect-ai-chat-example/scripts/oxlint-rules/` |

The copied skills are reference material. Prefer current source and tests under
`.repos/effect-smol` when an API detail might have changed, then update the
local pattern with the project decision.

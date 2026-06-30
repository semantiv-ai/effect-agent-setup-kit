# Pattern Index

Use this directory for short, source-backed notes that keep agent sessions from
rediscovering the same Effect conventions.

Current patterns:

- `agent-pattern-workflow.md` for turning reference research and repeated
  mistakes into persistent local patterns, plans, tests, and checks.
- `custom-agent-lint-rules.md` for promoting repeated agent failures into
  lint rules, probes, tests, or local patterns.
- `effect-code.md` for core Effect code, services, layers, schemas, and errors.
- `effect-module-selection.md` for choosing Effect-native modules before adding
  utility dependencies or hand-rolled platform plumbing.
- `effect-skill-index.md` for routing Effect tasks to copied module-level
  skills and local references.
- `effect-testing.md` for `@effect/vitest` tests.

When a task touches an unfamiliar Effect module, inspect `.repos/effect-smol`
first, read the matching copied skill under `docs/reference/`, and add a
focused pattern file before implementing when the convention should persist.

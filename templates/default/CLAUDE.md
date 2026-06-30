# Effect Agent Setup Instructions

This file mirrors `AGENTS.md` for Claude Code, which loads `CLAUDE.md` as
project memory. Keep the two files aligned.

This is a small Effect project configured so coding agents receive fast,
deterministic feedback from TypeScript, the Effect language service, oxlint,
Vitest, and setup probes.

Before writing non-trivial Effect code:

- read `.repos/effect-smol/LLMS.md` when present;
- read `patterns/effect-skill-index.md` when present;
- read the smallest relevant file under `patterns/`;
- for module-specific Effect APIs, read the matching copied skill under
  `docs/reference/effect-ai-chat-example/knowledge/skills/`;
- use namespace imports such as `import * as Effect from "effect/Effect"`;
- use `Effect.gen` for inline programs;
- use `Effect.fn("Name")` for reusable functions that return Effects;
- preserve `Effect.Effect<A, E, R>` in public types;
- use `Context.Service`, `Context.Reference`, and `Layer` for dependencies;
- use `effect/Schema` at data boundaries, for domain data, and for tagged errors;
- use `@effect/vitest` and `it.effect` for Effect tests;
- prefer Effect-native modules before adding utility dependencies;
- type final live layers explicitly as `Layer.Layer<Provided>`;
- run `pnpm run setup:test` before finishing setup-sensitive work.

Avoid:

- `as any` and broad `as unknown as` casts;
- raw `process.env`;
- raw `console.log`;
- raw global `fetch`;
- unchecked `JSON.parse` or `JSON.stringify`;
- floating Effects;
- hidden mutable global registries.

Reference repos, when available, live under `.repos/` and are reference source
only. Do not import application code from `.repos/`.

Copied reference docs under `docs/reference/` are also read-only context unless
a task explicitly asks to adapt them into project code or checks.

For provenance and source acknowledgments for the copied reference material and
the local-source workflow, see `README.md`.

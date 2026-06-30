# Manual: Optimizing An Agentic Coding Setup For Effect

This manual describes how to set up an Effect project so coding agents can work
with high signal and low slop. It is agent-agnostic: the same structure works
for Codex, OpenCode, Claude, Cursor, Aider, or any other coding agent. Tool
names and instruction-file conventions differ, but the operating model is the
same.

The core idea is to build deterministic backpressure around an Effect codebase:

```text
prompt -> generate -> check -> run -> observe -> feed findings back
```

Effect is unusually strong for this loop because code carries semantic
information in both syntax and types:

```ts
Effect.Effect<Success, Error, Requirements>
```

Agents can use that information to repair code mechanically. Missing services,
typed failures, floating effects, raw platform APIs, unchecked JSON, missing
`yield*`, schema mismatches, and absent layers can become deterministic
diagnostics instead of vague review comments.

## 1. Design The Agent Loop Around Backpressure

Do not rely on prompt instructions alone. Prompts guide the agent, but checks
stop bad code.

Use this loop:

```text
1. Prompt
   Give the agent a scoped task plus local instructions and relevant reference
   files.

2. Generate
   Let the agent write code using established local patterns.

3. Check
   Run typecheck, Effect language-service diagnostics, lint, tests, and custom
   probes. Feed failures back to the agent.

4. Run
   Execute focused tests or a local reproduction. Prefer small dependency
   layers over whole-environment mocks.

5. Observe
   Inspect structured logs, traces, run reports, diagnostic ASTs, and test
   output. Feed those signals back into the next prompt.
```

The important shift is that the application becomes the prompt. Source code is
only one input. Type errors, lint errors, schema issues, runtime traces, test
failures, and telemetry are all agent-readable context.

## 2. Make Reference Source Local

Agents are only as current as their local context. For Effect, stale API memory
is a common failure mode. Put current reference source in `.repos/` and instruct
agents to read it before non-trivial Effect work.

Recommended layout:

```text
.repos/
  effect-smol/
  effect-ai-chat-example/   # optional local-only reference, not tracked
```

Reference roles:

| Repo | Role |
| --- | --- |
| `.repos/effect-smol` | Current Effect v4 source, `LLMS.md`, AI docs, cookbooks, packages, upstream patterns. |
| `.repos/effect-ai-chat-example` | Optional local-only applied Effect app examples, knowledge skills, AI/RPC/SQL/testing patterns. Do not commit or submodule it. |

Treat `.repos/` as reference material, not implementation source. Do not import
from it. Do not copy code unless a task explicitly calls for a reference
comparison.

Suggested clone commands:

```sh
mkdir -p .repos
git clone --depth 1 <effect-smol-url> .repos/effect-smol
# Optional local-only reference if you have access; do not commit/submodule it.
git clone --depth 1 <effect-ai-chat-example-url> .repos/effect-ai-chat-example
```

Keep these directories out of package builds, test discovery, and generated
artifacts.

```jsonc
{
  "exclude": ["node_modules", "dist", ".repos"]
}
```

Do not blindly add `.repos/` to `.gitignore`. Some editors and agents ignore
gitignored files for indexing and search, which can hide the exact reference
source they need. Prefer excluding `.repos/` from TypeScript projects, lint,
tests, generated artifacts, and semantic-search indexes. Choose the Git strategy
explicitly: shallow local clones for a prototype, a bootstrap script for a team,
or a maintained subtree/submodule only when the team wants reference source
versioned.

For external libraries, source and tests should come before docs. Ask the agent
to inspect source files and test files first, use docs only when those are not
enough, and treat `node_modules` as a fallback when the source repo is not
cloned. Pattern files should capture project-specific choices and traps, not
duplicate API material that source/tests already expose.

## 3. Add Agent Instructions At The Repository Root

Create a root instruction file that every agent can consume. `AGENTS.md` is a
good neutral source. If a tool prefers another filename, mirror the same content
into that file:

```text
AGENTS.md      # Codex, OpenCode, and many agent runners
CLAUDE.md      # Claude-specific convention when needed
.cursor/rules  # Cursor-specific convention when needed
```

The instruction file should define:

- project purpose;
- architecture vocabulary;
- reference repos to inspect;
- preferred docs and pattern files;
- Effect rules;
- Schema rules;
- diagnostic rules;
- coding standards;
- validation commands;
- scope control.

For this repo, the architectural vocabulary is:

```text
Capability<I, O, R> = named obligation with Schema I/O and declared requirements
Requirement         = value-level mirror of Effect R for diagnostics
Agent<C>            = adaptive role claiming to implement a capability
Process<I, O, R>    = deterministic implementation when the procedure is known
Runner<I, O, E, R>  = Effect interpreter, preserving E and R
Runtime             = immutable binding/provisioning declaration
Flow<I, O, R>       = typed AST of composition
Diagnostic          = Schema-backed explanation before execution
Eval                = evidence over a completed run
```

The most important instruction is:

```text
declaration -> explain -> runDetailed -> eval
```

Every executable thing should also be explainable before execution.

## 4. Build A Pattern Library For Agents

Do not make every session rediscover project conventions. Add persistent
pattern files under `patterns/`.

Recommended files:

```text
patterns/
  README.md
  agent-pattern-workflow.md
  custom-agent-lint-rules.md
  effect-ai-runtime.md
  effect-skill-index.md
  effect-code.md
  effect-http-api.md
  effect-module-selection.md
  effect-rpc.md
  effect-sql.md
  effect-testing.md
  effect-workflow-cluster.md
```

Use the index as a routing table. An agent should read the smallest relevant
set, not the whole world.

Example routing:

| Task | Read |
| --- | --- |
| Core Effect code | `.repos/effect-smol/LLMS.md`, `patterns/effect-code.md`, relevant `ai-docs/src/01_effect/*` |
| Services/layers | `patterns/effect-code.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-layers-v4.md` |
| Schema boundaries | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-schema-v4.md` |
| Config | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-config-v4.md` |
| Streams | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-stream-v4.md`, `.repos/effect-smol/ai-docs/src/02_stream/` |
| AI/tooling | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-ai-v4.md` |
| AI tests | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-ai-testing-v4.md` |
| Tests | `patterns/effect-testing.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-testing-v4.md` |
| Effect module choice | `patterns/effect-module-selection.md`, `.repos/effect-smol/packages/effect/src/`, `.repos/effect-smol/packages/effect/test/` |
| HTTP API / OpenAPI | `patterns/effect-http-api.md`, `.repos/effect-smol/ai-docs/src/51_http-server/` |
| RPC / typed procedures | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-rpc-v4.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-rpc-testing-v4.md` |
| SQL / persistence | `docs/reference/effect-ai-chat-example/knowledge/skills/effect-sql-v4.md`, `docs/reference/effect-ai-chat-example/knowledge/skills/effect-sql-testing-v4.md` |
| Workflow / cluster | `patterns/effect-workflow-cluster.md`, `.repos/effect-smol/ai-docs/src/80_cluster/`, `.repos/effect-smol/packages/effect/src/unstable/workflow/` |
| Repeated agent mistakes | `patterns/custom-agent-lint-rules.md`, `.oxlintrc.json`, `scripts/test-setup.mjs` |

When a new reusable convention appears, add it to `patterns/` before finishing
the task. Agents should not depend on conversation memory.

The most useful transcript workflow is pattern generation before feature
generation. When a feature touches an unfamiliar module, ask the agent to
research the local reference repo and save the result as a focused pattern:

```text
Explore .repos/effect-smol for the current HttpApi pattern. Save the files
inspected, recommended local pattern, things to avoid, and verification commands
in patterns/effect-http-api.md. Then implement the feature from that pattern.
```

For multi-step work, save a small spec in `plans/*.md` before implementation.
That is more portable than relying on a single tool's temporary plan mode. It
also lets you start a fresh session after research without losing decisions.

For isolated implementation tasks, pair the fresh session with a git worktree.
Keep the main checkout as the stable coordination branch, create one task branch
and worktree per substantial task, and run the agent from that worktree. If the
project uses local reference clones under `.repos/`, keep them ignored by git and
symlink or bootstrap them into each worktree so agents can still inspect the
same reference source.

## 5. Configure TypeScript For Effect Diagnostics

Install the Effect language service and keep TypeScript patched:

```sh
pnpm add effect
pnpm add -D typescript @effect/language-service
```

Add `prepare`:

```json
{
  "scripts": {
    "prepare": "effect-language-service patch"
  }
}
```

Configure `tsconfig.json`:

```jsonc
{
  "$schema": "./node_modules/@effect/language-service/schema.json",
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "plugins": [
      {
        "name": "@effect/language-service",
        "transform": "@effect/language-service/transform",
        "diagnosticsName": true,
        "includeSuggestionsInTsc": true,
        "ignoreEffectWarningsInTscExitCode": false,
        "ignoreEffectErrorsInTscExitCode": false,
        "quickinfoEffectParameters": "always",
        "namespaceImportPackages": ["effect", "@effect/*"],
        "topLevelNamedReexports": "follow",
        "diagnosticSeverity": {
          "floatingEffect": "error",
          "missingEffectContext": "error",
          "missingEffectError": "error",
          "missingLayerContext": "error",
          "missingReturnYieldStar": "error",
          "missingStarInYieldEffectGen": "error",
          "effectFnImplicitAny": "error",
          "tryCatchInEffectGen": "error",
          "globalConsole": "error",
          "globalConsoleInEffect": "error",
          "globalFetch": "error",
          "globalFetchInEffect": "error",
          "processEnv": "error",
          "processEnvInEffect": "error",
          "preferSchemaOverJson": "error",
          "newPromise": "error",
          "leakingRequirements": "error"
        }
      }
    ]
  }
}
```

Validate the patch:

```sh
pnpm exec effect-language-service check
pnpm exec effect-language-service diagnostics --project tsconfig.json --format pretty --strict
```

Why this matters for agents:

- `floatingEffect` catches effects that were constructed but never yielded,
  returned, or assigned.
- `missingEffectContext` turns opaque type errors into service-requirement
  sentences.
- `missingEffectError` keeps the `E` channel honest.
- `missingStarInYieldEffectGen` catches `yield` where Effect requires `yield*`.
- `globalConsole`, `globalFetch`, `processEnv`, and `preferSchemaOverJson`
  steer agents toward Effect-native APIs.
- `leakingRequirements` catches service definitions that expose implementation
  dependencies in method signatures.

## 6. Use Type-Aware Linting As A Deterministic Gate

Install oxlint and type-aware support:

```sh
pnpm add -D oxlint oxlint-tsgolint
```

Use type-aware linting:

```json
{
  "scripts": {
    "lint": "oxlint -c .oxlintrc.json --tsconfig tsconfig.json --type-aware"
  }
}
```

Add deterministic raw-API bans:

```jsonc
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "eslint", "node"],
  "rules": {
    "eslint/no-console": "error",
    "node/no-process-env": "error",
    "no-restricted-globals": ["error", "fetch"],
    "no-restricted-properties": [
      "error",
      {
        "object": "JSON",
        "property": "parse",
        "message": "Use effect/Schema decoding at data boundaries instead of unchecked JSON.parse."
      },
      {
        "object": "JSON",
        "property": "stringify",
        "message": "Use effect/Schema encoding at data boundaries instead of raw JSON.stringify."
      }
    ],
    "typescript/no-floating-promises": "error",
    "typescript/no-unsafe-type-assertion": "warn",
    "typescript/no-unsafe-assignment": "warn",
    "typescript/no-unsafe-call": "warn",
    "typescript/no-unsafe-member-access": "warn",
    "typescript/no-unsafe-return": "warn"
  }
}
```

These bans convert style guidance into enforceable feedback. If an agent writes
`process.env`, it gets a deterministic error and can repair toward `Config`. If
it writes `JSON.parse`, it gets pushed toward `Schema`.

## 7. Preserve `Effect<A, E, R>` In Public APIs

Do not erase Effect type parameters.

Good:

```ts
export type Runner<I, O, E, R> = (input: I) => Effect.Effect<O, E, R>
```

Bad:

```ts
export type Runner<I, O> = (input: I) => Promise<O>
export type Runner<I, O> = (input: I) => Effect.Effect<O, unknown, unknown>
```

Why:

- `A` tells the agent what the computation produces.
- `E` tells the agent what typed failures must be handled.
- `R` tells the agent which services/layers are missing.

`unknown` in the `R` channel is especially harmful. It becomes an unprovideable
requirement. Use `never` for no requirements, or a precise service union.

For agentic systems, mirror important `R` requirements into value-level
declarations because TypeScript erases `R` at runtime:

```ts
Capability.define("review-pull-request", {
  input: PRContext,
  output: ReviewReport,
  requires: Requirement.set([
    Requirement.service("repo-reader"),
    Requirement.permission("repo:read")
  ])
})
```

The type channel catches implementation wiring. The value-level requirement
set powers diagnostics, explanations, UI, repair suggestions, and preflight
runtime checks.

## 8. Use Effect Services, References, And Layers

Use services for dependencies, references for defaults/configuration-like
values, and layers for provisioning.

Typical service:

```ts
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

class RepoReadError extends Schema.TaggedErrorClass<RepoReadError>()("RepoReadError", {
  message: Schema.String
}) {}

class RepoReader extends Context.Service<
  RepoReader,
  {
    readonly readChangedFiles: (
      repository: string
    ) => Effect.Effect<ReadonlyArray<string>, RepoReadError>
  }
>()("app/RepoReader") {}

const repoReaderTestLayer = Layer.succeed(
  RepoReader,
  RepoReader.of({
    readChangedFiles: () => Effect.succeed(["src/index.ts"])
  })
)
```

Use `Effect.gen` for local programs:

```ts
const program = Effect.gen(function* () {
  const repoReader = yield* RepoReader
  const files = yield* repoReader.readChangedFiles("example/repo")
  return files.join("\n")
})
```

Use `Effect.fn("Name")` for reusable exported Effect functions:

```ts
export const summarizeChangedFiles = Effect.fn("summarizeChangedFiles")(
  function* (repository: string) {
    const repoReader = yield* RepoReader
    const files = yield* repoReader.readChangedFiles(repository)
    yield* Effect.logInfo("summarized changed files")
    return files.join("\n")
  }
)
```

Avoid this pattern:

```ts
const summarizeChangedFiles = (repository: string) =>
  Effect.gen(function* () {
    // ...
  })
```

Agents often generate that shape because it resembles ordinary async code.
Prefer `Effect.fn` because it gives a named trace span and a consistent pattern.

## 9. Use Schema At Every Data Boundary

Use `effect/Schema` for:

- external input;
- serialized output;
- config;
- tool parameters;
- tool success/failure values;
- domain IDs;
- tagged errors;
- diagnostics;
- reports and eval results.

Prefer deriving types from schemas:

```ts
export const CapabilityId = Schema.String.pipe(Schema.brand("CapabilityId"))
export type CapabilityId = typeof CapabilityId.Type
```

Do not duplicate the type by hand next to the schema. Drift is bad for agents
and humans.

For tagged data:

```ts
export const MissingRequirement = Schema.TaggedStruct("MissingRequirement", {
  severity: Schema.Literal("error"),
  path: Schema.Array(Schema.String),
  requirementId: Schema.String,
  suggestion: Schema.Literal("ProvideLayer", "UseMock")
})
```

Use Schema for shape validation, not as a proof engine. Contracts, specs, and
evals are separate concepts.

## 10. Make Diagnostics First-Class

Agent-facing errors should be structured and repairable. Do not only throw
strings or return prose.

Diagnostics should include:

- stable `_tag`;
- severity;
- path through the declaration/runtime/flow AST;
- capability, agent, process, runner, or node ids when available;
- requirement ids when relevant;
- expected and actual schema summaries for schema mismatches;
- structured suggestions such as `ProvideLayer`, `UseMock`, `BindRunner`,
  `InsertMap`, or `ReplaceRunner`.

Treat these as diagnostics before execution:

- missing runner;
- missing service requirement;
- missing config;
- missing secret;
- missing permission;
- missing human-interaction port;
- schema incompatibility;
- unsupported deployment assumption.

Treat evals as evidence after execution, not as ideal proofs.

## 11. Test With Minimal Focused Layers

Agents do better when tests reveal the smallest dependency set.

Use `@effect/vitest`:

```ts
import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

describe("feature", () => {
  it.effect("uses a focused layer", () =>
    Effect.gen(function* () {
      const summary = yield* summarizeChangedFiles("example/repo")
      assert.match(summary, /src/)
    }).pipe(Effect.provide(repoReaderTestLayer)))
})
```

Prefer:

- `it.effect` for Effect tests;
- `Effect.gen` inside tests;
- `Effect.provide`, `Effect.provideService`, or composed Layers;
- `TestClock` for time;
- `Layer.mock` for partial service mocks when the upstream API supports it;
- local test layers that provide only the needed services.

Avoid:

- whole-environment mocks when a single service layer is enough;
- real time in deterministic tests;
- hidden mutable global state;
- manually building layers when normal `Effect.provide` is clear.

## 12. Add Active Guardrail Probes

A config file can look correct but be inactive. Add a script that proves the
guards fire.

This repo uses:

```sh
pnpm run setup:test
```

The script checks:

- `@effect/language-service` is configured;
- TypeScript is patched;
- root and package Effect diagnostics are clean;
- temporary bad Effect probes fail with expected diagnostics;
- temporary bad oxlint probes fail with expected rules.

The active probe verifies:

```text
floatingEffect
missing service context
error-channel mismatch
missing yield*
console inside Effect
global fetch inside Effect
process.env inside Effect
JSON.parse / JSON.stringify guidance
oxlint console ban
oxlint process.env ban
oxlint global fetch ban
oxlint JSON API ban
```

Ignore temporary probe output:

```text
.setup-probes/
```

Include the diagnostic script in the aggregate check:

```json
{
  "scripts": {
    "check": "pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run setup:test"
  }
}
```

## 13. Make Aggregate Checks Mean The Whole Workspace

In a workspace, root scripts can silently skip packages. Avoid that.

Example:

```json
{
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit --pretty false && pnpm run sdk-core:typecheck",
    "lint": "oxlint -c .oxlintrc.json --tsconfig tsconfig.json --type-aware && pnpm run sdk-core:lint",
    "test": "vitest run --passWithNoTests && pnpm run sdk-core:test",
    "check": "pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run setup:test",
    "sdk-core:typecheck": "pnpm --filter @example/effect-core run typecheck",
    "sdk-core:lint": "pnpm --filter @example/effect-core run lint",
    "sdk-core:test": "pnpm --filter @example/effect-core run test",
    "sdk-core:check": "pnpm --filter @example/effect-core run check"
  }
}
```

For a new package, add:

```text
packages/sdk-core/package.json
packages/sdk-core/tsconfig.json
packages/sdk-core/vitest.config.ts
packages/sdk-core/src/index.ts
packages/sdk-core/test/smoke.test.ts
```

Workspace file:

```yaml
packages:
  - "."
  - "packages/*"
```

## 14. Keep Runtime Adapters Outside Core Meaning

Provider and runtime implementations are useful references, but they should not
become hidden dependencies of a reusable core. Model the boundary structurally
first:

```text
agent send -> Effect producing Stream<AgentOutput, AgentFinished | AiError, R>
```

The durable pattern is:

```text
semantic core
  -> provider-neutral declarations, diagnostics, runners, flows, evals

runtime / adapter package
  -> provider-specific runtime bindings
  -> concrete model, tool, transport, storage, and telemetry layers
```

This keeps business meaning portable across deterministic services, human
workflows, mocked runners, local simulations, and future providers.

For Effect AI specifically, use the same split:

```text
semantic core
  -> abstract LanguageModel / EmbeddingModel requirements
  -> Schema-backed tools, diagnostics, run events, evals

runtime / adapter package
  -> concrete provider Model binding
  -> provider config and credentials
  -> ExecutionPlan fallback
  -> telemetry and live tool layers
```

That means a capability can explain "missing model binding" or "missing API key"
before execution, and tests can provide a mock model layer without touching
provider code.

## 15. Optional: Add Focused Semantic Search Wrappers

For larger repositories, curated semantic search commands can help agents find
focused local context before editing. If you adopt those commands, add thin
wrappers that:

- search a curated corpus rather than the entire repo by default;
- avoid indexing `node_modules`, build outputs, logs, and oversized reference
  corpora by default;
- support updating the index for touched files;
- keep generated search indexes, temporary files, and logs ignored.

The reason to add semantic search is agent context control. Good agents should
retrieve focused local context before editing, not read the whole repository and
not rely on stale memory.

If you exclude `.repos/` from semantic search, keep it readable through normal
filesystem search so an agent can still inspect upstream files directly.

## 16. Learnings From The Applied Effect AI Example Repo

The applied `effect-ai-chat-example` repo is valuable because it is not just API
documentation. Its knowledge skills capture working app conventions.

Important takeaways:

- Use current Effect v4 APIs from local references, not memory.
- `Effect.fn("name")` is the reusable function shape; it adds spans and
  consistent stack context.
- `yield*` works with Yieldable values such as services, configs, effects,
  options, results, and tagged errors.
- `Config` is a declarative recipe, not raw `process.env`.
- Config defaults should distinguish missing values from invalid values.
- `Layer.provide` wires dependencies; `Layer.merge` combines independent
  layers. Do not merge a config override beside a live layer if the live layer
  needs the override during construction.
- Final live layers should be explicitly typed as `Layer.Layer<Provided>`. That
  makes missing providers fail at the layer declaration instead of at the final
  application entrypoint.
- Choose Effect-native modules before adding utility libraries: `Schedule` for
  retry/backoff, `ExecutionPlan` for provider fallback, `Duration`/`DateTime`/
  `Clock` for time, `Redacted` for secrets, `Option`/`Match` for branching, and
  `Metric`/spans for observability.
- Schema v4 tracks decoded, encoded, and service-requirement channels. Use
  sync decoders only when decode services are `never`; otherwise use Effectful
  decode/encode APIs.
- Streams are lazy pull-based values with backpressure. Use `Stream.callback`,
  `Stream.fromQueue`, `Stream.fromPubSub`, and structured SSE helpers instead
  of hand-rolled async event strings.
- Effect AI should be tested at the `LanguageModel` service boundary. Mock the
  model service while running real tool resolution and real handler layers.
- Tool definitions should carry Schema parameters, success, failure, and
  dependency declarations.
- AI runtime code should depend on abstract `LanguageModel` / `EmbeddingModel`
  requirements in core declarations. Bind concrete provider `Model` layers in
  runtime/adapters, not in SDK core.
- Preserve structured `AiError` in diagnostics and eval reports. Do not reduce
  provider/model failures to strings unless formatting for display.
- Model/provider fallback should be represented with `ExecutionPlan`, including
  retry/fallback conditions and attempt metadata, instead of hidden catch-block
  fallback.
- Agent runs should expose streamed Schema-backed events when there are partial
  outputs, tool calls, reasoning chunks, progress, or interruption semantics.
- SQL repositories should use `SqlSchema` when runtime validation matters. A
  typed SQL template is not a runtime proof.
- Database tests should use `it.layer` for shared layers and transaction
  rollback or cleanup for isolation, instead of custom wrappers around
  `Layer.build`.
- HTTP APIs should be schema-first declarations: shared `HttpApi` definitions,
  handler layers, OpenAPI annotations, and typed clients all derive from the
  same source.
- RPC is the right fit for typed procedure protocols, websocket clients,
  worker-style transports, and streaming run APIs. Keep domain RPC declarations
  transport-neutral and provide protocol/serialization layers at the edge.
- Workflow and cluster APIs are useful for durable agent runs, interruption,
  event streaming, and stateful entities. Keep them at integration boundaries
  until the SDK core denotation is stable.

These are exactly the patterns that make agent-generated code easier to repair:
the dependencies, errors, schemas, and runtime boundaries are visible.

## 17. Observability: Close The Loop After Runtime Exists

The check phase stops a lot of bad code before execution. It does not replace
runtime observation.

For real applications, expose agent-readable runtime signals:

- structured logs via `Effect.log*`;
- spans via `Effect.fn("name")` and `Effect.withSpan`;
- metrics where useful;
- traces attached to run reports;
- structured runtime events;
- schema-backed failure reports;
- eval reports over completed runs.

Prefer Effect-native telemetry integration where possible. The agent should be
able to answer questions like:

```text
What changed in latency?
Which capability failed?
Which runner was missing a requirement?
Which schema failed at which path?
Which tool call caused the bad output?
Which trace changed after the last patch?
```

For production, OpenTelemetry plus a queryable backend can become an agent tool.
For local debugging, a lightweight CLI that captures Effect spans/traces during
a reproduction gives the agent a precise trail to inspect.

## 18. Agent-Agnostic Operating Procedure

Use this procedure with any coding agent.

1. Start with the same repository instructions.
   Keep `AGENTS.md` as the source of truth and mirror it into tool-specific
   files only when necessary.

2. Force reference lookup before non-trivial Effect code.
   Agents should read `.repos/effect-smol/LLMS.md`, then the smallest relevant
   local pattern and applied example skill.

3. Generate or update a focused pattern when the area is unfamiliar.
   This is the "clone the repo, read the source, write the project pattern"
   loop. Save the pattern under `patterns/` before implementation.

4. Write a short spec for multi-step work.
   Use `plans/*.md` to capture scope, source references, implementation steps,
   verification, and non-goals. This survives fresh sessions and different
   agents.

5. Use a task git worktree for implementation work.
   Create one worktree/branch per task, keep `.repos/` available in that
   worktree, and do not let unmerged task edits pollute the main checkout.

6. Make the task diagnostic-first.
   Ask for explainable declarations and preflight diagnostics before executable
   runtime behavior.

7. Let the agent implement.
   Keep edits scoped and aligned with existing patterns.

8. Run checks.
   At minimum:

   ```sh
   pnpm run typecheck
   pnpm run lint
   pnpm run test
   pnpm run setup:test
   pnpm run check
   ```

9. Feed failures back verbatim.
   Effect diagnostics are semantically meaningful; give them to the agent as
   repair instructions.

10. Convert repeated mistakes into checks.
   If the agent repeatedly writes a bad pattern, add an LSP rule, lint rule,
   test, type-level constraint, diagnostic assertion, or active probe.

11. Update patterns.
   If the session discovers a reusable convention, record it in `patterns/`.

12. Start fresh when context is polluted.
   After large transcript reads, broad research, or a major topic switch, save
   the state in `plans/` or `patterns/` and start a new session.

13. Update semantic search if enabled.
   If using search wrappers, update touched files in the index.

## 19. Common Agent Failure Modes And Deterministic Fixes

| Failure | Deterministic fix |
| --- | --- |
| Agent writes `console.log` | Ban with oxlint and Effect LSP; use `Effect.logInfo`, `Effect.logDebug`, or logger services. |
| Agent reads `process.env` | Ban with oxlint and Effect LSP; use `Config` / `ConfigProvider`. |
| Agent uses global `fetch` | Ban with oxlint and Effect LSP; use Effect HTTP client modules. |
| Agent writes `JSON.parse` | Ban with oxlint and Effect LSP; use Schema decode/encode APIs. |
| Agent leaves an Effect floating | `floatingEffect` diagnostic. |
| Agent writes `yield` in `Effect.gen` | `missingStarInYieldEffectGen` diagnostic. |
| Agent erases `E` or `R` | Public API review, type tests, LSP missing error/context probes. |
| Agent leaks service implementation dependencies | `leakingRequirements` diagnostic plus service design review. |
| Agent mocks the whole world | Write tests with focused `Layer.succeed`, `Layer.effect`, or `Layer.mock`. |
| Agent invents an old Effect API | Require local `.repos/effect-smol/LLMS.md` and relevant `effect-ai-chat-example` skill lookup. |
| Agent adds hidden registries | Coding standard: immutable declarations and explicit runtime bindings. |
| Agent cannot find reference source | Keep `.repos/` readable; exclude it from builds/lint/tests instead of blindly gitignoring it. |
| Agent adds utility libraries too early | Check `patterns/effect-module-selection.md` and Effect source/tests first. |
| Agent hand-rolls HTTP boundaries | Use `patterns/effect-http-api.md` and shared Schema-first `HttpApi` declarations. |
| Agent hand-rolls typed procedure transport | Use `patterns/effect-rpc.md`; keep Schema-backed RPC declarations separate from transport layers. |
| Agent imports provider packages into core | Use `patterns/effect-ai-runtime.md`; require abstract AI services in core and bind concrete providers in runtime/adapters. |
| Agent hides model fallback in catch blocks | Use `ExecutionPlan` and expose fallback policy in diagnostics before execution. |
| Agent returns only final AI text | Use streamed Schema-backed run events when the run has partial output, tools, reasoning, or interruption. |
| Agent treats SQL types as validation | Use `patterns/effect-sql.md`; add `SqlSchema` or boundary Schema decoding. |
| Agent uses plain string IDs | Use branded/domain Schema IDs and decode at API/tool/config edges. |
| Agent manually builds test layers | Prefer `it.layer`, focused `Layer.succeed`/`Layer.effect`, and transaction rollback for DB tests. |
| Agent misses layer wiring until `main` | Annotate final live layers as `Layer.Layer<Provided>` so TypeScript catches unprovided requirements earlier. |
| Agent adds ad hoc long-running state | Consider workflow/cluster patterns, but keep runtime integration out of core unless scoped. |

## 20. Minimal Bootstrap Checklist

Use this checklist for a new Effect repo.

- [ ] Add `.repos/effect-smol`, optional local-only
  `.repos/effect-ai-chat-example`.
- [ ] Keep `.repos/` visible to agents while excluding it from builds, lint,
  tests, and oversized indexes.
- [ ] Add `AGENTS.md` with project purpose, reference routing, Effect rules,
  Schema rules, diagnostics, coding standards, and validation commands.
- [ ] Add `patterns/README.md`, `patterns/effect-skill-index.md`,
  `patterns/agent-pattern-workflow.md`, `patterns/effect-ai-runtime.md`,
  `patterns/effect-code.md`,
  `patterns/effect-testing.md`, and any domain-specific pattern files such as
  `patterns/effect-module-selection.md`, `patterns/effect-http-api.md`,
  `patterns/effect-rpc.md`, `patterns/effect-sql.md`, and
  `patterns/effect-workflow-cluster.md`.
- [ ] Install `effect`, `typescript`, `@effect/language-service`, `oxlint`,
  `oxlint-tsgolint`, `@effect/vitest`, and `vitest`.
- [ ] Configure `tsconfig.json` with the Effect language-service transform and
  strict diagnostics.
- [ ] Add `prepare: effect-language-service patch`.
- [ ] Add type-aware `oxlint`.
- [ ] Ban raw `console`, `process.env`, global `fetch`, `JSON.parse`, and
  `JSON.stringify`.
- [ ] Add `setup:test` probes that prove guardrails are active.
- [ ] Add aggregate `check` that runs typecheck, lint, tests, and diagnostics.
- [ ] Add a service/layer test proving `Effect<A, E, R>` requirements are
  preserved and locally provideable.
- [ ] Type final live layers explicitly as `Layer.Layer<Provided>`.
- [ ] Keep generated search indexes, `node_modules`, build outputs, and
  temporary probe directories out of normal builds and commits.
- [ ] Make the `.repos/` Git/bootstrap strategy explicit for the team.
- [ ] For agentic SDKs, make declarations explainable before executable
  behavior.
- [ ] For runtime systems, expose structured logs/traces/run reports so agents
  can observe completed runs.

## 21. Verification Commands

For a generated project, the verification commands are:

```sh
pnpm run setup:test
pnpm run check
```

`setup:test` runs:

```text
static setup contract checks
Effect language-service patch check
project typecheck
project Effect diagnostics
type-aware oxlint
Vitest tests
negative Effect diagnostic probes
negative oxlint probes
```

Focused commands:

```sh
pnpm exec effect-language-service check
pnpm run effect:diagnostics
pnpm run typecheck
pnpm run lint
pnpm run test
```

The expected healthy state is:

```text
Effect language-service patch is active
Effect diagnostics are clean
bad-code probes fail with expected Effect diagnostics
oxlint bad-code probes fail with expected lint diagnostics
all tests pass
```

That state is what makes the project friendly to agents: the feedback is
structured, local, current, and repairable.

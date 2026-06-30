# Agent Pattern Workflow

This pattern captures the repo workflow for turning one-off agent learnings into
persistent project context. Use it before implementation work that touches an
unfamiliar Effect module, app boundary, or testing shape.

## Files Inspected

- `AGENTS.md`
- `patterns/README.md`
- `patterns/effect-skill-index.md`
- `.repos/effect-smol/LLMS.md`
- `.repos/effect-smol/ai-docs/src/51_http-server/`
- `.repos/effect-smol/ai-docs/src/80_cluster/`
- `docs/reference/effect-ai-chat-example/knowledge/skills/README.md`
- `docs/reference/effect-ai-chat-example/knowledge/skills/effect-sql-v4.md`
- `docs/reference/effect-ai-chat-example/knowledge/skills/effect-sql-testing-v4.md`

## Recommended Pattern

Use this loop for non-trivial work:

1. Read `AGENTS.md`.
2. Read `.repos/effect-smol/LLMS.md`.
3. Pick the smallest relevant pattern from `patterns/effect-skill-index.md`.
4. Inspect current local upstream reference files under `.repos/`.
5. If the area does not have a local pattern yet, create or update one before
   implementing.
6. Write a small spec in `plans/` for multi-step work, then implement from it.
7. Run focused checks, then aggregate checks when code changed.
8. If a repeated failure appears, promote it into a pattern, lint rule, probe,
   or test.

Reference-source prompts should be explicit:

```text
Explore .repos/effect-smol for the current HttpApi pattern. Save the relevant
files inspected, recommended local pattern, things to avoid, and verification
commands in patterns/effect-http-api.md. Then implement the feature from that
pattern.
```

Keep the generated pattern small enough for future agents to read. It should
answer "what should I do in this repo?" rather than restating all upstream docs.

For external libraries, prefer local source and tests over docs. Use docs only
when source/tests do not answer the question, and use `node_modules` as a
fallback only when source is not cloned. Pattern files should contain project
decisions, traps, and examples, not copied API documentation.

## Plans

Use `plans/*.md` when a task has more than a couple of steps or when the agent
needs a stable handoff artifact. A plan should include:

- scope;
- files likely touched;
- source references inspected;
- implementation steps;
- verification commands;
- known non-goals.

This is more durable than relying on a tool's temporary planning mode because it
survives fresh sessions, different agents, and context compaction.

## Fresh Context

Long agent sessions drift. Prefer fresh sessions for:

- switching from research to implementation;
- changing from HTTP/API work to SQL/persistence work;
- moving from code changes to review;
- tasks after a large transcript or broad reference read.

Before a fresh session, save decisions in `plans/` or `patterns/` so the next
agent starts from repo context rather than chat memory.

## Reference Repos

Keep `.repos/` readable to the tools that need it. Exclude it from TypeScript
projects, lint, tests, and search indexes that should stay small. Do not blindly
add `.repos/` to `.gitignore` if your editor or agent ignores gitignored files,
because that can hide the most useful reference source.

Good exclusions:

- `tsconfig.json` `exclude`;
- oxlint `ignorePatterns`;
- Vitest test include patterns;
- semantic-search indexes that should cover only implementation files.

Git strategy is project-dependent. For a small prototype repo, shallow clones in
`.repos/` are fine. For a team repo, consider a documented bootstrap script or a
squashed subtree/submodule only if the team agrees to maintain it.

## Tooling Shape

Less is often more. Give agents:

- local reference source;
- short root instructions;
- small pattern files;
- deterministic checks;
- focused command scripts.

Avoid broad always-loaded prompts, giant generated context dumps, and tool lists
that encourage exploration over implementation.

## Things To Avoid

- Implementing from stale memory instead of `.repos/`.
- Treating pattern files as API source of truth instead of project guidance.
- Adding every Effect topic to `AGENTS.md`; route detailed topics through
  `patterns/`.
- Saving a plan only in chat.
- Letting repeated model mistakes remain as comments instead of checks.
- Running watch-mode commands or long-running dev servers unless the task asks
  for them.

## Verification

For docs-only pattern updates:

```sh
rg -n "patterns/effect-http-api|patterns/effect-sql|patterns/effect-workflow-cluster" AGENTS.md patterns docs
pnpm run setup:test
```

For code changes, use the repo aggregate gate:

```sh
pnpm run check
```

# Effect Agent Setup Kit

Reusable setup kit for small Effect projects that need deterministic feedback
for coding agents.

## Use

This repository is the setup kit. To generate a project, either a human or an
agent must have filesystem access to this checkout and run the setup script from
it:

```sh
node scripts/setup.mjs /path/to/new-project
```

The script is the installer. It copies `templates/default`, installs packages,
patches TypeScript, clones `.repos/effect-smol`, and runs `pnpm run setup:test`
inside the generated project.

By default this uses the setup-kit `package.json` `effect` version.

Version options:

```sh
node scripts/setup.mjs /path/to/new-project --effect-version current
node scripts/setup.mjs /path/to/new-project --effect-version latest
node scripts/setup.mjs /path/to/new-project --effect-version 4.0.0-beta.90
```

- `current` uses this setup-kit package's `dependencies.effect`.
- `latest` resolves the npm `beta` dist-tag for `effect`.
- any other value is treated as an exact version.

The generated project installs `effect` and `@effect/vitest` at the same
resolved Effect version, then clones
`https://github.com/Effect-TS/effect-smol.git` into `.repos/effect-smol` at tag
`effect@<resolved-version>`.

## Agent And Skill Usage

The optional skill at `skills/effect-agent-setup/SKILL.md` is not a standalone
installer by itself. A skill is instructions for an agent; it does not package
or fetch this repository automatically.

There are two supported ways to use it:

- **Generate a new project from this setup-kit checkout.** Ask an agent that has
  filesystem access to this repository to use the skill and run:

  ```sh
  node /path/to/effect-agent-setup-kit/scripts/setup.mjs /path/to/new-project --effect-version current
  ```

  That command scaffolds the generated project, installs dependencies, clones
  `.repos/effect-smol`, patches TypeScript, copies the standalone verifier, and
  runs `pnpm run setup:test`.

- **Maintain an already-generated project.** In a generated project, use the
  skill after changing Effect versions or refreshing patterns. The skill tells
  the agent to inspect `.repos/effect-smol`, update local patterns/docs, and run
  `pnpm run setup:test` plus `pnpm run check`.

If a user only references the skill text without making this setup-kit checkout
available, the agent can follow the workflow conceptually, but it cannot copy
the templates or run `scripts/setup.mjs`. In that case the user must first clone
or otherwise provide this repository to the agent.

## Generated Project

The template lives in `templates/default`. Generated projects include:

- strict TypeScript plus Effect language-service diagnostics;
- type-aware oxlint guardrails for raw `console`, `process.env`, global
  `fetch`, and unchecked JSON APIs;
- `@effect/vitest` with `it.effect`;
- `AGENTS.md` and `CLAUDE.md`;
- curated docs and patterns, including the full
  `docs/agentic-effect-setup-manual.md`;
- copied module-level Effect skills, UI rules, and custom oxlint examples under
  `docs/reference/effect-ai-chat-example/`;
- `scripts/test-setup.mjs`, a standalone verifier copied into the generated
  project.

## Verify

After setup:

```sh
cd /path/to/new-project
pnpm run setup:test
pnpm run check
```

`setup:test` verifies static config, the TypeScript patch, clean
TypeScript/Effect/lint/test results, the pinned `.repos/effect-smol` clone,
dependency version pairing, and negative probes that prove guardrails fire.

## Setup Kit Layout

- `scripts/setup.mjs` copies `templates/default`, resolves the Effect version,
  installs dependencies, patches TypeScript, clones Effect reference source, and
  runs the verifier.
- `scripts/test-setup.mjs` is intentionally standalone so generated projects can
  keep using it without importing this setup kit.
- `skills/effect-agent-setup/SKILL.md` is optional portable guidance for
  refreshing patterns after Effect version changes.

## References And Acknowledgments

This setup kit is based on a few public Effect agent-coding workflows and
reference projects:

- Lucas Barake's
  [`effect-ai-chat-example`](https://github.com/lucas-barake/effect-ai-chat-example)
  and [YouTube channel](https://www.youtube.com/@lucas-barake), especially the
  copied `knowledge/skills`, `knowledge/rules`, and `scripts/oxlint-rules`
  material used as generated-project reference docs.
- Michael Arnaldi's AI Engineer workshop
  [Vibe Engineering Effect Apps](https://www.youtube.com/watch?v=Wmp2Tku2PrI)
  and X handle [`@MichaelArnaldi`](https://x.com/MichaelArnaldi), which informed
  the "clone the repo, extract patterns from source" workflow.
- Maxwell Brown's Effect article
  [The One Weird Git Trick That Makes Coding Agents More Effect-ive](https://effect.website/blog/the-one-weird-git-trick-that-makes-coding-agents-more-effect-ive/),
  which argues for putting dependency source where agents can inspect it and
  documenting that boundary in agent instructions.

This kit applies that local-source principle by cloning `effect-smol` into
`.repos/effect-smol` at `effect@<resolved-version>` and instructing agents to
use it as read-only reference material. It does not currently use git subtrees;
the clone is a generated-project setup step.

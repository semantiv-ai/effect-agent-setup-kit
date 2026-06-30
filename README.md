# Effect Agent Setup Kit

Generate a small Effect project that is ready for coding agents: strict
TypeScript, Effect language-service diagnostics, type-aware oxlint, Vitest,
local Effect reference source, and a setup receipt.

## Quick Start

Clone the setup kit and run the setup script:

```sh
git clone https://github.com/semantiv-ai/effect-agent-setup-kit.git
cd effect-agent-setup-kit
node scripts/setup.mjs ~/Documents/my-effect-project --effect-version current
```

No-clone option:

```sh
tmp="$(mktemp -d)"
curl -fsSL https://github.com/semantiv-ai/effect-agent-setup-kit/archive/refs/heads/main.tar.gz \
  | tar -xz -C "$tmp" --strip-components=1
node "$tmp/scripts/setup.mjs" ~/Documents/my-effect-project --effect-version current
```

Agent skill option:

If your agent can use a skill from a repository path or URL, point it at:

```text
https://github.com/semantiv-ai/effect-agent-setup-kit/blob/main/skills/effect-agent-setup/SKILL.md
```

Then ask it to create the project. The skill instructs the agent to download the
public archive when the repo is not cloned, run `scripts/setup.mjs`, and verify
the generated project.

Version options:

- `current`: use this setup kit's pinned `effect` version.
- `latest`: resolve the npm `beta` dist-tag for `effect`.
- exact version, for example `4.0.0-beta.90`.

## What Setup Does

The setup script:

- copies `templates/default` into the target project;
- installs `effect` and `@effect/vitest` at the same resolved version;
- installs TypeScript, the Effect language service, oxlint, and Vitest;
- patches TypeScript for Effect diagnostics;
- clones `https://github.com/Effect-TS/effect-smol.git` into
  `.repos/effect-smol` at `effect@<resolved-version>`;
- copies curated reference docs under `docs/reference/`;
- copies `scripts/test-setup.mjs`;
- runs `pnpm run setup:test`.

After setup, the generated project contains `SETUP-RECEIPT.md`. That file is
the local receipt showing the project passed setup verification and is ready for
coding.

## Verify Later

From the generated project:

```sh
pnpm run setup:test
pnpm run check
```

`setup:test` refreshes `SETUP-RECEIPT.md` after all setup checks pass.

For setup-kit contributors:

```sh
pnpm run smoke:test
```

The smoke test generates a temporary project, verifies `SETUP-RECEIPT.md`, runs
`pnpm run check` in the generated project, and removes the temporary directory
unless `KEEP_SMOKE_DIR=1` is set.

## Generated Project Includes

- `AGENTS.md` and `CLAUDE.md` with agent instructions.
- `patterns/effect-skill-index.md` for routing agents to relevant references.
- `docs/agentic-effect-setup-manual.md`.
- copied Effect module skills, UI rules, and custom oxlint examples from
  `effect-ai-chat-example`.
- negative guardrail probes proving diagnostics and lint rules actually fire.

## Optional Skill

`skills/effect-agent-setup/SKILL.md` is agent guidance. It is not an installer
by itself. An agent can use it when the setup-kit files are available by clone
or archive download, then run `scripts/setup.mjs`.

## References

- Lucas Barake's
  [`effect-ai-chat-example`](https://github.com/lucas-barake/effect-ai-chat-example)
  and [YouTube channel](https://www.youtube.com/@lucas-barake).
- Michael Arnaldi's
  [Vibe Engineering Effect Apps](https://www.youtube.com/watch?v=Wmp2Tku2PrI)
  and X handle [`@MichaelArnaldi`](https://x.com/MichaelArnaldi).
- Maxwell Brown's
  [The One Weird Git Trick That Makes Coding Agents More Effect-ive](https://effect.website/blog/the-one-weird-git-trick-that-makes-coding-agents-more-effect-ive/).

This kit applies the local-source principle by cloning `effect-smol` into
`.repos/effect-smol` as read-only reference source. It uses a setup-time clone,
not a git subtree.

## License

MIT, matching Effect.

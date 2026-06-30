# Agent Support

The base setup is agent-neutral. It gives agents instructions, but correctness
comes from deterministic checks.

Supported instruction entrypoints:

| Agent | Project file |
| --- | --- |
| Codex | `AGENTS.md` |
| OpenCode | `AGENTS.md` |
| Pi | `AGENTS.md` |
| Claude Code | `CLAUDE.md` |

From the setup-kit repository, create a new project with:

```sh
node scripts/setup.mjs /path/to/new-project --effect-version current
```

Then verify the target project:

```sh
cd /path/to/new-project
pnpm run setup:test
pnpm run check
```

`scripts/test-setup.mjs` can be copied into another Effect project and run there
when that project follows this base contract. It checks config, clean
TypeScript/Effect/lint/test results, and negative probes that prove guardrails
fire.

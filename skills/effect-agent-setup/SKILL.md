# Effect Agent Setup

Use this skill when generating a new Effect project from the setup kit or when
updating an Effect project generated from it after changing the Effect version.

This skill is not a standalone installer. It is agent guidance. To scaffold a
project, the agent must have filesystem access to the setup-kit checkout that
contains `scripts/setup.mjs` and `templates/default`.

## Generate A New Project

When the user asks to create a new project from this setup kit:

1. Locate the setup-kit checkout.
2. Run the setup script from that checkout:

```sh
node /path/to/effect-agent-setup-kit/scripts/setup.mjs /path/to/new-project --effect-version current
```

Use `--effect-version latest` to resolve the npm `beta` dist-tag for `effect`,
or pass an exact version such as `4.0.0-beta.90`.

The setup script must:

- copy `templates/default` into the target;
- install `effect` and `@effect/vitest` at the same resolved version;
- copy `scripts/test-setup.mjs` into the target;
- clone `https://github.com/Effect-TS/effect-smol.git` into
  `.repos/effect-smol` at `effect@<resolved-version>`;
- patch TypeScript with the Effect language service;
- run `pnpm run setup:test`.

After generation, run:

```sh
cd /path/to/new-project
pnpm run setup:test
pnpm run check
```

If the setup-kit checkout is not available, tell the user that the skill alone
cannot scaffold files. The user must clone or provide the setup-kit repository,
or explicitly ask for a manual recreation.

## Maintain A Generated Project

1. Read `.repos/effect-smol/LLMS.md` for the checked-out version.
2. Read `patterns/README.md`, then the smallest relevant pattern file.
3. Inspect upstream source or tests under `.repos/effect-smol` before changing
   non-trivial Effect code.
4. Update only the local pattern files whose guidance changed for the new
   version.
5. Keep generated code importing Effect from `node_modules` paths such as
   `effect/Effect`; never import application code from `.repos`.
6. Run:

```sh
pnpm run setup:test
pnpm run check
```

## Version Refresh Checklist

- Confirm `package.json` has the same exact version for `effect` and
  `@effect/vitest`.
- Confirm `.repos/effect-smol` is checked out at `effect@<effect-version>`.
- Refresh examples that use moved or renamed Effect APIs.
- Keep `AGENTS.md`, `CLAUDE.md`, and `patterns/` short and source-backed.
- Keep the generated `README.md` and `docs/reference/` provenance notes aligned
  when adding, removing, or replacing copied reference material.

# Custom Agent Lint Rules

Use this when an agent repeatedly makes a mistake that the Effect language
service, TypeScript, oxlint, or tests do not already catch.

## Source References

- `.oxlintrc.json`
- `scripts/test-setup.mjs`
- `docs/reference/effect-ai-chat-example/oxlintrc.example.json`
- `docs/reference/effect-ai-chat-example/scripts/oxlint-rules/`

The copied `effect-ai-chat-example` oxlint rules are examples, not enabled
defaults. They assume React and package aliases such as `@app`, so adapt them
before using them in another repository.

## Promotion Ladder

Prefer the cheapest deterministic guard that explains the failure:

1. Add or tighten an Effect language-service diagnostic when the mistake is an
   Effect semantic issue.
2. Add an oxlint rule for raw API use, unsafe TypeScript, imports, or framework
   conventions.
3. Add a negative probe to `scripts/test-setup.mjs` when the rule must prove it
   actually fires.
4. Add a focused test when the mistake is behavior-specific.
5. Record the convention in `patterns/` only after the check exists or when a
   check would be too expensive for the risk.

## Existing Guardrails

This template already bans:

- raw `console`;
- raw `process.env`;
- global `fetch`;
- unchecked `JSON.parse`;
- unchecked `JSON.stringify`;
- floating promises;
- unsafe TypeScript operations as warnings;
- key Effect mistakes through the language-service diagnostics.

## Useful Borrowed Rule Shapes

- `enforce-react-namespace`: enforces `React.useMemo` style namespace imports.
  Use only in React projects that want that convention.
- `no-deep-relative-imports`: pushes deep `../../` imports toward a package
  alias. Adapt the package roots and alias before enabling.
- `no-relative-import-outside-package`: prevents relative imports from crossing
  package boundaries. Adapt the alias and package detection for the workspace.

## Verification

When changing guardrails:

```sh
pnpm run setup:test
pnpm run check
```

If a new guardrail should be part of the setup contract, add a bad-code probe to
`scripts/test-setup.mjs` so generated projects prove it is active.

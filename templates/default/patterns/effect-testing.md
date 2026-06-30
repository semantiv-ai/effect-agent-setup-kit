# Effect Testing Pattern

## Files Inspected

Template source:

- `test/index.test.ts`
- `vitest.config.ts`

Effect reference:

- `.repos/effect-smol/LLMS.md`
- `.repos/effect-smol/ai-docs/src/09_testing/10_effect-tests.ts`
- `.repos/effect-smol/ai-docs/src/09_testing/20_layer-tests.ts`

## Recommended Pattern

Use `@effect/vitest` for Effect tests.

- Import `describe`, `it`, and assertions from `@effect/vitest`.
- Use `it.effect` for tests that return an Effect.
- Use `Effect.gen` inside tests.
- Provide test services with `Effect.provide`, `Effect.provideService`, or
  composed Layers.
- Use `TestClock` for time-dependent tests.
- Keep test layers explicit and local unless a shared fixture removes real
  duplication.

Example:

```ts
import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

describe("Example", () => {
  it.effect("uses a test layer", () =>
    Effect.gen(function* () {
      const service = yield* Example
      const result = yield* service.run("input")
      assert.strictEqual(result, "input")
    }).pipe(Effect.provide(ExampleTest.layer)),
  )
})
```

## Things To Avoid

- Do not use `bun test`; this repository uses `vitest run`.
- Do not create custom wrappers that manually call `Layer.build` just to provide
  dependencies to a test.
- Do not use real time for deterministic timing tests. Use `TestClock`.
- Do not make tests depend on global mutable state unless the setup and cleanup
  are explicit.

## Verification

Run:

```sh
pnpm test
```

Run a single file with:

```sh
pnpm vitest run test/index.test.ts
```

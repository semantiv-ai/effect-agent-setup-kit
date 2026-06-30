import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { EmptyNameError, GreetingServiceLive, greet } from "../src/index.js"

describe("effect-agent-app", () => {
  it.effect("runs an Effect through an explicitly provided layer", () =>
    Effect.gen(function* () {
      const message = yield* greet({ name: "Ada" })
      assert.strictEqual(message, "hello, Ada")
    }).pipe(Effect.provide(GreetingServiceLive)))

  it.effect("preserves typed domain failures", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(greet({ name: "   " }))
      assert.instanceOf(error, EmptyNameError)
      assert.strictEqual(error.message, "Name cannot be empty.")
    }).pipe(Effect.provide(GreetingServiceLive)))
})

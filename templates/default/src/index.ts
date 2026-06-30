import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

export const GreetingRequest = Schema.Struct({
  name: Schema.String
})

export type GreetingRequest = typeof GreetingRequest.Type

export class EmptyNameError extends Schema.TaggedErrorClass<EmptyNameError>()(
  "EmptyNameError",
  {
    message: Schema.String
  }
) {}

export class GreetingService extends Context.Service<
  GreetingService,
  {
    readonly greet: (input: string) => Effect.Effect<string, EmptyNameError>
  }
>()("effect-agent-app/GreetingService") {}

const greetWithLiveService = Effect.fn("GreetingService.greet")(function* (
  input: string
): Effect.fn.Return<string, EmptyNameError> {
  const name = input.trim()
  if (name.length === 0) {
    return yield* new EmptyNameError({ message: "Name cannot be empty." })
  }
  yield* Effect.logInfo("Greeting request accepted.")
  return `hello, ${name}`
})

export const GreetingServiceLive: Layer.Layer<GreetingService> = Layer.succeed(
  GreetingService,
  GreetingService.of({ greet: greetWithLiveService })
)

export const greet = Effect.fn("greet")(function* (
  request: GreetingRequest
): Effect.fn.Return<string, EmptyNameError, GreetingService> {
  const service = yield* GreetingService
  return yield* service.greet(request.name)
})

export const greetUnknown = Effect.fn("greetUnknown")(function* (
  input: unknown
) {
  const request = yield* Schema.decodeUnknownEffect(GreetingRequest)(input)
  return yield* greet(request)
})

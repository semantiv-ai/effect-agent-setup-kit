# Effect Code Pattern

## Files Inspected

Template source:

- `src/index.ts`
- `test/index.test.ts`

Effect reference:

- `.repos/effect-smol/LLMS.md`
- `.repos/effect-smol/ai-docs/src/01_effect/01_basics/10_creating-effects.ts`
- `.repos/effect-smol/ai-docs/src/01_effect/02_services/10_reference.ts`
- `.repos/effect-smol/ai-docs/src/01_effect/02_services/20_layer-composition.ts`

## Recommended Pattern

Write Effect code in the style documented in `.repos/effect-smol/LLMS.md`
and captured by local project patterns.

- Use namespace imports from Effect packages, for example
  `import * as Effect from "effect/Effect"`.
- Use `Effect.gen` for local imperative-style programs.
- Use `Effect.fn("Service.method")` for named service methods and exported
  functions that return Effects.
- For SDK execution boundaries such as runner, flow, and eval helpers, prefer a
  named `Effect.fn("Module.function")` wrapper and annotate the generator with
  `Effect.fn.Return<A, E, R>` when generics are involved. This keeps traces
  readable without erasing public `Effect.Effect<A, E, R>` channels. Do not
  apply `Effect.fn` to pure declaration constructors or builders that do not
  return Effects.
- Use `Context.Service` for services.
- Use `Context.Reference` for configuration with defaults, as in
  `ConversationMode` and `TurnTimeout`.
- When exporting a `Context.Reference`, avoid giving its value type alias the
  exact same name as the reference class; TypeScript treats type/value class
  declarations as a duplicate in this pattern. Use a suffix such as `Value`, for
  example `SchemaCompatibilityModeValue` for class `SchemaCompatibilityMode`.
- Use `Layer.effect`, `Layer.succeed`, `Layer.provide`, `Layer.provideMerge`,
  and `Layer.mergeAll` for dependency wiring.
- Type final live layers explicitly as the services they provide. This makes
  missing dependency wiring fail where the layer is declared instead of later at
  the final program entrypoint.
- Use `Schema.Class`, `Schema.TaggedClass`, `Schema.TaggedErrorClass`, or
  `Schema.Opaque` for data and errors.
- For first-class schema-carrying domain metadata, such as ports and node
  definitions, parameterize by `S extends Schema.Top` and derive types from
  `S["Type"]` / `S["Encoded"]`. Do not erase these values to decoded-only
  `Schema.Schema<A>` when the encoded side, codec behavior, or service
  requirements may matter later.
- For finite product payloads, use native `Schema.Tuple([...])` and TypeScript
  readonly tuples. Add helper metadata only for coordination ergonomics such as
  ordered factor lists or associative flattening; do not introduce custom
  runtime `Pair`/`Product` payload objects.
- For public `Effect` / `Stream` type aliases, do not default the environment
  type parameter `R` to `unknown`. In Effect, `unknown` becomes an unprovideable
  required context in tests and callers. Prefer `R = never` for pure/default
  streams, or use a precise union of required services (for example
  `TraceSink | Scope`) when the runtime handle intentionally exposes scoped
  streams.
- TypeScript often cannot infer a schema generic `S extends Schema.Top` from a
  decoded value position like `EnvelopeOf<S["Type"]>` alone. For public helpers
  whose callbacks need decoded payload types, include an explicit schema-bearing
  option such as `inputSchema: S` or a port carrying `S` so callers get precise
  payload types without assertions.
- At payload or external-data boundaries, if Effect Schema v4 produces a
  `SchemaIssue.Issue`, prefer preserving that structured issue in typed
  error/report data when it is not awkward. Wrap it with graph context such as
  workflow id, node id, port id, edge id, and envelope/message id so multi-agent
  failures can produce deterministic traces. This does not replace domain graph
  errors such as missing nodes, duplicate ids, direction mismatches, or cycles.
  Avoid reducing schema issues to strings until display/log formatting.
- At executable SDK boundaries, validate inside the returned Effect with
  `Schema.decodeUnknownEffect(...)` or `Schema.decodeEffect(...)`, then map the
  `SchemaError` into a domain `Schema.TaggedErrorClass`. When validating a value
  that is already in the schema's decoded `Type` representation, such as a
  runner output, validate against `Schema.toType(schema)` so encoded-side
  transformations are not incorrectly re-applied. Do not use
  `Schema.decodeUnknownSync(...)` inside runner execution paths, because a
  synchronous throw bypasses the public `Effect.Effect<A, E, R>` error channel.
- Keep separate execution paths for unknown external encoded data and already
  decoded internal data. `Runner.runUnknown` should decode external encoded
  input through the full schema. Flow-internal step values have already crossed
  a Schema boundary and should be validated with `Schema.toType(schema)` before
  calling the runner implementation, otherwise transformed schemas such as
  `Schema.FiniteFromString` are decoded once and then incorrectly decoded again
  as if the decoded number were an external string.
- TypeScript does not allow referencing a class type parameter from a
  `Schema.Class` base class expression. For schema-backed data whose public API
  needs a typed payload, keep the schema class concrete and export a generic
  refined alias, for example `type EnvelopeOf<A> = Envelope & { readonly payload:
  A }`.
- Use `Schema.DateValid` rather than bare `Schema.Date` for domain timestamps
  that must reject invalid JavaScript `Date` instances.
- For branded IDs, make the Schema value the source of truth and derive the
  TypeScript type from the schema:

  ```ts
  export const EdgeId = Schema.String.pipe(Schema.brand("EdgeId"))
  export type EdgeId = typeof EdgeId.Type
  ```

  Do not duplicate the type manually with `Brand.Brand<...>` next to a schema;
  that can drift if the schema changes.
- When a `Context.Reference` override must affect construction of a live layer,
  provide the override into that layer:
  `liveLayer.pipe(Layer.provide(referenceOverrideLayer))`. Do not use
  `Layer.merge(liveLayer, referenceOverrideLayer)` for this case; that exposes
  both layers side by side and can leave the live layer using the reference's
  default value.
- For queue-to-stream runtime helpers that must complete gracefully, type the
  queue error as `E | Cause.Done`, call `Queue.end(queue)`, and expose it with
  `Stream.fromQueue(queue)`, which removes `Cause.Done` from the public stream
  error channel. Use `Queue.fail(queue, typedError)` when termination is meant to
  be observed as a typed runtime failure. In Effect v4, `Stream.runForEach` does
  not provide an element index; keep an explicit `Ref` counter when index-aware
  stream consumption is needed at a producer boundary.
- With `exactOptionalPropertyTypes`, do not assign `undefined` to optional
  fields in option objects. Capture optional values in locals and spread the
  property only in the defined branch, especially for branded ids such as
  `edgeId`, `nodeId`, and `portId`.

Example shape:

```ts
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

export class ExampleError extends Schema.TaggedErrorClass<ExampleError>()(
  "ExampleError",
  { message: Schema.String },
) {}

export class Example extends Context.Service<
  Example,
  {
    readonly run: (input: string) => Effect.Effect<string, ExampleError>
  }
>()("app/Example") {}

export const layer = Layer.effect(
  Example,
  Effect.gen(function* () {
    const run = Effect.fn("Example.run")(function* (input: string) {
      if (input.length === 0) {
        return yield* new ExampleError({ message: "empty input" })
      }
      return input
    })

    return Example.of({ run })
  }),
)

export const live: Layer.Layer<Example> = layer
```

## Things To Avoid

- The Effect language-service diagnostic for unnecessary chained `.pipe` calls is
  name-based enough to flag non-Effect builder APIs that expose a `.pipe`
  method. In tests and internal examples for such builders, avoid consecutive
  `.pipe(...).pipe(...)` calls by staging intermediate values unless the test is
  specifically documenting the exact fluent syntax.

- Do not use `as any` or `as unknown as X` to satisfy the compiler.
- Do not import `effect/Brand` just to hand-write branded ID aliases when an
  Effect Schema brand exists. Use `typeof IdSchema.Type`.
- Do not parse unknown external input by assigning an interface. Decode it with
  Schema.
- Do not throw raw errors from Effect programs when a typed error belongs in the
  error channel.
- Do not leave Effects floating. Yield them, return them, or compose them.
- Do not chain arbitrary `Effect.provide` calls when a Layer composition would
  make dependencies clearer.
- Do not merge a configuration reference layer beside a live layer when the live
  layer needs the overridden value during construction.
- Do not leave final live layers unannotated when they are intended to have all
  requirements already provided.

## Verification

Run:

```sh
pnpm run typecheck
pnpm run lint
pnpm run test
```

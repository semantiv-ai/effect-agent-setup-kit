# Effect Module Selection Pattern

Use this before adding a new utility dependency or hand-rolling platform,
concurrency, retry, time, state, queue, telemetry, or API plumbing.

## Files Inspected

- `.repos/effect-smol/LLMS.md`
- `.repos/effect-smol/ai-docs/src/06_schedule/10_schedules.ts`
- `.repos/effect-smol/ai-docs/src/07_datetime/10_creating-and-formatting.ts`
- `.repos/effect-smol/packages/effect/src/Clock.ts`
- `.repos/effect-smol/packages/effect/src/Data.ts`
- `.repos/effect-smol/packages/effect/src/DateTime.ts`
- `.repos/effect-smol/packages/effect/src/Duration.ts`
- `.repos/effect-smol/packages/effect/src/ExecutionPlan.ts`
- `.repos/effect-smol/packages/effect/src/FiberMap.ts`
- `.repos/effect-smol/packages/effect/src/FiberSet.ts`
- `.repos/effect-smol/packages/effect/src/Match.ts`
- `.repos/effect-smol/packages/effect/src/Metric.ts`
- `.repos/effect-smol/packages/effect/src/Option.ts`
- `.repos/effect-smol/packages/effect/src/Pool.ts`
- `.repos/effect-smol/packages/effect/src/Redacted.ts`
- `.repos/effect-smol/packages/effect/src/Schedule.ts`
- `.repos/effect-smol/packages/effect/src/testing/TestClock.ts`
- `.repos/effect-smol/packages/effect/test/ExecutionPlan.test.ts`
- `.repos/effect-smol/packages/effect/test/Redacted.test.ts`

## Recommended Pattern

Before introducing another library, ask whether Effect already models the
problem with better typed guarantees and better tests.

Use this lookup:

| Need | Prefer |
| --- | --- |
| retry, polling, backoff, jitter | `Schedule`, `Effect.retry`, `Effect.repeat` |
| provider fallback / multi-step fallback | `ExecutionPlan` |
| timeout / interruption / cancellation | fibers, `Effect.timeout`, `Fiber`, `FiberMap`, `FiberSet` |
| spans and operation timing | `Effect.withSpan`, `Effect.fn`, `Metric` |
| deterministic current time | `Clock`, `DateTime.now`, `TestClock` |
| time units and arithmetic | `Duration`, `DateTime` |
| typed config and env sources | `Config`, `ConfigProvider` |
| secrets in logs/config | `Redacted` |
| nominal entity IDs | `effect/Schema` brands |
| optional values | `Option` |
| tagged branching | `Match` or `Effect.catchTag` / `catchTags` |
| value equality / hashing | `Data`, `Equal`, `Hash` |
| resource pools | `Pool` |
| queues and typed producer/consumer failure | Effect queues, mailboxes, streams |
| API boundaries | `HttpApi`, `Rpc`, `Schema` |
| worker/socket transports | `Rpc`, `RpcWorker`, platform worker/socket layers |

The goal is not to ban external libraries. The goal is to choose the strongest
model first, then add outside libraries only when Effect does not cover the
domain or the outside library is the product requirement.

## Source And Test Precedence

For any third-party or unstable Effect API:

1. Prefer local source and tests.
2. Use local patterns for repo-specific decisions.
3. Use docs only when source/tests do not answer the question.
4. Use `node_modules` as a fallback when source is not cloned.
5. If the dependency is central and open source, shallow-clone it under `.repos/`
   or document how to bootstrap it.

Skills and pattern files should not restate APIs that an agent can discover from
source. They should capture project decisions, traps, examples, and things to
avoid.

## Things To Avoid

- Adding `date-fns` or `luxon` before checking `DateTime` and `Duration`.
- Adding retry utilities before checking `Schedule`.
- Adding `ts-pattern` before checking `Match` and tagged errors.
- Adding `neverthrow`-style result plumbing where `Effect<A, E, R>` is the
  stronger model.
- Adding a provider-fallback abstraction before checking `ExecutionPlan`.
- Adding ad hoc secret wrappers before checking `Redacted`.
- Adding raw abort-controller plumbing where fiber interruption or
  `Effect.timeout` expresses the lifecycle.

## Verification

When a new module choice affects code, record the source files inspected in the
feature pattern or plan, then run:

```sh
pnpm run typecheck
pnpm run lint
pnpm run test
```

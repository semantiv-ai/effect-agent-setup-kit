# Effect Agent Project

This project was generated from the Effect Agent Setup Kit.

The setup-kit script already scaffolded this project, installed dependencies,
cloned `.repos/effect-smol`, patched TypeScript, copied the standalone verifier,
and ran `pnpm run setup:test`. The optional setup-kit skill is useful for
maintaining this project, but this generated project does not need the setup-kit
checkout at runtime.

## Agent Workflow

Before non-trivial Effect work:

1. Read `AGENTS.md`.
2. Read `.repos/effect-smol/LLMS.md` when present.
3. Read `patterns/effect-skill-index.md`.
4. Open the smallest relevant copied skill under
   `docs/reference/effect-ai-chat-example/knowledge/skills/`.
5. Keep `.repos/` and `docs/reference/` as read-only reference material unless a
   task explicitly asks to adapt something into project code or checks.

## Verification

```sh
pnpm run setup:test
pnpm run check
```

`setup:test` writes `SETUP-RECEIPT.md` after all setup checks pass. Treat that
file as the local receipt that this project is ready for Effect agent coding.

## Reference Sources

This generated setup includes or applies ideas from:

- Lucas Barake's
  [`effect-ai-chat-example`](https://github.com/lucas-barake/effect-ai-chat-example)
  and [YouTube channel](https://www.youtube.com/@lucas-barake), especially the
  copied `knowledge/skills`, `knowledge/rules`, and `scripts/oxlint-rules`
  reference material under `docs/reference/effect-ai-chat-example/`.
- Michael Arnaldi's AI Engineer workshop
  [Vibe Engineering Effect Apps](https://www.youtube.com/watch?v=Wmp2Tku2PrI)
  and [`@MichaelArnaldi` on X](https://x.com/MichaelArnaldi), which informed
  the "clone the repo, extract patterns from source" workflow.
- Maxwell Brown's Effect article
  [The One Weird Git Trick That Makes Coding Agents More Effect-ive](https://effect.website/blog/the-one-weird-git-trick-that-makes-coding-agents-more-effect-ive/),
  and [`@imax153` on X](https://x.com/imax153),
  which argues for putting dependency source where agents can inspect it and
  documenting that boundary in agent instructions.

This project applies that local-source principle by keeping `effect-smol` under
`.repos/effect-smol` as read-only reference source. It uses a setup-time clone,
not a git subtree.

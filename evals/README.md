# Workshop anti-sycophancy evals

These six planted-flaw fixtures call the real Workshop prompt and `gpt-5.6`
through `lib/workshop.ts`. There are no mocks. The same helper is intended for
the Milestone 2 Workshop route, so this harness evaluates the production model
path rather than a parallel implementation.

## Run

Set `OPENAI_API_KEY`, then run:

```bash
npx tsx evals/run-workshop.ts
```

Each fixture prints green on success and red on failure. A failing eval blocks
any change to the Workshop prompt, model, or route until the behavior is fixed
and the eval passes again.

The runner asserts that every first response is valid Workshop JSON, does not
open with a banned acknowledgment or praise phrase, and includes a non-empty
`mirror_anchor` with meaningful token overlap with the fixture Mirror.

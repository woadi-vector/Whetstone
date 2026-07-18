# Whetstone

**An honest thinking partner.** Whetstone interviews you, reflects back who you
are in a Mirror anchored to your own words — and then pushes back on your ideas
without flattery.

Live app: **https://whetstone-l42nful5m-whetstone2.vercel.app** *(replace with
final URL if changed)*
Track: **Apps for Your Life** · OpenAI Build Week 2026
Built with **Codex** and **GPT-5.6**. Codex `/feedback` Session ID: *(in
submission form)*

---

## Why this exists

Every AI tells you your idea is great. That's useless.

I already use AI the way Whetstone works — interviewing myself, demanding the
honest read instead of the agreeable one, hunting for the pattern I didn't
name. Most people don't have that habit and wouldn't know how to prompt their
way into it. Whetstone hands them the habit with the hard parts pre-built.

The core engineering problem is **anti-sycophancy**: making GPT-5.6 challenge
assumptions, cite the user's own stated values back at them, and concede when
the user is genuinely right — instead of defaulting to praise. Sycophancy is
the most-cited behavioral weakness of large language models. This build treats
suppressing it as the product.

## What it does

1. **Discovery** — a warm interview, one question at a time. It opens with a
   mood check (your own words, never a picklist), acknowledges the mood, then
   follows your energy: concrete stories over abstractions, at most two
   follow-ups per thread, hard-capped before it can wander.
2. **The Mirror** — the payoff. A letter, in serif on a cream card, that names
   where your energy spiked and where it went flat, quotes your own words, and
   surfaces one pattern you didn't name. No praise adjectives — the system
   prompt bans them. Saved with a mood stamp ("Mirror captured while restless,
   July 16") so Mirrors can be compared across moods over time in the Archive.
3. **The Workshop** — bring a raw idea. The first response opens with a
   challenge, never a compliment, and every piece of pushback carries a visible
   citation to your own Mirror — you can't get defensive against yourself. It
   concedes when your answer genuinely resolves the concern, and after ~4
   exchanges it closes with a two-sentence "what I heard."

## The anti-sycophancy engineering (and how to verify it)

- **Prompts are product IP, versioned as code** in [`/prompts`](./prompts) —
  loaded at runtime, never inlined. The hard rules: banned praise vocabulary,
  every observation anchored to something the user actually said, challenge
  assumptions never the vision, get to the challenge in the first sentence.
- **A planted-flaw eval harness** in [`/evals`](./evals) sends six test ideas —
  each containing one deliberate unstated assumption (free distribution,
  scope-tripling, "everyone will want this", trust assumptions, marketplace
  cold-start, hidden manual work) — through the **production** workshop
  handler and asserts, for every first response: no praise openers, a
  non-empty Mirror citation, valid JSON. **A failing eval blocks any prompt,
  model, or route change.**

```
export OPENAI_API_KEY="sk-..."
npx tsx evals/run-workshop.ts
# Expected: PASS: 6/6 workshop evals passed.
```

- **Determinism where prompts aren't enough.** The mood→interview pivot, the
  interview length cap, and the workshop exchange cap are enforced in code,
  not hoped for in prompts. Early testing showed why: given only a prompt, the
  model turned a "slept terribly" mood answer into five turns of
  medical-adjacent probing. The fix was structural — the app pivots; the model
  can't wander.

## How Codex and GPT-5.6 were used

**GPT-5.6 is not integrated into this product — it is the subject of it.**
Every model call is GPT-5.6 in JSON mode (discovery interviewer + Mirror
generation, and the workshop catalyst), and the entire build is an exercise in
getting OpenAI's newest model to overcome its models' most-cited weakness. The
eval harness exists to prove it holds.

**Codex wrote effectively all of the application code**, working from a locked
spec. The workflow:

1. Day 1 committed **zero code**: a build spec (`WHETSTONE_DAY1_SPEC.md`),
   machine-readable guardrails (`AGENTS.md` — scope limits, schema ceiling,
   banned features, error-handling rules), and the system prompts. Codex built
   against that target for the rest of the week.
2. Codex had no local runtime — every change was verified through the deploy
   pipeline. The commit history and Vercel deployment log are the honest
   record: **25+ deployments on Day 1 alone**, including eight consecutive
   failures to first green.
3. Key decisions visible in the history: authentication went through three
   iterations in one evening (Supabase magic-link PKCE → token-hash → OTP
   codes → replaced wholesale with Clerk) once real-world testing exposed
   cross-browser failure modes; a TypeScript 7 / Next.js incompatibility
   producing a *misleading* error was diagnosed by Codex and pinned; the
   mood-pivot and cap behaviors were moved from prompt-space to code after
   live sessions exposed drift.
4. The speed/quality delta is the story: **v1 of Whetstone took weeks on a
   no-code platform, with no tests, no evals, no real auth, and a 4-table
   schema. This rebuild took days with Codex: real auth, persistence, a
   1-table schema, defensive JSON validation, visible error states, and a
   passing anti-sycophancy eval suite — born the same day as the prompt it
   tests.**

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind**, deployed on Vercel
- **Clerk** auth (email verification codes — no passwords, no OAuth, no
  redirect fragility)
- **Supabase Postgres** via **Drizzle** — one application table, `mirrors`
  (RLS enabled; the app talks to Postgres directly server-side)
- **OpenAI API, `gpt-5.6`, JSON mode**, called only from server route
  handlers; responses defensively parsed and schema-validated before anything
  renders; failures surface visibly with retry, never silently
- Workshop state is **ephemeral by design** — the Mirror is the persistent
  artifact
- Design system: warm cream / ink / terracotta `#bf5a3c`, Fraunces +
  Instrument Serif + Hanken Grotesk — a quiet studio, not a dashboard

## Testing it (judges)

1. Open the live URL. Tap **Start**, sign in with any email — a 6-digit code
   arrives; no password, no account setup.
2. Complete a Discovery (about 5 minutes — answer honestly, it's better).
3. Read your Mirror. Note the mood stamp and that every claim traces to
   something you said.
4. Tap **Try a Workshop**, bring a real idea, and watch the first response:
   it will open with a challenge, and the terracotta attribution under it is
   your own Mirror being cited back at you.
5. Optionally, clone the repo and run the eval harness (command above) to
   verify the anti-flattery bar in code.

## Honest provenance (pre-existing project disclosure)

Whetstone v1 shipped in May–July 2026 on a no-code platform (Lovable) and ran
with real beta users. **This repository is a ground-up rebuild started July
14, 2026, inside the submission window — every line of code here is new and
Codex-written.** What carried over from v1 as *design inputs only*: the system
prompt text (extracted verbatim from v1 and extended), user-tested UI copy,
the design tokens, and the user evidence that drove the v2 shape (everyone
loved the Mirror; nobody sustained v1's open-ended workshop — so v2's Workshop
is a short, ephemeral catalyst instead). The commit history, deployment log,
and Codex session provide the timestamped boundary.

## What's next (post-submission roadmap)

- A live idea canvas that fills in as a Workshop runs (returning from v1,
  where it existed but competed with the conversation for attention)
- Mirror-over-time: explicit comparison views across moods and months
- Optional gentle email nudge for a fresh Mirror (Archive-only retention is
  the deliberate v2 default)
- Local development setup (currently the app is developed spec-first through
  the deploy pipeline; schema changes are applied via the Supabase SQL editor
  — see `/evals/README` for the one runnable-anywhere component)

---

*Built solo by Jason Wold for OpenAI Build Week, July 2026.*

## Development

### Database schema

Schema changes are applied by pasting the relevant Drizzle migration SQL into the Supabase SQL Editor. Vercel builds do not run database migrations.

# AGENTS.md — Whetstone Build Rules for Codex

Read `WHETSTONE_DAY1_SPEC.md` before any work. That spec is the target. This file
is the standing rules that apply to every session and every change.

## Scope discipline (highest priority)

- The product is THREE screens: Discovery, Mirror, Archive — plus the Workshop
  flow entered from the Mirror screen. Nothing else.
- The app schema is ONE table: `mirrors`, referencing the auth provider's user
  id. The auth provider's internal schema does not count against this rule, but
  do not create app tables beyond `mirrors`. Workshop state is ephemeral
  (client memory or a transient server session) and is never persisted.
- Out of scope, permanently for this build: the bio/paste shortcut (the
  interview is the only door — the Mirror must be earned from interview
  evidence), Idea Canvas, open-ended chat mode, sharing, collaboration,
  notifications, email nudges, payments, profile settings, OAuth providers,
  admin panels, analytics dashboards, per-claim source citations stored in
  Mirror cards (deferred stretch goal — do not build unless explicitly
  instructed).
- If a task seems to require new scope, STOP and ask. Do not build speculative
  features, "nice to haves," or infrastructure for future features.

## Stack (locked)

- Next.js (App Router) + TypeScript + Tailwind. Deploy target: Vercel.
- Postgres + Drizzle for the app table. Auth is MANAGED (Supabase Auth,
  magic-link email mode). Never hand-roll auth crypto, token signing, or
  session cookies.
- OpenAI API, model `gpt-5.6`, called ONLY from server route handlers. Never
  expose the API key or call the model from the client.
- Two model routes: discovery turn (which also produces the Mirror on its
  reflecting phase) and workshop turn.
- Model responses are JSON-mode. Do NOT stream partial JSON to the client.
  The server awaits the full response, parses defensively (strip fences,
  slice outer braces, typed error on failure), validates the shape, then
  returns the complete typed result. The UI shows a warm thinking state
  while waiting. A validation failure triggers a gentle retry, never a
  render of partial data.

## Prompts are product IP

- All system prompts live in `/prompts` as versioned standalone files, loaded at
  runtime. Never inline prompt text in handlers or components.
- Never edit prompt files as a side effect of another task. Prompt changes are
  their own explicit, reviewed changes.
- The anti-flattery rules inside the prompts are the product. Do not soften,
  summarize, or "improve" them.

## Anti-sycophancy quality bar

- The Workshop's first response must never open with acknowledgment or praise
  and must cite at least one specific element from the user's Mirror.
- `/evals` contains a small planted-flaw test harness that submits fixed test
  ideas to the workshop route and asserts: (a) no praise-openers in the first
  response, (b) an explicit Mirror citation is present. Run it after any change
  to prompts, model parameters, or the workshop route. A failing eval blocks
  the change.

## Working style

- Small, frequent, descriptive commits. Commit history is submission evidence —
  every commit must be timestamped within the hackathon window (July 13–21).
- Do not add dependencies without stating why; prefer the platform and stdlib.
- No placeholder/lorem screens shipped as "done." A screen is done when it works
  against the real backend with real model output.
- Mobile-first layouts; the judges may open this on anything.
- Errors surface visibly in the UI (a quiet inline notice), never silent
  failures. This was a v1 bug class — do not reintroduce it.

## Honesty constraints

- README must plainly state: Whetstone v1 existed on a no-code platform; this
  repo is a ground-up rebuild started July 13, 2026; prior prompts and design
  decisions were carried over as design inputs only. Judges are evaluated on
  work inside the window — make the boundary unambiguous.
- Never fabricate demo data that implies real users or real usage this build
  does not have.

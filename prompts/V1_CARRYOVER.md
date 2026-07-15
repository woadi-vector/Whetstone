# V1 Carryover — Design Tokens, Tested Copy, QA Checklist

Reference material extracted from Whetstone v1 (Lovable build, May-July 2026).
These are design INPUTS for the rebuild, not code to port.

## Design tokens (keep — this is the product's face)

- Palette: warm cream background, soft ink text, terracotta accent
  #bf5a3c (v1 also expressed as oklch(0.58 0.13 40))
- Type: Fraunces (display serif, AI prose and headlines), Instrument Serif
  (body serif), Hanken Grotesk (UI sans)
- Feel: quiet studio, editorial, generous whitespace — never a dashboard
- The Mirror letter card: cream card, terracotta LEFT accent border, large
  decorative opening quotation mark, Fraunces, larger/warmer than body text
- Mirror cards at rest: label + small italic hint line + items as a clean list
  with a small clay dot before each. Edit link per card toggles inline inputs.
  Never render resting state as textareas/forms.
- Staggered fade-in on Mirror load ("mirror-rise")
- Mirror page heading: "This is what I'm hearing in you" with editable prompt
  "tap anything that doesn't ring true"
- New in v2: the mood stamp on the Mirror, e.g. "Mirror captured while wired,
  July 15" — quiet tag near the letter, same design language

## Landing page copy (user-tested on real people — carry over verbatim)

- Hero: "Anyone can change the world. One idea at a time."
- Plain explainer, big and friendly, right under hero: "Think of it as a
  personalized madlib that teaches you something about yourself."
- What it does (one line, must NOT sound like an idea generator): "A short
  conversation that reflects back where your creativity lives — then helps
  you shape an idea that's truly yours."
- Trust line near the start button: "Free. Private to you. No email list,
  no catch." Note that sign-in exists only so results save to you.
- One primary button: "Start" or "Try it — 5 minutes."
- Page must read in under 10 seconds. Calm, no clutter.

## Model-layer notes from v1

- v1 ran temperature 0.8, max ~1200 tokens, JSON response format enforced.
  0.8 was chosen for interview warmth; drop toward 0.6 if structured fields
  come back loose. Re-tune for gpt-5.6 — do not assume carryover.
- Prompts were last validated on gemini-2.0-flash (before that, Azure gpt-4o).
  gpt-5.6 validation is open work, Day 1-2.
- Defensive parse (strip fences, slice first "{" to last "}", parse, return
  a typed error on failure so the UI retries gently) proved necessary on two
  different model providers. Keep it.

## QA checklist (every item below is a real v1 bug — test on Day 2, not Day 7)

Auth:
- [ ] Sign-up with an email that already exists: routes to sign-in with a
      clear message, never a silent bounce
- [ ] Logged-in user refreshes: lands back in the app, no flash of the
      sign-in screen
- [ ] Logged-out user hits a protected route: straight to sign-in, no flash
      of the wrong screen
- [ ] Session restoration is event-driven (auth-state listener), never
      polling with arbitrary timeouts
- [ ] Magic-link email actually arrives and the link works from a phone

Flow:
- [ ] The full reflection appears ONLY on the Mirror page; chat shows only
      the short hand-off (schema enforces this — verify UI doesn't undo it)
- [ ] Model upstream errors (429/5xx) show a gentle inline "give me a
      second" retry, never a hard fail or silent dead-end
- [ ] Malformed model JSON triggers retry, never a crash

Rendering:
- [ ] Global CSS loads on every route (v1: a misplaced @import silently
      killed the entire stylesheet and shipped a blank page)
- [ ] Mobile: full Discovery -> Mirror -> Workshop pass on a phone

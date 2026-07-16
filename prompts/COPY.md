# COPY.md — Whetstone v1 Copy Vault

Verbatim strings from Whetstone v1, organized by screen. These words were
user-tested and/or shipped. Codex: use these strings as written when building
each screen. Do not paraphrase, "improve," or regenerate them. Where v2
differs from v1, the notes say so.

---

## Landing page

Hero (two lines, stacked):
> Anyone can change the world.
> One idea at a time.

Plain explainer (big and friendly, directly under hero — this is the line
that makes people get it):
> Think of it as a personalized madlib that teaches you something about yourself.

What it does (one line — must never sound like an idea generator):
> A short conversation that reflects back where your creativity lives — then helps you shape an idea that's truly yours.

Trust lines (small, near the sign-in):
> Free. Private to you. No email list, no catch.
> Sign in just so your results save to you.

Auth affordances — v2 CHANGE: v1 showed "Continue with Google" — do NOT carry
that over. v2 is Clerk email-code only. Keep:
> Sign in
> New here? Create an account

## Navigation

Items, in order: `Whetstone` (wordmark/home) · `Discover` · `Workshop` ·
`Mirror` · `Sign out`

## Discovery screen

Stage label: `Stage 1 · Discovery`

Heading:
> Where does your creativity live?

Subhead:
> A short, easy conversation. No right answers. After a few exchanges I'll reflect what I'm hearing back to you.

AI's opening message (v1 verbatim — in v2 this comes AFTER the mood check;
see note below):
> Hi — I'm so glad you're here. Before we go anywhere, I'd love to get to know you a little. There's no wrong answer to any of this. What's something you can lose track of time doing — even if it feels small or silly?

v2 NOTE — mood check comes first. Suggested mood opener, same voice (new
copy, not v1):
> Hi — I'm so glad you're here. Before we start: how are you feeling right now, honestly? Wired, calm, stuck, restless, quiet — whatever it actually is, in your own words.
Then the v1 opening question follows as the second AI message.

Hand-off at the end of discovery (chat shows ONLY this — never the full
reflection):
> I think I've got a real sense of you now — I've put the full picture together in your Mirror. Take a look.

Completion state under the chat:
> I think I see you.
> Your Mirror is saved. Head to Workshop to develop something — or revisit your Mirror.

Completion buttons: `Start a project` · `See my Mirror` · `Start over`
(v2: "Start a project" → `Try a Workshop`, per spec.)

Input placeholder:
> Say what's on your mind…
Send hint: `⌘/Ctrl + Enter to send`

## Mirror screen

Page label: `Mirror`

Heading:
> This is what I'm hearing in you

Sub-instruction:
> Tap anything that doesn't ring true.

Card labels + italic hint lines (verbatim, in this order):
- **Themes** — *The shapes that keep showing up in your attention*
- **Strengths** — *What comes easily to you that others find hard*
- **Interests** — *What you reach for in your free time*
- **Obsessions** — *Things you can't stop noticing or thinking about*
- **Working style** — *How you tend to make things*

Footer utility: `Display name & reset`

v2 ADDITION — the mood stamp (new, quiet tag near the letter):
> Mirror captured while {mood}, {date}.

## Workshop

Nav label: `Workshop`

Page heading: `Your Workshop`
Subhead:
> Bring something raw. We'll make it concrete together.

v2 entry point (button on the Mirror screen): `Try a Workshop`
v2 entry framing (per spec):
> Bring a rough idea or a decision you're wrestling with. This is a thinking partner that pushes back — not a coach, not a cheerleader.

(v1's Project Canvas — "Fills in as we talk." — is CUT in v2. Do not
resurrect the canvas or its field labels.)

## Error / fallback copy

Model-unreachable, mid-conversation (v1 pattern, corrected):
> I'm having trouble reaching the model — your answer is saved. Give me a moment and try again.

HARD RULE (v1 bug, do not repeat): fallback messages must NEVER include a
canned follow-up question or reference specifics the user did not say. In v1
the fallback asked about "the electronics, the code, the physical design" —
fabricated context. Fallbacks acknowledge, save, and invite retry. Nothing else.

Generic model retry (from Milestone 1, keep):
> I couldn't form a complete response just then. Please try again.

---

## Tone reference — the Mirror letter

A shipped v1 letter, kept as the quality bar for the reflection. Note what it
does: names where energy spiked AND where it went flat, quotes the user's own
material, zero praise adjectives, one unnamed pattern surfaced. This is not a
template to copy — it is the standard to match.

> When you talk about turning a Hackathon project into a liquid workforce
> platform by connecting it with your AI, your energy spikes. What stands out
> is your drive to repurpose and scale what you've already built into
> something bigger. You didn't just solve one problem; you looked at what
> you'd made and saw untapped potential in it. Your creativity seems to
> thrive in taking an initial solution and layering on complexity —
> especially when those layers bring systems together in unexpected ways. On
> the other hand, you seemed pretty flat earlier when talking about gaming,
> even though you mentioned it as something you do often. It feels like the
> act of making and connecting systems is where your creativity actually
> lives.

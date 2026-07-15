# Whetstone — Day-1 Build Spec (Codex Target)

**Context:** Rebuild target for OpenAI Build Week (submissions July 13–21, 2026). This is a rebuild spec, not a design doc. Whetstone v1 shipped on Lovable + Lovable Cloud + Azure gpt-4o and ran with real beta users. This spec reflects what those users showed us — everyone loved the Mirror; nobody sustained use of the Workshop — combined with the strategic reality that the Workshop's anti-sycophancy behavior is the differentiator that plays best against OpenAI's known model weaknesses. Both stay in Day-1. Both are ruthlessly scoped.

**Success on Day 8 is not a prize.** Success is a working public product at a real domain where a stranger can register with email, complete a full Mirror capture in under 6 minutes, and see it saved in their Archive with a mood tag. The submission is downstream of that. The launch is the point.

**Product thesis (one sentence):** A thinking partner you can chat with — different from a friend, different from an AI — that reflects who you are honestly, changes with your mood, and pushes back on your ideas without flattery.

---

## Legend

- **LOCKED** — decided July 10, 2026. Do not reopen without explicit instruction.
- ⚠ **FLOATING** — unresolved. Must be closed before the go/no-go call.

---

## 1. Product surface — three screens, no more (LOCKED)

### Screen 1: The Discovery
The conversation. Warm, single-column, chat-shaped.

- Opens with the **mood check**: "Before we start — how are you feeling right now, honestly? Wired, calm, stuck, restless, quiet, something else?" Free text. **User's own words, never a normalized picklist bucket** (LOCKED — anchoring to what people actually say is the soul of the product). The mood becomes context for the entire session and the resulting Mirror.
- Interviewer asks 5–7 questions, one at a time, following energy (heat-following prompt), pushing past abstractions to concrete stories (anti-flattery prompt).
- Ends with a warm hand-off ("I've put the picture together in your Mirror") — **no full reflection in chat**. This fixes the v1 duplication bug where the reflection appeared in both the chat and the Mirror.

### Screen 2: The Mirror
The reveal. This is the payoff screen. It is the product.

- Letter format at the top: serif prose, clay left border, quotation mark.
- Below it: quiet editable cards for themes / strengths / interests / obsessions / working style.
- **Mood is stamped on the Mirror** — visible tag, e.g. *"Mirror captured while wired, July 15."*
- Entry point to Workshop lives here (see §2).

### Screen 3: The Archive
Every Mirror the user has ever captured, with mood + date. Users can revisit any past Mirror. Comparing them over time is the *implicit* repeat-visit hook — no nag. The archive itself is the retention mechanism.

⚠ **FLOATING — retention supplement:** Archive-only (elegant, passive) vs. an emailed nudge ("It's been three weeks — try a new Mirror"). This question was posed July 10 and never answered. Day-1 default if unresolved: **Archive only, no email.** Email is post-submission scope.

### Explicitly OUT of Day-1 (LOCKED)
- No Idea Canvas. (v1's Canvas is cut. The Workshop closes with a "what I heard" summary instead. The Canvas was named the scope-creep risk component; it does not come back in a rushed rebuild.)
- No open-ended chat mode.
- No sharing, no collaboration.
- No notifications (pending the floating retention decision — default no).
- No payment/Stripe.

---

## 2. The Workshop — Build Week shape (LOCKED, revised from v1)

**Purpose in this build:** demonstrate anti-sycophancy in production, anchored to the user's own Mirror. Not the exploratory ideation tool v1 was. Real users didn't return to v1's Workshop — high activation energy. This version must survive being tried once by a stranger (a judge) in under 3 minutes.

**Entry:** from the Mirror screen, one button: *"Try a Workshop."* Framed as a demonstration, not a commitment. Copy direction: *"Bring a rough idea or a decision you're wrestling with. This is a thinking partner that pushes back — not a coach, not a cheerleader."*

**Structure — ruthlessly short:**
1. User pastes/types a raw idea or move. One text box, one submit.
2. AI responds with **one grounded challenge** — anchored explicitly to at least one line from the user's Mirror, citing what it draws on. The anti-sycophancy behavior is front and center: first response, not turn 8.
3. User can reply. AI responds, maintaining pushback — or acknowledging if the user's rebuttal genuinely resolves the concern (this is the honesty half: it must be able to concede when the user is right, or the pushback is just a different flavor of theater).
4. **Session caps at ~4 exchanges.** Then the AI writes a 2–3 sentence "what I heard" close reflecting the tension surfaced. Not a canvas. Just a close.

**The Workshop is ephemeral in Day-1.** Not saved as an artifact. The Mirror is the persistent artifact.

**Design principle:** catalyst, not conflict. Challenge ASSUMPTIONS, never the user's vision. Ground every challenge in the user's OWN stated values from their Mirror — they can't get defensive against themselves.

---

## 3. The AI — system prompts

Three prompts. These are the product's core IP; everything else is scaffolding.

### 3a. Discovery interviewer
⚠ **FLOATING — exact text lives in the v1 Lovable repo (GitHub-synced edge functions). Extract verbatim before build start.** Known required behaviors (LOCKED):
- Anti-flattery: no generic praise, no horoscope observations; every observation anchored to specific concrete things the user actually said.
- One question at a time; follow energy/heat; push past abstractions to concrete stories.
- Mood integration (new in this build): *"The user has told you their current mood at the top of the conversation. Let that shape your questions and your listening — a wired user needs different questions than a calm one. Do not name the mood back at them; just work with it."*

### 3b. Mirror generator
⚠ **FLOATING — exact v1 text: extract from Lovable repo.** Known required behaviors (LOCKED):
- Letter-format reflection + structured cards (themes, strengths, interests, obsessions, working style).
- Anchor every claim to something the user said.
- Mood weighting (new in this build): *"The user's mood at the time of this conversation was: [MOOD]. Weight the reflection accordingly — a stressed user's Mirror should not read the same as their calm-day Mirror."*

### 3c. Workshop catalyst (LOCKED — full text recovered)

```
You are Whetstone in Workshop mode. The user has brought you a raw idea or
decision. You are given their Mirror.

HARD RULES for your very first response:
- Do NOT open with acknowledgment or praise ("Interesting," "I love,"
  "That's a strong start").
- Get to the challenge in the first sentence.
- Name one specific tension, unstated assumption, or scope risk in what
  they said.
- Anchor your challenge to at least one specific element from their Mirror
  (quote or reference it explicitly).

For subsequent turns:
- Challenge assumptions, never the user's vision.
- Keep grounding challenges in the user's OWN stated values from their
  Mirror — they can't get defensive against themselves.
- Warm and conversational; a sharp friend thinking with them, not an
  interrogation.
- After ~4 exchanges, write a 2–3 sentence "what I heard" close.

Return valid JSON in the agreed format each turn.
```

---

## 4. Auth and persistence (LOCKED — yes, minimal)

Correcting a drift in a later planning note that said "auth/persistence: no": the Archive **requires** both. The success criterion (stranger registers → Mirror saved → visible in Archive with mood tag) is not achievable without them.

- **Auth:** email magic link only. No passwords, no OAuth providers, no profile settings. Registration is one field.
- **Persistence:** Mirrors only. Workshops are ephemeral. Discovery transcripts are stored only as the raw material inside the Mirror record (needed for anchoring/citations), never surfaced as a browsable chat history.

## 5. Data model (LOCKED — minimum)

Two tables. **Codex: do not propose more.** Additional tables belong to features that are out of Day-1 scope.

```
users
  id            uuid pk
  email         text unique
  created_at    timestamptz

mirrors
  id            uuid pk
  user_id       uuid fk -> users
  mood_raw      text            -- user's own words, verbatim
  transcript    jsonb           -- discovery Q/A pairs (source material for anchoring)
  letter        text            -- the serif letter reflection
  cards         jsonb           -- themes/strengths/interests/obsessions/working style
  created_at    timestamptz
```

(Workshop state lives in client memory / a transient server session. If a table is ever proposed for it, the answer is no in Day-1.)

---

## 6. Stack (⚠ FLOATING — decision pending; see migration discussion)

- v1: Lovable + Lovable Cloud (Supabase), Azure OpenAI gpt-4o via secrets-based edge-function proxy (Foundry project "idea-forge").
- Build Week candidate: plain Next.js/TypeScript repo so Codex writes and owns the code, OpenAI API direct (GPT-5.6) instead of the Azure proxy. Rationale: "built with Codex" is a hard requirement; a plainer repo makes the Codex development story visible; using OpenAI's own current model to fight OpenAI-model sycophancy is the sharper narrative.
- ⚠ Confirm at the July 13 livestream what "built with Codex" is judged to mean before locking.

## 7. Model backend (⚠ FLOATING)

Azure gpt-4o (existing, known behavior, prompts tuned against it) vs. OpenAI API GPT-5.6 (Build Week story alignment; unknown prompt behavior — the anti-flattery prompts were tuned against gpt-4o and MUST be re-validated against whatever model ships). If GPT-5.6: budget explicit prompt-tuning time in the 8 days; the anti-flattery quality bar is the whole submission. A rushed rebuild that ships flattery is worse than not submitting.

## 8. Known open items checklist (close before go/no-go)

1. ⚠ Retention: Archive-only vs. email nudge (default: Archive-only).
2. ⚠ Extract exact Discovery + Mirror prompts from the v1 Lovable GitHub repo.
3. ⚠ Extract v1 design tokens/copy worth keeping (clay color, serif letter treatment, hand-off copy).
4. ⚠ Stack + model decision (after July 13 livestream).
5. ⚠ Domain: does the Whetstone domain exist / need purchase? Spec requires "a real domain."
6. ⚠ Validation honesty: this spec is built on strong hunch, not confirmed user signal, per the July 10 discussion. Acceptable for a submission; hold it clearly.
7. Two dates to hold: July 13 10am PDT livestream (go/no-go input), July 14 11am PDT Steinberger session (judge's lens).

## 9. What this build is and is not (hold this)

This is a **submission**, not a launch of "what users taught us should exist." Users taught us: Mirror yes, Workshop no. The Workshop stays because it carries the anti-sycophancy demonstration that plays against OpenAI's known model weakness — an optimization for judges, made knowingly. The product truth (Mirror-first, mood-driven repeat visits) and the submission shape (Workshop as a 3-minute provable demo) are both real; don't let them blur.

# scenes.chat — build spec (v2)

> **v2 supersedes v1.** v1 described a room-and-feed product: browse channels, post voice, thread replies. Research on the middle-ring graveyard says that shape is the one that killed Path, Google+, Amino and Geneva. v2 is a **formation engine**. If you have v1, discard it.

**One line:** scenes.chat repeatedly forms small groups of strangers who should know each other, gives them a ritual that makes them close fast, and then gets out of the way while they talk asynchronously by voice.

**Domain:** scenes.chat ($9.99/yr, Vercel) — not yet purchased.

**On the name:** a *scene* is the product's unit. Kevin Kelly, via Brian Eno: scenius is "the intelligence and intuition of a whole cultural scene," and its first condition is **mutual appreciation** — risk-taking applauded, the best of peer pressure. Visakan sizes one at two obsessives to seed and ~two dozen to be healthy. The engine's job is to make many of them. Internally the data model still calls a formed group a **cohort**; "scene" is what users call it.

---

## 1. The thesis, in four claims

1. **The gap is real and unserved.** The market has split into private groups you already have (Yope, ~15M users, zero discovery) and IRL event matching (Timeleft, €18M ARR). Nobody is building the persistent online home for a newly-formed small group.

2. **Discovery is the trap; formation is the way around it.** Routing a stranger *into an existing group* removes a vetting step, dilutes incumbent bonds, and generates moderation debt that scales superlinearly. Assembling a *new* group from matched strangers has no incumbents to dilute and no norms to violate. Every corpse in the graveyard was solving discovery.

3. **Formation is proven; retention of formed groups is not.** Timeleft proves people will pay to be put in a room with strangers. But Timeleft has **no in-app group chat** — its formed groups leak to user-run WhatsApp groups it doesn't own. Pie, having raised $11.5M on matched dinners, **pivoted away from the event thesis into a social network in Aug 2026**. Both are the same signal: *the matched-group primitive doesn't retain without a persistent home.* That home is this product.

4. **Online formation beats IRL formation on the one axis that kills IRL.** Timeleft retreated from 325 cities to 200+ because thin local pools exhaust — people started meeting the same strangers twice. A global pool doesn't have that failure mode. This is scenes.chat's single biggest structural advantage and it should be protected, not traded away for local features.

---

## 2. What this must NOT look like

This list is load-bearing. Every item is something that killed a real company.

| Don't build | Why |
|---|---|
| **A browsable directory of groups** | Amino solved stranger-discovery with a directory of 2.5M micro-communities and produced a thirteen-year child-safety record. Discord deliberately hides small servers — public Discovery indexes ~32k servers behind a 1,000-member gate. A directory is the thing not to build. |
| **A global feed** | The moment there is a feed, attention concentrates on the top 1% of posts (Stanford, 45M comments) and the group becomes a broadcast. This is the actual mechanism by which groups die — not bad content, uneven attention. |
| **Join buttons on existing groups** | Bond-based attachment is damaged by newcomers *by construction* (Ren/Kraut/Kiesler 2007). A join button on a formed group is a dilution button. |
| **Follower counts, like counts, leaderboards** | Reintroduces status games into the one place that works because it has none. Airchat's SF-monoculture problem was partly a status problem. |
| **A member cap as the intimacy mechanism** | Path capped at 50, then 150, then raised it under user pressure and died. It also conflated two different quantities: "relationships one person can maintain" ≠ "size at which group dynamics change." Cap nothing; measure reciprocity instead (§6). |
| **A sophisticated matching algorithm, at first** | Timeleft's algorithm is a constraint solver over ~a dozen fields and it uses **zodiac sign**. Their own help centre concedes that in thin markets they relax matching and rely on the fact that participants are "self-selecting by their desire to make new connections." Self-selection does most of the work. |
| **Anything that requires being in a specific city** | The global pool is the advantage. Don't throw it away. |
| **An algorithm that decides what you see inside a group** | Chronological, everything, always. The group is small enough that it doesn't need ranking, and ranking is how you get uneven attention. |
| **Public profiles** | 222 and Timeleft both market "no profiles, no scrolling, no swiping" — and they're right. Profiles turn formation into selection, and selection turns it into dating. |

---

## 3. The core loop

```
        ┌──────────────────────────────────────────┐
        │  1. SIGNAL      short intake, no profile │
        │  2. WAIT        until the next forming   │
        │  3. REVEAL      staged, anonymized       │
        │  4. FORM        live, scripted, ~45 min  │
        │  5. LIVE        async voice, chronological│
        │  6. FORK        thrive → spawn           │
        │                 fade  → archive, re-form │
        └──────────────────────────────────────────┘
```

Every user is always in exactly one of two states: **in a cohort**, or **waiting for the next forming**. There is no third state, no lobby, no browse.

---

## 4. Formation, in detail

This is the product. Everything else is plumbing.

### 4.1 The ritual
**One forming per week, same time, every week.** Timeleft's whole business is Wednesday — the founder's own framing is that *the dinner format itself is the technology*, not the algorithm. Pick a slot and never move it. The ritual is the retention mechanic; a subscription sold against habit outperforms one sold against outcomes.

Because the pool is global, run **two or three slots** spread across timezones (e.g. 20:00 SGT / 20:00 CET / 20:00 ET) and let people pick. Same day, so the ritual holds.

### 4.2 Intake
Short. Two to three minutes, maximum. Ask only what you'll actually match on:

- What you're deep in right now (free text, one line — this is the highest-signal field)
- Two or three things you'd talk about for an hour unprompted
- Timezone / slot preference
- Language
- What you want: to learn something, to build something, to just have people to talk to

Do **not** ask for a photo, a bio, a job title, or a follower count.

### 4.3 The staged reveal — copy this exactly
Timeleft's best mechanic and it costs nothing:

- **24 hours before:** you receive *anonymized aggregate* data about your cohort. Not names, not handles. "Four of you, two continents, three are building something, one is a nurse, everyone picked 'to learn something.'" This manufactures anticipation and it is the single cheapest engagement feature in the whole product.
- **At forming time:** the room opens. Everyone arrives at once.

### 4.4 The forming session
Live, ~45 minutes, everyone present. This is the **only** synchronous part of the product.

Run **Fast Friends** — Aron's escalating self-disclosure protocol. It is the one intervention in the literature with a clean, replicated causal effect on stranger-to-stranger closeness, and Sprecher's 2021 replication found **no significant difference between video-chat and face-to-face**. Structured disclosure works mediated. Almost nobody in software uses it.

Mechanics:
- 5–6 people. Not 4 (too fragile to a no-show), not 8 (splits into two conversations).
- Three rounds of escalating prompts. Everyone answers each prompt as a voice turn, in order, before the next prompt unlocks.
- Turn caps: 60s in round one, 90s in round two, 120s in round three.
- **The script is not optional.** Timeleft's cards *are* optional and reviewers report tables abandoning them and then either dying of small talk or lurching into over-intimacy. An unfacilitated format has no quality floor. Yours is facilitated by software — use that.
- No host, no moderator, no human required. The script is the host.

### 4.5 Handling no-shows
Timeleft's most common complaint after noise. Three people show instead of six and the evening dies. Mitigations:
- Over-assign: form 7 for a target of 5.
- Require a one-tap confirm in the 24h reveal. Unconfirmed seats get backfilled from the waitlist.
- If fewer than 3 arrive, merge with an adjacent forming room rather than running it.

### 4.6 After the session
The cohort becomes a persistent async voice space. This is where v1's work is still right: record a turn, auto-transcribe, thread replies, chronological, transcript-first, text replies as first-class turns.

**This step is the entire competitive thesis.** Timeleft's groups leak to WhatsApp. Yours don't leak, because you're already the place they landed.

---

## 5. Data model (changes from v1)

Keep v1's `profiles`, `turns`, `reactions`, `listens` tables. Replace `rooms` with:

```sql
create table cohorts (
  id            uuid primary key default gen_random_uuid(),
  formed_at     timestamptz,                       -- null until the session runs
  slot_at       timestamptz not null,              -- the scheduled forming
  parent_id     uuid references cohorts,           -- set when spawned from another cohort
  generation    smallint not null default 0,
  status        text not null default 'forming',   -- forming | live | fading | archived
  name          text,                              -- the cohort names ITSELF, post-formation
  created_at    timestamptz not null default now()
);

create table memberships (
  cohort_id   uuid references cohorts on delete cascade,
  user_id     uuid references profiles on delete cascade,
  joined_at   timestamptz not null default now(),
  left_at     timestamptz,
  primary key (cohort_id, user_id)
);

-- intake answers, kept separate from profile so they can change per re-forming
create table signals (
  user_id     uuid references profiles on delete cascade,
  round       integer not null,          -- increments each time they re-enter the pool
  deep_in     text not null,
  topics      text[] not null,
  slot_pref   text not null,
  lang        text not null,
  wants       text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, round)
);

-- the forming script, versioned so you can A/B the prompts
create table prompts (
  id        uuid primary key default gen_random_uuid(),
  script    text not null,           -- 'fast-friends-v1'
  round     smallint not null,       -- 1 | 2 | 3
  ordinal   smallint not null,
  body      text not null,
  max_ms    integer not null
);
```

`turns.room_id` becomes `turns.cohort_id`. Everything else in v1's turn model carries over unchanged.

---

## 6. The health metric — build this first, not last

Do not measure MAU, member count, or turns posted. Measure **reciprocity**:

```
For a cohort, over a rolling 7 days:
  reciprocity = (ordered pairs (a,b) where a heard a turn from b)
                / (n * (n-1))
```

A group breaks when the probability of repeat interaction drops below what sustains reputation. That depends on posting rate and topic breadth, not headcount — which is why a 200-person Discord can feel anonymous and a 5,000-member niche forum can feel intimate.

Thresholds to start with (tune from data):
- **> 0.7** — healthy, everyone is hearing everyone
- **0.4 – 0.7** — clustering; the cohort is becoming two conversations
- **< 0.4 for two consecutive weeks** — fading; trigger the fork decision (§7)

Ship this number to yourself from day one. It is the only number that tells you whether the product is working.

---

## 7. Growth: spawn, don't admit

A cohort never gains a member. If a cohort is thriving and its people want more, it **spawns**: members each bring one person into a *new* cohort formed from those invitees plus fresh pool members. The parent cohort is untouched.

The precedent is not software. Hutterite colonies have fissioned for a century at a mean size of ~166 into daughter colonies of ~76 and ~91, on a ~14-year interval. 19th-century communes were founded at a geometric mean size of 52. Fission, not accretion, is how bond-based groups grow without dissolving.

This also gives you the highest-yield discovery mechanism with public numbers: **a trusted human vouching, delivered at the moment of joining.** Substack's in-signup-flow recommendations went from ~10% to **40% of all free subscriptions**. Your version is member-initiated spawning, and it grows the network without ever putting a stranger into someone's existing room.

---

## 8. Phase plan

### Phase 0 — Do it by hand. No code. (2–6 weeks)
Timeleft's founder hand-matched people for three months with **Typeform + WhatsApp + Stripe** before writing any code. His first four tables grossed $110. Do the same:

- A form for intake.
- You, in a spreadsheet, matching 5 people.
- A scheduled call on whatever software exists.
- You read the Fast Friends prompts out loud.
- A group chat afterwards on anything.

Run it **six times**. You are testing one thing: *does a scripted 45-minute session between five strangers produce a group that is still talking two weeks later?* If it doesn't, no code fixes it. If it does, you know the script works and you have your first cohorts.

**Do not skip this.** Every expensive failure in the graveyard shipped software before validating the ritual.

### Phase 1 — Web only, formation automated (the real v1)
Intake form, pool, weekly forming, the scripted live session, and the async cohort space. No mobile app, no matching algorithm beyond "same slot, same language, non-overlapping topics." Manual override always available — you should be able to hand-place anyone.

### Phase 2 — The metric and the fork
Reciprocity scoring, fading detection, graceful archive, re-entry into the pool. This is what stops the product becoming a graveyard of silent rooms.

### Phase 3 — Spawning
Member-initiated forks. Only after cohorts have survived long enough to want to.

### Phase 4 — Mobile
Fork `bluesky-social/social-app` per v1 §8. Background playback and lock-screen controls are what make it a commute product. Not before.

---

## 9. Things to decide, honestly

- **Does a cohort ever end deliberately?** A fixed 8-week season with an explicit ending might beat an indefinite room that slowly dies. Cohorts with an end date can be renewed by choice, which is a much better signal than passive decay.
- **What stops it becoming a dating product?** Timeleft has a romantic-interest flag in its post-dinner feedback and one reviewer's table had two of five who'd already dated someone from the app. Timeleft killed an earlier pivot for exactly this reason. Decide deliberately whether you allow it, because it will happen whether you plan for it or not.
- **Paid or free?** Every free entrant in this space failed to monetize (Geneva: six years, $0 revenue, sold for $17.5M). Timeleft charges $16/dinner or ~$20/mo and is at €18M ARR on $7M raised. A small fee is also a quality filter and a no-show deterrent. Strongly consider charging from day one.
- **Safety.** You are putting strangers in a voice room together. Before Phase 1 ships: report/block at the turn and member level, a hard rule that a reported cohort is reviewed before it continues, and no minors. Amino is the cautionary tale and its harms came from exactly this surface.

---

## 10. Reference

**Research this spec is built on:** Ren/Kraut/Kiesler on identity vs bond attachment (2007) · Stanford HCI on attention concentration after growth · Dunbar & Sosis on community fission sizes · Sprecher (2021) on Fast Friends over video · Google Project Aristotle on psychological safety (median team size: 9) · Timeleft operational research · Discord's Discovery gate · Substack recommendation conversion data.

**Libraries** — unchanged from v1 §9. `wavesurfer.js`, `extendable-media-recorder`, Moonshine or sherpa-onnx for transcription, `expo-audio` + `react-native-audio-api` when mobile arrives. For the live forming session, LiveKit (Apache-2.0).

**Still true from v1:** the audio pipeline, the transcript-first principle, peaks precomputed at ingest, text replies as first-class turns, and never blocking a post on transcription.

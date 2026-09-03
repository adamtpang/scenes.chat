# Scenes ↔ classic AirChat feature parity

Last verified: 2026-09-02

## Target and success definition

The comparison target is the April 2024 AirChat relaunch: the voice-first,
feed-era product before the July 2024 pivot to topic channels. "Parity" does
not mean cloning AirChat's network model or visual identity. It means matching
the interaction qualities that made an asynchronous spoken conversation feel
fast and natural, inside Scenes' private, fixed-membership cohorts.

Scenes reaches parity when a placed member can:

1. enter a private cohort through the mandatory forming session;
2. speak with one press, see the turn immediately, and receive a readable
   transcript without the recording ever being put at risk;
3. read every turn with sound off, or listen continuously at a chosen speed;
4. reply by voice or text at equal visual weight in a clear chronological
   conversation;
5. recover from transcription, upload, permission, and connectivity failures;
6. block or report harmful participation; and
7. return through useful notifications while the operator can measure
   seven-day reciprocity.

Phase 1 launch remains gated by the six manual Phase 0 cohorts required by
`SPEC.md`. Until that evidence exists, implementation is limited to the landing
page, waitlist, manual-pilot operations, and throwaway interaction prototypes.
Per the 2026-09-03 amendment in `CLAUDE.md`, a disposable turn-pipeline
prototype now runs in parallel with Phase 0 at `/proto`. Rows marked
**Prototype** below exist there only: no auth, no cohorts, WAV not Opus,
whole-file audio not range requests. They are dogfood, not shipped product.

## Evidence boundary

The original AirChat service is no longer a reliable live reference. The
observations below use dated reporting and hands-on teardowns from the target
window. AirChat's current Nostr-based product is a successor, not the target.

- **S1 — TechCrunch, 2024-04-13:** voice posts and replies, automatic
  transcription, autoplay, vertical navigation, photo/video attachment, and
  adjustable playback speed. <https://techcrunch.com/2024/04/13/airchat-launch/>
- **S2 — WIRED, 2024-04-15:** hold-to-record/release-to-post, immediate posting,
  direct messages, roughly minute-long turns, fast correcting transcripts, and
  the default 2× playback behaviour. <https://www.wired.com/story/airchat-app-social-audio/>
- **S3 — Moneycontrol, 2024-04-15:** press-and-hold capture, cancel gesture,
  multilingual transcription, background listening, 2×/3× speed controls,
  reply carousel, search, DMs, and block/mute controls.
  <https://www.moneycontrol.com/news/technology/naval-ravikants-airchat-wants-to-build-a-social-media-app-around-voice-notes-12640401.html>
- **S4 — Alex Debecker teardown, 2024-04-18:** short invite onboarding,
  continuous playback between turns, haptic transition feedback, reply target
  feedback, and the observed thread-clarity weakness.
  <https://alexdebecker.substack.com/p/product-teardown-airchat>
- **S5 — TechCrunch, 2024-07-09:** evidence that the later channel-centric
  product was a pivot away from the April feed-era version.
  <https://techcrunch.com/2024/07/09/talky-social-app-airchat-gets-a-major-overhaul-making-it-more-like-an-asynchronous-clubhouse/>

## Capability matrix

Status reflects the deployed Scenes codebase, not plans in `SPEC.md`.

| Journey | Capability | Classic AirChat evidence | Scenes adaptation | Status | Acceptance evidence |
|---|---|---|---|---|---|
| Acquisition | Clear value proposition | Inferred from invite-led launch [S1, S4] | Explain placement, forming, and persistent private voice | Partial | Landing page is live; product preview and pilot logistics need strengthening |
| Activation | Short intake | Short invite onboarding [S4] | Email → availability, language, and topic signals; no public profile | Match | Production submission, private persistence, deduplication, and CSV export verified 2026-09-02 |
| Activation | Placement into a conversation | AirChat entered a followed feed [S1] | Weekly placement into a new fixed cohort | Missing | Manual placement runbook and six completed cohorts |
| Formation | Facilitated first session | Not present in target | Mandatory three-round Fast Friends script | Partial | Script written 2026-09-03 (`PHASE0_SCRIPT.md`); no live run logged yet |
| Create | One-gesture voice capture | Hold to record, release to post, cancel [S2, S3] | Press-and-hold or accessible toggle; 60/90/120 s caps during forming | Prototype | Toggle record/stop with discard and 120 s cap at `/proto`; WAV via `extendable-media-recorder`; mobile browser matrix untested |
| Create | Optimistic posting | Post appears on release [S2] | Turn appears immediately as `processing`; transcription never blocks | Prototype | Local turn renders on stop with object-URL playback before upload completes; server returns `processing` and transcribes after the response |
| Create | Durable audio | Not established by observed sources | Upload retry + immutable audio object; failure never discards recording | Prototype | Audio object is written before the turn record; failed uploads stay playable on-device with a retry action; no network-failure test yet |
| Create | Voice transcription | Fast, accurate, correcting, multilingual [S1–S3] | First-class transcript with words/timing; explicit unavailable state | Prototype | OpenAI-compatible `verbose_json` with word timestamps behind `TRANSCRIBE_*` env; no key configured, so every voice turn currently lands `unavailable` with audio intact |
| Create | Text participation | Classic target did not allow typing [S2, S3] | Text replies are first-class turns, not comments or a fallback style | Prototype | Same turn record, same card, same reply affordance as voice |
| Consume | Sound-off reading | Audio could be paused and transcripts read [S1] | Entire cohort is usable with audio muted | Prototype | Transcript is the primary element of every card; blocked in practice until a transcription key exists |
| Consume | Continuous playback | Autoplay and seamless next-turn playback [S1, S4] | User-initiated continuous cohort playback; never surprise-autoplay sound | Prototype | "Play through" toggle advances to the next voice turn on `ended`; off by default |
| Consume | Playback speed | 1×/2×/3× controls [S1–S3] | Persistent speed control with `preservesPitch = true` | Prototype | 1×/1.5×/2× applied to every audio element with `preservesPitch`; not persisted across reloads |
| Consume | Transcript/audio sync | Fast transcript observed; word sync not established | Word-level highlight via `requestAnimationFrame` | Prototype | rAF loop highlights the active word while playing; unverified until transcripts exist |
| Consume | Waveform/progress | Not core in observed target | Server-computed peaks stored with each turn | Prototype | 200 peaks computed from PCM at ingest and stored on the turn; rendered with `wavesurfer.js` v7 from stored peaks, no client decode |
| Conversation | Voice replies | Voice replies and reply target feedback [S1, S3, S4] | Voice or text reply with explicit target | Prototype | Reply sets `replyTo` for the next voice or text turn; composer shows the target |
| Conversation | Understandable threads | Reply carousel existed but was confusing [S2–S4] | Chronological flat timeline with compact parent context | Prototype | Flat list ordered by `createdAt`; replies show a one-line parent quote inline |
| Conversation | Attachments | Photo/video supported [S1, S3] | Defer until voice/text loop is healthy | Deferred | Only reconsider after reciprocity threshold is met |
| Retention | Background listening | Observed [S3] | Later PWA/native enhancement | Deferred | Media session survives background where platform permits |
| Retention | Notifications | Product navigation included notifications (secondary evidence) | Cohort-only reply/mention/forming reminders | Missing | Preference controls and deep links; no engagement bait |
| Trust | Block/mute | Observed [S3] | Block member and suppress their turns without leaking membership data | Missing | RLS and UI tests for both directions |
| Trust | Report | Moderation need noted; exact classic flow unverified | Report turn/member; reported cohort is reviewable | Missing | Abuse-path test with operator review queue |
| Trust | Minor safety | Not established | No minors in pilots or Phase 1 | Partial | Intake requires an 18+ confirmation; policy copy missing |
| Measurement | Reciprocity | Not an AirChat capability | Rolling seven-day ordered-pair listening coverage | Missing | Cohort dashboard matches fixture calculations |
| Operations | Pilot workflow | Not relevant | Intake, schedule, reminders, attendance, script, follow-up | Missing | Six runs logged and two-week retention measured |
| Reliability | Offline/retry states | Not established | Capture recovery, upload retry, transcript retry, idempotent mutations | Partial | Upload retry exists in the prototype; no transcript retry, no idempotency keys, no failure matrix |
| Accessibility | Reduced motion, keyboard, screen reader | Not established | WCAG-aware controls and transcript-first use | Partial | Landing has baseline focus/reduced-motion styles; app flow unbuilt |

## Deliberately excluded AirChat features

These are not parity gaps. They conflict with the evidence-backed product model
in `SPEC.md`.

| AirChat feature | Scenes decision |
|---|---|
| Global or following feed | Excluded: each member sees only their cohort's chronological turns |
| Browsable topic channels | Excluded: no directory, search, explore tab, or room shopping |
| Public profiles and follower graph | Excluded: intake is private and cohorts are formed, not selected |
| Likes, reposts, public counts, highlights | Excluded: they turn reciprocal conversation into performance |
| Join existing group | Excluded: cohorts never gain members; new demand spawns a new cohort |
| Global people/post search | Excluded: a member may only find content already inside their cohort |
| Open direct messages | Excluded for the core loop; reconsider only with safety evidence |
| Surprise sound autoplay | Adapted: continuous playback is user-initiated and transcripts remain primary |

## Current priority

1. Recruit and hand-match the first cohort from the live private intake, then
   schedule one fixed weekly forming time.
2. Run and log six manual forming sessions, then measure whether members are
   still talking two weeks later.
3. If Phase 0 passes, build the durable turn pipeline before visual breadth:
   optimistic audio ingest → stored peaks → transcription → chronological
   voice/text timeline → playback → safety → reciprocity.

## Open evidence gaps

- The exact classic AirChat recording retry and upload durability behaviour was
  not documented in the sources above.
- Exact notification controls and accessibility behaviour need an archived app
  build or first-hand recording; neither is required to define Scenes' safer
  baseline.
- "Still talking two weeks later" has not yet been recorded for six Scenes
  cohorts. This remains the gating unknown, not an engineering gap.

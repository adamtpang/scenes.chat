<!-- BEGIN:imported-codex-context -->
# scenes.chat

A formation engine. It repeatedly assembles small groups of strangers who should know each other, runs them through a scripted session that makes them close fast, and then hosts them as a persistent asynchronous voice space.

**Read `SPEC.md` (v2) before making architectural decisions.** It contains the research this design is built on, and every constraint below is justified there. v2 supersedes v1 — if you find references to browsable rooms or a global feed, they're stale.

## What this is not

These are not preferences. Each one killed a real company.

- **No browsable directory of groups.** No group list, no search, no explore tab.
- **No global feed.** Ranking concentrates attention on the top 1% of posts, which is how a group becomes a broadcast.
- **No join button on an existing cohort.** Cohorts never gain members. They spawn new ones.
- **No follower counts, like counts, or leaderboards.**
- **No public profiles.** Profiles turn formation into selection, and selection turns it into dating.
- **No member cap.** Measure reciprocity instead (see below).
- **No clever matching algorithm.** Same slot, same language, non-overlapping topics. Self-selection does most of the work.

## Non-negotiables

1. **The app must be fully usable with sound off.** Transcript is a first-class read, not a caption.
2. **Text replies are first-class turns**, rendered at the same weight as voice. This is the lurker path.
3. **Never block posting on transcription.** The turn appears immediately with `status='processing'`.
4. **Never lose a recording.** Transcription failure degrades to "transcript unavailable" with audio intact.
5. **Waveform peaks are computed server-side at ingest** and stored on the row.
6. **The forming script is not optional.** An unfacilitated format has no quality floor. The script is the host.
7. **Chronological, always.** Inside a cohort, everything, in order, no ranking.

## The one metric

Reciprocity, per cohort, rolling 7 days: the fraction of ordered member pairs where A heard a turn from B. Healthy > 0.7. Fading < 0.4 for two weeks. Build this before building anything optional — it is the only number that says whether the product works.

## Stack

Next.js App Router + TypeScript on Vercel · Supabase (Postgres + RLS + magic-link auth + Storage) · LiveKit for the live forming session only · `extendable-media-recorder` for capture · `wavesurfer.js` v7 for waveform UI · OpenAI-compatible transcription endpoint (`verbose_json`, word granularity) · Opus 24–32kbps mono.

## Known traps

- `react-native-audio-recorder-player` is **archived** (Sept 2025) — most tutorials still recommend it. Use `react-native-nitro-sound` if mobile arrives.
- `jam-systems/jam` is **dead** (Dec 2022). Use LiveKit directly.
- Bare `MediaRecorder` returns a different codec per browser. Use `extendable-media-recorder`.
- `timeupdate` fires at ~4Hz — too slow for word highlighting. Use `requestAnimationFrame`.
- Set `preservesPitch = true` on playback rate changes.
- No HLS for clips under two minutes. Single Opus files, range requests, prefetch.

## Conventions

- RLS policies ship in the same migration as the table. A user reads only cohorts they belong to.
- Server actions for mutations; route handlers only for webhooks and the ingest callback.
- No `any`. No `console.log` in committed code.
- Migrations in `supabase/migrations/`, never hand-edited after apply.

## Phase discipline

**Phase 0 is not code.** Run the forming session by hand — a form, a spreadsheet, a call, the prompts read aloud — six times, and check whether those groups are still talking two weeks later. Every expensive failure in this category shipped software before validating the ritual. Do not write Phase 1 until Phase 0 has an answer.

## Deploy Configuration (configured by /setup-deploy)

- Platform: Vercel
- Production URL: https://scenes.chat
- Deploy workflow: automatic production deploy on push to `main`
- Deploy status command: `vercel inspect scenes.chat --scope adamtpangs-projects`
- Merge method: squash
- Project type: web app
- Post-deploy health check: https://scenes.chat

### Custom deploy hooks

- Pre-merge: `npm audit --audit-level=high && npm run build`
- Deploy trigger: automatic on push to `main`
- Deploy status: `vercel inspect scenes.chat --scope adamtpangs-projects`
- Health check: https://scenes.chat
<!-- END:imported-codex-context -->
<!-- BEGIN:codex-chat-continuation -->
Codex chat continuation: read `CLAUDE_CONTINUE_FROM_CODEX.md` to resume from the latest local Codex sessions for this project.
<!-- END:codex-chat-continuation -->
# scenes.chat Guidance for Claude

Read `CLAUDE.md` first, then `CLAUDE_CONTINUE_FROM_CODEX.md` for the newest Codex chat continuity.

# scenes.chat

An experiment in making friends online. Scenes forms small groups of strangers who should
know each other, runs them through a scripted session that makes them close fast, and then
hosts them as a persistent space.

See `SPEC.md` for the product architecture and the research it's built on, and `CLAUDE.md`
for the working constraints.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel
- Vercel Private Blob for the Phase 0 pilot intake
- Supabase for Phase 1 auth, relational data, RLS, and audio storage

## Local dev

```bash
npm install
npm run dev
```

## Pilot intake

The landing page posts the minimum matching signal to `/api/waitlist`. The route
validates the submission and stores one JSON object per applicant in the private
`scenes-intake` Vercel Blob store. Filenames are deterministic SHA-256 hashes of
normalized email addresses, so repeat applications update instead of duplicating.
The browser never receives storage credentials or blob URLs.

Vercel injects `BLOB_READ_WRITE_TOKEN` into production, preview, and development.
To run the form locally, pull the development environment:

```bash
vercel env pull .env.local
```

Export private applications as CSV for manual matching:

```bash
npm run intake:export
```

The command prints CSV to standard output and never exposes blob URLs. Redirect
it only to a private location outside the repository when a spreadsheet file is
needed.

The old Supabase waitlist migration is retained as a migration path, but it is
not part of Phase 0 production.

## Seat fee

After the intake saves, the form shows a $5 Stripe payment link with the
applicant's email prefilled (`app/offer.ts`). The fee is a quality filter and
a no-show deterrent, per `SPEC.md` section 9. Payment is not written back to
the intake store. Before matching, open the Stripe dashboard, list payments
for the product "scenes.chat pilot seat", and match only applicants whose
email appears there. Refund anyone who paid but was not seated within two
forming cycles.

## Prototype cohort (`/proto`)

A disposable turn-pipeline prototype that runs in parallel with Phase 0 (see the
2026-09-03 amendment in `CLAUDE.md`). Voice and text turns live as JSON in the
same private Blob store under `proto/`, audio as WAV under `proto/audio/`.
Peaks are computed server-side at ingest. Nothing here is Phase 1 schema.

Environment:

- `PROTO_PASSCODE`: if set, every write must carry it. Set this before the
  prototype is reachable on a public URL, or `/proto` is an open upload endpoint.
- `TRANSCRIBE_API_KEY`: enables transcription. Without it every voice turn
  lands as `unavailable` with the audio intact.
- `TRANSCRIBE_BASE_URL` (default `https://api.openai.com/v1`) and
  `TRANSCRIBE_MODEL` (default `whisper-1`): any OpenAI-compatible endpoint that
  supports `verbose_json` with word timestamps.

## Phase 0

Before building the app itself, the formation ritual gets run by hand: a form, a
spreadsheet, a call, the prompts read aloud. Six times. The question being tested is
whether those groups are still talking two weeks later. See `SPEC.md` §8.

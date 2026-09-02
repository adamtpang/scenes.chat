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

## Phase 0

Before building the app itself, the formation ritual gets run by hand — a form, a
spreadsheet, a call, the prompts read aloud. Six times. The question being tested is
whether those groups are still talking two weeks later. See `SPEC.md` §8.

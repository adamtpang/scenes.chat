# scenes.chat

An experiment in making friends online. Scenes forms small groups of strangers who should
know each other, runs them through a scripted session that makes them close fast, and then
hosts them as a persistent space.

See `SPEC.md` for the product architecture and the research it's built on, and `CLAUDE.md`
for the working constraints.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel
- Supabase for the waitlist (and, later, auth + data)

## Local dev

```bash
npm install
npm run dev
```

## Waitlist

The landing page posts to `/api/waitlist`, which inserts into a Supabase `waitlist` table.

Until `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, the endpoint
returns a 503 and the form tells people to email instead — it never pretends a signup
worked. To wire it up:

1. Create a Supabase project (or free a slot — the free tier allows two active projects).
2. Run the migration in `supabase/migrations/0001_waitlist.sql`.
3. Set both env vars in Vercel and redeploy.

## Phase 0

Before building the app itself, the formation ritual gets run by hand — a form, a
spreadsheet, a call, the prompts read aloud. Six times. The question being tested is
whether those groups are still talking two weeks later. See `SPEC.md` §8.

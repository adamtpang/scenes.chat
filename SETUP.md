# Remaining setup

The repository is public at `adamtpang/scenes.chat`. Vercel deploys `main`
automatically, and the landing page is live at `https://scenes.chat` and
`https://www.scenes.chat`.

## Turn the waitlist on (optional, do it whenever)

The form currently returns a clear "email me instead" message rather than
pretending a signup worked. To make it store emails:

- Supabase free tier allows two active projects and you already have two
  (`ness.city`, `pokedex.life`). Pause one, or upgrade, then create `scenes-chat`.
- Run `supabase/migrations/0001_waitlist.sql` against it.
- Set these in Vercel → Settings → Environment Variables, then redeploy:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local dev

```bash
npm install
npm run dev
```

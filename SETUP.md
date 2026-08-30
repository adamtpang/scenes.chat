# Remaining setup

Everything is built and committed. Two things need your account credentials,
which the assistant's connectors are not scoped to do.

## 1. Create the GitHub repo and push (about 30 seconds)

```bash
cd ~/Aether/scenes.chat
gh repo create scenes.chat --public --source=. --remote=origin --push
```

No `gh`? Create an empty repo named `scenes.chat` at https://github.com/new
(no README, no .gitignore), then:

```bash
git remote add origin https://github.com/adamtpang/scenes.chat.git
git push -u origin main
```

## 2. Create the Vercel project

Easiest is the dashboard: https://vercel.com/new — import `adamtpang/scenes.chat`,
accept the detected Next.js settings, deploy. Then in Project → Settings → Domains,
add `scenes.chat` and `www.scenes.chat`.

Or from the CLI:

```bash
npx vercel link
npx vercel domains add scenes.chat
npx vercel --prod
```

## 3. Turn the waitlist on (optional, do it whenever)

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

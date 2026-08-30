import { NextResponse } from "next/server";

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FALLBACK =
  "The waitlist isn't wired up yet. Email adamtpang@gmail.com and I'll add you by hand.";

export async function POST(request: Request) {
  let email: unknown;

  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "That doesn't look like an email address." },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Not configured yet — fail honestly rather than pretending it worked.
  if (!url || !key) {
    return NextResponse.json({ error: FALLBACK }, { status: 503 });
  }

  const res = await fetch(`${url}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      source: "landing",
    }),
  });

  if (!res.ok && res.status !== 409) {
    return NextResponse.json({ error: FALLBACK }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

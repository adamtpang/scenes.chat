import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BODY_BYTES = 16_384;
const SLOTS = new Set(["sgt", "cet", "et", "flexible"]);
const WANTS = new Set(["learn", "build", "company"]);

const FALLBACK =
  "Applications are temporarily paused. Please try again in a little while.";

type Intake = {
  email?: unknown;
  deepIn?: unknown;
  topics?: unknown;
  slot?: unknown;
  language?: unknown;
  wants?: unknown;
  isAdult?: unknown;
  company?: unknown;
};

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 && normalized.length <= max ? normalized : null;
}

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return error("That application is too large.", 413);
  }

  let parsed: unknown;

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return error("That application is too large.", 413);
    }
    parsed = JSON.parse(body);
  } catch {
    return error("Bad request.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return error("Bad request.");
  }

  const intake = parsed as Intake;

  // Quietly accept bot submissions so the honeypot does not teach bots how to
  // bypass it. No applicant data is stored in this branch.
  if (typeof intake.company === "string" && intake.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const email = clean(intake.email, 254)?.toLowerCase();
  const deepIn = clean(intake.deepIn, 160);
  const language = clean(intake.language, 40);
  const slot = clean(intake.slot, 20);
  const wants = clean(intake.wants, 20);
  const topicsRaw = clean(intake.topics, 240);
  const topics = topicsRaw
    ?.split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);

  if (!email || !EMAIL_RE.test(email)) {
    return error("That doesn't look like an email address.");
  }
  if (!deepIn) {
    return error("Tell us what you're deep in right now (160 characters max).");
  }
  if (!topics || topics.length < 2 || topics.length > 3) {
    return error("Add two or three topics, separated by commas.");
  }
  if (topics.some((topic) => topic.length > 80)) {
    return error("Keep each topic under 80 characters.");
  }
  if (!slot || !SLOTS.has(slot)) {
    return error("Choose a forming-time preference.");
  }
  if (!language) {
    return error("Add the language you'd like to use.");
  }
  if (!wants || !WANTS.has(wants)) {
    return error("Choose what you want from a scene.");
  }
  if (intake.isAdult !== true) {
    return error("The pilot is limited to people who are 18 or older.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return error(FALLBACK, 503);
  }

  try {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(email),
    );
    const key = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

    await put(
      `applications/${key}.json`,
      JSON.stringify({
        version: 1,
        submittedAt: new Date().toISOString(),
        source: "landing",
        email,
        deepIn,
        topics,
        slot,
        language,
        wants,
        isAdult: true,
      }),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      },
    );
  } catch {
    return error(FALLBACK, 502);
  }

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

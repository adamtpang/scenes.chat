// Voice turn ingest for the /proto cohort. Order of operations is the point:
//   1. validate and analyze the WAV (peaks, duration) in memory
//   2. save the audio object FIRST, so a recording is never lost
//   3. save the turn as `processing` and respond immediately
//   4. transcribe after the response; failure degrades to `unavailable`
// Route handler rather than server action because this is ingest
// (CLAUDE.md conventions).

import { after, NextResponse } from "next/server";
import { cleanAuthor, passcodeOk } from "@/lib/proto/auth";
import { analyzeWav } from "@/lib/proto/peaks";
import { saveAudio, saveTurn } from "@/lib/proto/store";
import { transcribeWav, transcriptionConfigured } from "@/lib/proto/transcribe";
import {
  MAX_TURN_MS,
  PROTO_COHORT_ID,
  toPublic,
  type Turn,
} from "@/lib/proto/types";

export const runtime = "nodejs";
export const maxDuration = 120;

// 120 s of 48 kHz 16-bit stereo WAV is about 23 MB. Leave headroom.
const MAX_BYTES = 32 * 1024 * 1024;
const UUID_RE = /^[0-9a-f-]{36}$/;

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!passcodeOk(request.headers.get("x-proto-pass"))) {
    return error("Wrong passcode.", 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error("Bad request.");
  }

  const file = form.get("audio");
  if (!(file instanceof Blob)) return error("No audio attached.");
  if (file.size === 0) return error("The recording is empty.");
  if (file.size > MAX_BYTES) return error("That recording is too large.", 413);

  const author = cleanAuthor(form.get("author"));
  if (!author) return error("Add a name first.");

  const replyToRaw = form.get("replyTo");
  const replyTo =
    typeof replyToRaw === "string" && UUID_RE.test(replyToRaw)
      ? replyToRaw
      : null;

  const bytes = await file.arrayBuffer();

  let analysis: ReturnType<typeof analyzeWav>;
  try {
    analysis = analyzeWav(bytes);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : "Unreadable audio.";
    return error(reason);
  }
  if (analysis.durationMs > MAX_TURN_MS + 2000) {
    return error("Turns are capped at two minutes.");
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const mime = "audio/wav";

  let stored: { pathname: string; url: string };
  try {
    stored = await saveAudio(id, bytes, mime);
  } catch {
    return error("Could not store the recording. Nothing was saved.", 502);
  }

  const turn: Turn = {
    id,
    cohortId: PROTO_COHORT_ID,
    kind: "voice",
    author,
    createdAt,
    replyTo,
    body: null,
    words: null,
    audio: {
      pathname: stored.pathname,
      url: stored.url,
      mime,
      bytes: bytes.byteLength,
      durationMs: analysis.durationMs,
      peaks: analysis.peaks,
    },
    status: "processing",
    note: null,
  };

  try {
    await saveTurn(turn);
  } catch {
    // Audio is already safe. Report the turn as unavailable rather than lose it.
    return error("Recording stored, but the turn could not be indexed.", 502);
  }

  after(async () => {
    if (!transcriptionConfigured()) {
      await saveTurn({
        ...turn,
        status: "unavailable",
        note: "Transcription is not configured on this deployment.",
      });
      return;
    }
    try {
      const transcript = await transcribeWav(bytes, `${id}.wav`);
      await saveTurn({
        ...turn,
        status: "ready",
        body: transcript.text,
        words: transcript.words,
        note: null,
      });
    } catch {
      await saveTurn({
        ...turn,
        status: "unavailable",
        note: "Transcript unavailable. The audio is intact.",
      });
    }
  });

  return NextResponse.json(toPublic(turn), {
    status: 201,
    headers: { "Cache-Control": "no-store" },
  });
}

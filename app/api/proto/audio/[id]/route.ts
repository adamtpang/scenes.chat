// Streams a voice turn's WAV from the private Blob store. Whole-file only for
// the prototype; range requests and Opus arrive with the Phase 1 pipeline
// (CLAUDE.md known traps: single Opus files, range requests, prefetch).

import { getTurn, openAudio } from "@/lib/proto/store";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f-]{36}$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return new Response("Not found", { status: 404 });

  const turn = await getTurn(id);
  if (!turn || !turn.audio) return new Response("Not found", { status: 404 });

  const audio = await openAudio(turn);
  if (!audio) return new Response("Audio unavailable", { status: 502 });

  return new Response(audio.stream, {
    headers: {
      "Content-Type": turn.audio.mime,
      "Content-Length": String(audio.bytes),
      "Accept-Ranges": "none",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

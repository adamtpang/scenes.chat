// Prototype persistence on the existing private Vercel Blob store. One JSON
// object per turn, one WAV per voice turn. Chronology comes from the
// millisecond timestamp in the pathname, so a prefix list is already in
// order. This is deliberately not Supabase: the prototype is disposable and
// the Phase 1 schema will be derived from SPEC.md section 5, not from here.

import { get, list, put } from "@vercel/blob";
import type { Turn } from "./types";

const TURNS_PREFIX = "proto/turns/";
const AUDIO_PREFIX = "proto/audio/";

function turnPathname(turn: Turn) {
  return `${TURNS_PREFIX}${Date.parse(turn.createdAt)}-${turn.id}.json`;
}

export async function saveTurn(turn: Turn): Promise<void> {
  await put(turnPathname(turn), JSON.stringify(turn), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function saveAudio(
  id: string,
  bytes: ArrayBuffer,
  mime: string,
): Promise<{ pathname: string; url: string }> {
  const result = await put(`${AUDIO_PREFIX}${id}.wav`, bytes, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: mime,
    cacheControlMaxAge: 3600,
  });
  return { pathname: result.pathname, url: result.url };
}

async function readJson(url: string): Promise<Turn | null> {
  const result = await get(url, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  try {
    const parsed: unknown = await new Response(result.stream).json();
    return isTurn(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isTurn(value: unknown): value is Turn {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.createdAt === "string" &&
    (t.kind === "voice" || t.kind === "text")
  );
}

async function listTurnBlobs() {
  const blobs: { pathname: string; url: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: TURNS_PREFIX, cursor, limit: 1000 });
    for (const b of page.blobs) blobs.push({ pathname: b.pathname, url: b.url });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
  return blobs;
}

export async function listTurns(): Promise<Turn[]> {
  const blobs = await listTurnBlobs();
  const turns = await Promise.all(blobs.map((b) => readJson(b.url)));
  return turns
    .filter((t): t is Turn => t !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getTurn(id: string): Promise<Turn | null> {
  const blobs = await listTurnBlobs();
  const match = blobs.find((b) => b.pathname.endsWith(`-${id}.json`));
  return match ? readJson(match.url) : null;
}

export async function openAudio(
  turn: Turn,
): Promise<{ stream: ReadableStream; bytes: number } | null> {
  if (!turn.audio) return null;
  const result = await get(turn.audio.url, {
    access: "private",
    useCache: false,
  });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return { stream: result.stream, bytes: turn.audio.bytes };
}

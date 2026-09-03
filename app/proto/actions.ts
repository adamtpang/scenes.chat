"use server";

// Server actions for the /proto cohort: read the timeline, post a text turn.
// Text turns are first-class (CLAUDE.md non-negotiable 2): same shape, same
// table, same weight as voice.

import { cleanAuthor, passcodeOk } from "@/lib/proto/auth";
import { listTurns, saveTurn } from "@/lib/proto/store";
import {
  PROTO_COHORT_ID,
  toPublic,
  type PublicTurn,
  type Turn,
} from "@/lib/proto/types";

const UUID_RE = /^[0-9a-f-]{36}$/;
const MAX_TEXT = 2000;

export async function fetchTurns(): Promise<PublicTurn[]> {
  const turns = await listTurns();
  return turns.map(toPublic);
}

export type PostTextInput = {
  author: string;
  body: string;
  replyTo: string | null;
  pass: string | null;
};

export type PostTextResult =
  | { ok: true; turn: PublicTurn }
  | { ok: false; error: string };

export async function postTextTurn(
  input: PostTextInput,
): Promise<PostTextResult> {
  if (!passcodeOk(input.pass)) return { ok: false, error: "Wrong passcode." };

  const author = cleanAuthor(input.author);
  if (!author) return { ok: false, error: "Add a name first." };

  const body =
    typeof input.body === "string" ? input.body.trim().slice(0, MAX_TEXT) : "";
  if (!body) return { ok: false, error: "Write something first." };

  const replyTo =
    typeof input.replyTo === "string" && UUID_RE.test(input.replyTo)
      ? input.replyTo
      : null;

  const turn: Turn = {
    id: crypto.randomUUID(),
    cohortId: PROTO_COHORT_ID,
    kind: "text",
    author,
    createdAt: new Date().toISOString(),
    replyTo,
    body,
    words: null,
    audio: null,
    status: "ready",
    note: null,
  };

  try {
    await saveTurn(turn);
  } catch {
    return { ok: false, error: "Could not save that. Try again." };
  }

  return { ok: true, turn: toPublic(turn) };
}

// Throwaway turn model for the /proto cohort. See CLAUDE.md, Phase discipline
// amendment 2026-09-03. Mirrors the v1 turn shape closely enough that a real
// Phase 1 `turns` table can be derived from it, but nothing here is durable.

export type TurnKind = "voice" | "text";
export type TurnStatus = "processing" | "ready" | "unavailable";

export type Word = { word: string; start: number; end: number };

export type TurnAudio = {
  pathname: string;
  url: string;
  mime: string;
  bytes: number;
  durationMs: number;
  peaks: number[];
};

export type Turn = {
  id: string;
  cohortId: string;
  kind: TurnKind;
  author: string;
  createdAt: string;
  replyTo: string | null;
  /** Text body for text turns, transcript for voice turns once ready. */
  body: string | null;
  words: Word[] | null;
  audio: TurnAudio | null;
  status: TurnStatus;
  /** Human-readable reason when status is `unavailable`. */
  note: string | null;
};

export type PublicAudio = Omit<TurnAudio, "url" | "pathname">;
export type PublicTurn = Omit<Turn, "audio"> & { audio: PublicAudio | null };

export function toPublic(turn: Turn): PublicTurn {
  if (!turn.audio) return { ...turn, audio: null };
  const { mime, bytes, durationMs, peaks } = turn.audio;
  return { ...turn, audio: { mime, bytes, durationMs, peaks } };
}

export const PROTO_COHORT_ID = "proto";
export const MAX_TURN_MS = 120_000;

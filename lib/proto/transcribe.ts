// OpenAI-compatible transcription (CLAUDE.md stack: `verbose_json`, word
// granularity). Configured entirely by env so the provider can be swapped
// without a code change:
//   TRANSCRIBE_API_KEY   required to enable transcription at all
//   TRANSCRIBE_BASE_URL  default https://api.openai.com/v1
//   TRANSCRIBE_MODEL     default whisper-1
// With no key, callers must degrade to status `unavailable` with audio intact
// (non-negotiable 4). Never block a post on this.

import type { Word } from "./types";

export type Transcript = { text: string; words: Word[] | null };

export function transcriptionConfigured() {
  return Boolean(process.env.TRANSCRIBE_API_KEY);
}

type VerboseJson = {
  text?: unknown;
  words?: unknown;
};

function isWord(value: unknown): value is Word {
  if (!value || typeof value !== "object") return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.word === "string" &&
    typeof w.start === "number" &&
    typeof w.end === "number"
  );
}

export async function transcribeWav(
  bytes: ArrayBuffer,
  filename: string,
): Promise<Transcript> {
  const key = process.env.TRANSCRIBE_API_KEY;
  if (!key) throw new Error("Transcription is not configured.");

  const base = (
    process.env.TRANSCRIBE_BASE_URL ?? "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const model = process.env.TRANSCRIBE_MODEL ?? "whisper-1";

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "audio/wav" }), filename);
  form.append("model", model);
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");

  const res = await fetch(`${base}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Transcription endpoint returned ${res.status}.`);
  }

  const json = (await res.json()) as VerboseJson;
  const text = typeof json.text === "string" ? json.text.trim() : "";
  const words = Array.isArray(json.words)
    ? json.words.filter(isWord).map((w) => ({
        word: w.word,
        start: w.start,
        end: w.end,
      }))
    : null;

  return { text, words: words && words.length > 0 ? words : null };
}

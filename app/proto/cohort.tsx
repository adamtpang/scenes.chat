"use client";

// The /proto cohort surface. Everything in one chronological list, voice and
// text at equal weight, transcript as the primary read, audio secondary.
// Throwaway: no auth, no cohorts, no matching. See CLAUDE.md amendment.

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_TURN_MS, type PublicTurn } from "@/lib/proto/types";
import { fetchTurns, postTextTurn } from "./actions";

type Props = {
  initialTurns: PublicTurn[];
  transcription: boolean;
  needsPass: boolean;
};

const SPEEDS = [1, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

/** A turn as the client holds it. Optimistic voice turns carry an object URL. */
type LocalTurn = PublicTurn & { localSrc?: string };

const LOCAL_PREFIX = "local-";

let wavRegistration: Promise<void> | null = null;
function ensureWavEncoder() {
  if (!wavRegistration) {
    wavRegistration = (async () => {
      const { register } = await import("extendable-media-recorder");
      const { connect } = await import("extendable-media-recorder-wav-encoder");
      await register(await connect());
    })();
  }
  return wavRegistration;
}

function readStored(key: string) {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable. The page still works.
  }
}

function clock(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function snippet(turn: PublicTurn) {
  if (turn.body) return turn.body.length > 80 ? `${turn.body.slice(0, 80)}…` : turn.body;
  return turn.kind === "voice" ? "(voice turn)" : "";
}

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const e = (data as { error: unknown }).error;
    if (typeof e === "string") return e;
  }
  return fallback;
}

function mergeTurns(prev: LocalTurn[], fresh: PublicTurn[]): LocalTurn[] {
  const seen = new Set(fresh.map((t) => t.id));
  const out: LocalTurn[] = fresh.map((t) => {
    const old = prev.find((p) => p.id === t.id);
    return old?.localSrc ? { ...t, localSrc: old.localSrc } : t;
  });
  for (const p of prev) {
    if (!seen.has(p.id) && p.id.startsWith(LOCAL_PREFIX)) out.push(p);
  }
  return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export default function Cohort({ initialTurns, transcription, needsPass }: Props) {
  const [turns, setTurns] = useState<LocalTurn[]>(initialTurns);
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [speed, setSpeed] = useState<Speed>(1);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const audioEls = useRef(new Map<string, HTMLAudioElement>());
  const pendingBlobs = useRef(new Map<string, Blob>());
  const recorderRef = useRef<{ stop: () => void; cancel: () => void } | null>(null);

  useEffect(() => {
    setName(readStored("proto.name"));
    setPass(readStored("proto.pass"));
  }, []);

  const processing = turns.some((t) => t.status === "processing" && !t.id.startsWith(LOCAL_PREFIX));
  useEffect(() => {
    if (!processing) return;
    const timer = window.setInterval(async () => {
      try {
        const fresh = await fetchTurns();
        setTurns((prev) => mergeTurns(prev, fresh));
      } catch {
        // Next tick will try again.
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [processing]);

  useEffect(() => {
    for (const el of audioEls.current.values()) {
      el.playbackRate = speed;
      el.preservesPitch = true;
    }
  }, [speed]);

  const registerAudio = useCallback((id: string, el: HTMLAudioElement | null) => {
    if (el) audioEls.current.set(id, el);
    else audioEls.current.delete(id);
  }, []);

  function requestPlay(id: string) {
    for (const [key, el] of audioEls.current) {
      if (key !== id && !el.paused) el.pause();
    }
  }

  function handleEnded(id: string) {
    setPlayingId((current) => (current === id ? null : current));
    if (!autoAdvance) return;
    const voice = turns.filter((t) => t.kind === "voice" && t.audio);
    const index = voice.findIndex((t) => t.id === id);
    const next = voice[index + 1];
    if (!next) return;
    const el = audioEls.current.get(next.id);
    if (el) {
      el.playbackRate = speed;
      el.preservesPitch = true;
      void el.play();
    }
  }

  async function startRecording() {
    if (!name.trim()) {
      setNotice("Add a name first.");
      return;
    }
    setNotice(null);
    try {
      await ensureWavEncoder();
      const { MediaRecorder } = await import("extendable-media-recorder");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/wav" });
      const chunks: Blob[] = [];
      const startedAt = Date.now();
      let cancelled = false;

      const tick = window.setInterval(() => setElapsed(Date.now() - startedAt), 250);
      const cap = window.setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, MAX_TURN_MS);

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        window.clearInterval(tick);
        window.clearTimeout(cap);
        setRecording(false);
        setElapsed(0);
        recorderRef.current = null;
        if (cancelled) return;
        const blob = new Blob(chunks, { type: "audio/wav" });
        void submitVoice(blob, Date.now() - startedAt, null);
      };

      recorderRef.current = {
        stop: () => {
          if (recorder.state !== "inactive") recorder.stop();
        },
        cancel: () => {
          cancelled = true;
          if (recorder.state !== "inactive") recorder.stop();
        },
      };

      recorder.start();
      setRecording(true);
    } catch (cause) {
      const denied = cause instanceof Error && cause.name === "NotAllowedError";
      setNotice(denied ? "Microphone permission was denied." : "Could not start recording.");
    }
  }

  async function submitVoice(blob: Blob, approxMs: number, existingId: string | null) {
    const author = name.trim();
    const localId = existingId ?? `${LOCAL_PREFIX}${crypto.randomUUID()}`;
    const target = replyTo;

    if (!existingId) {
      const localSrc = URL.createObjectURL(blob);
      const optimistic: LocalTurn = {
        id: localId,
        cohortId: "proto",
        kind: "voice",
        author,
        createdAt: new Date().toISOString(),
        replyTo: target,
        body: null,
        words: null,
        audio: { mime: "audio/wav", bytes: blob.size, durationMs: approxMs, peaks: [] },
        status: "processing",
        note: null,
        localSrc,
      };
      pendingBlobs.current.set(localId, blob);
      setTurns((prev) => [...prev, optimistic]);
      setReplyTo(null);
    } else {
      setTurns((prev) =>
        prev.map((t) => (t.id === localId ? { ...t, status: "processing", note: null } : t)),
      );
    }

    const form = new FormData();
    form.append("audio", blob, "turn.wav");
    form.append("author", author);
    if (target) form.append("replyTo", target);

    const fail = (message: string) => {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === localId
            ? { ...t, status: "unavailable", note: `${message} Kept on this device only.` }
            : t,
        ),
      );
      setNotice(message);
    };

    try {
      const res = await fetch("/api/proto/ingest", {
        method: "POST",
        body: form,
        headers: pass ? { "x-proto-pass": pass } : undefined,
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        fail(errorMessage(data, "Upload failed."));
        return;
      }
      const saved = data as PublicTurn;
      pendingBlobs.current.delete(localId);
      setTurns((prev) =>
        prev.map((t) => (t.id === localId ? { ...saved, localSrc: t.localSrc } : t)),
      );
    } catch {
      fail("Could not reach the server.");
    }
  }

  function retryUpload(localId: string) {
    const blob = pendingBlobs.current.get(localId);
    const turn = turns.find((t) => t.id === localId);
    if (!blob || !turn) return;
    void submitVoice(blob, turn.audio?.durationMs ?? 0, localId);
  }

  async function submitText() {
    if (!name.trim()) {
      setNotice("Add a name first.");
      return;
    }
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    setNotice(null);
    const result = await postTextTurn({
      author: name.trim(),
      body,
      replyTo,
      pass: pass || null,
    });
    setBusy(false);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setTurns((prev) => [...prev, result.turn]);
    setText("");
    setReplyTo(null);
  }

  const replyTarget = replyTo ? turns.find((t) => t.id === replyTo) ?? null : null;

  return (
    <main className="proto">
      <header className="proto-head">
        <h1>proto cohort</h1>
        <div className="proto-meta">
          <label>
            name{" "}
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                writeStored("proto.name", e.target.value);
              }}
              placeholder="you"
              maxLength={40}
            />
          </label>
          {needsPass && (
            <label>
              passcode{" "}
              <input
                type="password"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  writeStored("proto.pass", e.target.value);
                }}
                autoComplete="off"
              />
            </label>
          )}
          <span className="speed" role="group" aria-label="Playback speed">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className={s === speed ? "on" : ""}
                onClick={() => setSpeed(s)}
                aria-pressed={s === speed}
              >
                {s}×
              </button>
            ))}
          </span>
          <label>
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
            />{" "}
            play through
          </label>
        </div>
      </header>

      {!transcription && (
        <p className="proto-warn">
          Transcription is not configured on this deployment. Voice turns will
          post and play, and show &ldquo;transcript unavailable&rdquo; until a
          <code> TRANSCRIBE_API_KEY</code> is set.
        </p>
      )}

      {turns.length === 0 ? (
        <p className="empty">Nothing here yet. Say something, or type it.</p>
      ) : (
        <ol className="timeline" aria-label="Cohort timeline, chronological">
          {turns.map((turn) => (
            <TurnCard
              key={turn.id}
              turn={turn}
              parent={turn.replyTo ? turns.find((t) => t.id === turn.replyTo) ?? null : null}
              speed={speed}
              isPlaying={playingId === turn.id}
              transcription={transcription}
              registerAudio={registerAudio}
              onRequestPlay={requestPlay}
              onPlayState={(id, playing) => setPlayingId((cur) => (playing ? id : cur === id ? null : cur))}
              onEnded={handleEnded}
              onReply={() => setReplyTo(turn.id)}
              onRetry={turn.id.startsWith(LOCAL_PREFIX) ? () => retryUpload(turn.id) : null}
            />
          ))}
        </ol>
      )}

      <div className="composer">
        <div className="composer-inner">
          {replyTarget && (
            <div className="replying">
              <span>
                Replying to <b>{replyTarget.author}</b>: {snippet(replyTarget)}
              </span>
              <button type="button" className="cancel" onClick={() => setReplyTo(null)}>
                cancel
              </button>
            </div>
          )}
          {recording && (
            <div className="rec-status" role="status" aria-live="polite">
              <span>
                Recording {clock(elapsed)} / {clock(MAX_TURN_MS)}
              </span>
              <button type="button" className="cancel" onClick={() => recorderRef.current?.cancel()}>
                discard
              </button>
            </div>
          )}
          <button
            type="button"
            className={`rec${recording ? " on" : ""}`}
            onClick={() => (recording ? recorderRef.current?.stop() : void startRecording())}
            aria-label={recording ? "Stop and post" : "Record a voice turn"}
            disabled={busy}
          >
            {recording ? "■" : "●"}
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyTarget ? "Type a reply" : "Type a turn"}
            maxLength={2000}
            disabled={recording}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void submitText();
              }
            }}
          />
          <button
            type="button"
            className="send"
            onClick={() => void submitText()}
            disabled={busy || recording || !text.trim()}
          >
            {busy ? "Posting…" : "Post"}
          </button>
          {notice && (
            <p className="rec-status" role="alert">
              {notice}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

type CardProps = {
  turn: LocalTurn;
  parent: PublicTurn | null;
  speed: Speed;
  isPlaying: boolean;
  transcription: boolean;
  registerAudio: (id: string, el: HTMLAudioElement | null) => void;
  onRequestPlay: (id: string) => void;
  onPlayState: (id: string, playing: boolean) => void;
  onEnded: (id: string) => void;
  onReply: () => void;
  onRetry: (() => void) | null;
};

function TurnCard({
  turn,
  parent,
  speed,
  isPlaying,
  transcription,
  registerAudio,
  onRequestPlay,
  onPlayState,
  onEnded,
  onReply,
  onRetry,
}: CardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(0);
  const [activeWord, setActiveWord] = useState(-1);

  const audio = turn.audio;
  const src = turn.localSrc ?? (audio ? `/api/proto/audio/${turn.id}` : null);

  useEffect(() => {
    const el = audioRef.current;
    const container = waveRef.current;
    if (!el || !container || !audio || audio.peaks.length === 0) return;
    let disposed = false;
    let instance: { destroy: () => void } | null = null;
    void import("wavesurfer.js").then(({ default: WaveSurfer }) => {
      if (disposed) return;
      instance = WaveSurfer.create({
        container,
        media: el,
        peaks: [audio.peaks, audio.peaks.map((v) => -v)],
        duration: audio.durationMs / 1000,
        waveColor: "#8A6520",
        progressColor: "#E8A94B",
        height: 44,
        barWidth: 2,
        barGap: 1,
        barRadius: 1,
        cursorWidth: 0,
      });
    });
    return () => {
      disposed = true;
      instance?.destroy();
    };
  }, [audio, turn.id]);

  useEffect(() => {
    const el = audioRef.current;
    const words = turn.words;
    if (!el || !words || !isPlaying) return;
    let frame = 0;
    const loop = () => {
      const t = el.currentTime;
      let index = -1;
      for (let i = 0; i < words.length; i++) {
        if (t >= words[i].start && t < words[i].end) {
          index = i;
          break;
        }
      }
      setActiveWord((prev) => (prev === index ? prev : index));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, turn.words]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      onRequestPlay(turn.id);
      el.playbackRate = speed;
      el.preservesPitch = true;
      void el.play();
    } else {
      el.pause();
    }
  }

  const isLocal = turn.id.startsWith(LOCAL_PREFIX);

  let transcript: React.ReactNode;
  if (turn.kind === "text") {
    transcript = <p className="transcript">{turn.body}</p>;
  } else if (turn.status === "ready" && turn.body) {
    transcript = turn.words ? (
      <p className="transcript">
        {turn.words.map((w, i) => (
          <span key={`${i}-${w.start}`} className={`w${i === activeWord ? " on" : ""}`}>
            {w.word}{" "}
          </span>
        ))}
      </p>
    ) : (
      <p className="transcript">{turn.body}</p>
    );
  } else if (turn.status === "processing") {
    transcript = (
      <p className="transcript muted">
        {isLocal ? "Saving…" : transcription ? "Transcribing…" : "Saving…"}
      </p>
    );
  } else {
    transcript = (
      <p className="transcript muted">{turn.note ?? "Transcript unavailable. Audio intact."}</p>
    );
  }

  return (
    <li className={`turn${isPlaying ? " is-playing" : ""}`}>
      <div className="turn-head">
        <span className="who">{turn.author}</span>
        <span>{when(turn.createdAt)}</span>
        <span className="badge">{turn.kind}</span>
        {turn.status !== "ready" && <span className={`badge ${turn.status}`}>{turn.status}</span>}
      </div>

      {parent && (
        <div className="turn-parent">
          Reply to <span className="who">{parent.author}</span>: {snippet(parent)}
        </div>
      )}

      {transcript}

      {audio && src && (
        <div className="player">
          <button
            type="button"
            className="icon-btn"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <div className="wave" ref={waveRef} aria-hidden="true" />
          <span className="time">
            {clock(position * 1000)} / {clock(audio.durationMs)}
          </span>
          <audio
            ref={(el) => {
              audioRef.current = el;
              registerAudio(turn.id, el);
            }}
            src={src}
            preload="none"
            onPlay={() => onPlayState(turn.id, true)}
            onPause={() => onPlayState(turn.id, false)}
            onEnded={() => onEnded(turn.id)}
            onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
          />
        </div>
      )}

      <div className="turn-actions">
        {!isLocal && (
          <button type="button" onClick={onReply}>
            reply
          </button>
        )}
        {onRetry && turn.status === "unavailable" && (
          <button type="button" onClick={onRetry}>
            retry upload
          </button>
        )}
      </div>
    </li>
  );
}

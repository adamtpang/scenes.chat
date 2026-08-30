"use client";

import { useState } from "react";

type State = "idle" | "sending" | "done" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending" || state === "done") return;

    setState("sending");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setState("done");
        setMessage("You're on the list. I'll be in touch before the first scene.");
        return;
      }

      setState("error");
      setMessage(
        data?.error ??
          "Something went wrong. Email adamtpang@gmail.com and I'll add you by hand.",
      );
    } catch {
      setState("error");
      setMessage(
        "Couldn't reach the server. Email adamtpang@gmail.com and I'll add you by hand.",
      );
    }
  }

  return (
    <form className="signup" onSubmit={onSubmit}>
      <div className="row">
        <input
          type="email"
          required
          placeholder="you@wherever.com"
          aria-label="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "sending" || state === "done"}
        />
        <button type="submit" disabled={state === "sending" || state === "done"}>
          {state === "done"
            ? "You're in"
            : state === "sending"
              ? "Adding…"
              : "Get an invite"}
        </button>
      </div>
      <p
        className={`note${state === "done" ? " ok" : ""}${state === "error" ? " err" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message ||
          "First scenes run soon. No spam, no launch sequence — one email when there's a seat."}
      </p>
    </form>
  );
}

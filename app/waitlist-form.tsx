"use client";

import { useState, type FormEvent } from "react";

type State = "idle" | "sending" | "done" | "error";

export default function WaitlistForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending" || state === "done") return;

    setState("sending");
    setMessage("");

    try {
      const form = new FormData(event.currentTarget);
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          deepIn: form.get("deepIn"),
          topics: form.get("topics"),
          slot: form.get("slot"),
          language: form.get("language"),
          wants: form.get("wants"),
          isAdult: form.get("isAdult") === "yes",
          company: form.get("company"),
        }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));

      if (res.ok) {
        setState("done");
        setMessage(
          "Application saved. You'll get one email when there's a pilot seat.",
        );
        return;
      }

      setState("error");
      setMessage(
        data.error ?? "Something went wrong. Please try again in a little while.",
      );
    } catch {
      setState("error");
      setMessage("Couldn't reach the server. Please try again in a little while.");
    }
  }

  return (
    <form className="signup" id="apply" onSubmit={onSubmit}>
      <div className="signup-head">
        <p className="eyebrow">Apply for a pilot seat</p>
        <p className="small faint">
          Two minutes. These answers are used only to form a small group—never
          to make a public profile.
        </p>
      </div>

      <fieldset disabled={state === "sending" || state === "done"}>
        <div className="field full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@wherever.com"
          />
        </div>

        <div className="field full">
          <label htmlFor="deepIn">What are you deep in right now?</label>
          <input
            id="deepIn"
            name="deepIn"
            type="text"
            required
            maxLength={160}
            placeholder="Learning to cook Thai food, shipping a side project…"
          />
        </div>

        <div className="field full">
          <label htmlFor="topics">
            Two or three things you could talk about for an hour
          </label>
          <input
            id="topics"
            name="topics"
            type="text"
            required
            maxLength={240}
            placeholder="urban design, weird films, running"
            aria-describedby="topics-hint"
          />
          <span className="hint" id="topics-hint">
            Separate them with commas.
          </span>
        </div>

        <div className="field">
          <label htmlFor="slot">Best weekly time</label>
          <select id="slot" name="slot" required defaultValue="">
            <option value="" disabled>
              Choose a slot
            </option>
            <option value="sgt">20:00 Singapore</option>
            <option value="cet">20:00 Central Europe</option>
            <option value="et">20:00 US Eastern</option>
            <option value="flexible">Any of these</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="language">Conversation language</label>
          <input
            id="language"
            name="language"
            type="text"
            required
            maxLength={40}
            defaultValue="English"
            autoComplete="language"
          />
        </div>

        <div className="field full">
          <label htmlFor="wants">What do you want from a scene?</label>
          <select id="wants" name="wants" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            <option value="learn">To learn something</option>
            <option value="build">To build something</option>
            <option value="company">Just people to talk to</option>
          </select>
        </div>

        <div className="trap" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <label className="check full">
          <input name="isAdult" type="checkbox" value="yes" required />
          <span>I&apos;m 18 or older and can join a 45-minute pilot call.</span>
        </label>

        <button className="full" type="submit">
          {state === "done"
            ? "Application saved"
            : state === "sending"
              ? "Saving…"
              : "Request a seat"}
        </button>
      </fieldset>

      <p
        className={`note${state === "done" ? " ok" : ""}${state === "error" ? " err" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message ||
          "Pilot seats are 18+. No spam or launch sequence—one email when there's a match."}
      </p>
    </form>
  );
}

import WaitlistForm from "./waitlist-form";

const steps = [
  {
    t: "Tell us what you're into",
    d: "Two minutes. What you're deep in right now, what you'd talk about for an hour unprompted, roughly when you're awake. No profile, no photo, no bio, nothing to perform.",
  },
  {
    t: "Get placed",
    d: "You don't browse a directory of rooms hoping one wants you. Once a week, at the same time, you get put in a small room with a handful of people who should know you.",
  },
  {
    t: "Talk, with a script",
    d: "Forty-five minutes of questions designed to skip the small talk. It's a real protocol, not icebreakers — and it ends with everyone saying what they already like about everyone else. Then the scene keeps going on its own time.",
  },
];

const experiments = [
  {
    t: "Drop into a call",
    d: "Something like Omegle, except you're not alone with one stranger and there's a reason you were put together.",
  },
  {
    t: "Meet before dating",
    d: "Know someone as a person in a group first. Decide about anything else later, if at all.",
  },
  {
    t: "Scenes that cowork",
    d: "The same few people, same hours, quietly working. Company without small talk.",
  },
  {
    t: "Scenes that play",
    d: "A group formed around a game, staying together after the game ends.",
  },
];

const lessons = [
  {
    who: "Airchat",
    what: (
      <>
        Voice social with real conversation quality, dead in seven months.{" "}
        <b>There was no cheap way to take part</b> — if recording your voice is
        the only door in, the ninety percent who normally read and never post
        just leave. Here, a text reply counts the same as a spoken one.
      </>
    ),
  },
  {
    who: "Clubhouse",
    what: (
      <>
        Its founder&apos;s own retrospective: <b>&ldquo;we grew way, way too
        fast.&rdquo;</b> Removing the invite gate is the moment he names. Scenes
        grows by splitting into new rooms, never by adding people to yours.
      </>
    ),
  },
  {
    who: "Amino",
    what: (
      <>
        It solved stranger-discovery with a browsable directory of millions of
        micro-communities, and the directory became the problem.{" "}
        <b>There is no directory here</b>, and there never will be.
      </>
    ),
  },
  {
    who: "Path",
    what: (
      <>
        Capped friends at fifty, then a hundred and fifty, then raised the cap
        under pressure and died. <b>A number was never the mechanism.</b> What
        matters is whether you keep running into the same people.
      </>
    ),
  },
];

export default function Home() {
  return (
    <div className="wrap">
      <header className="hero">
        <div className="mark">
          <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          scenes
        </div>

        <h1>
          The internet gave everyone an audience and forgot to give them{" "}
          <em>friends</em>.
        </h1>

        <div className="prose">
          <p className="lede">
            Scenes puts you in a small room with a few people who should know
            you, and gives you something real to talk about. Not a feed. Not a
            directory. Not another place to have followers.
          </p>
        </div>

        <WaitlistForm />
      </header>

      <section>
        <div className="sec-head">
          <p className="eyebrow">How a scene works</p>
          <h2>You get placed, not shown a list</h2>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={s.t}>
              <span className="n">{i + 1}</span>
              <div className="c">
                <span className="t">{s.t}</span>
                <span className="d">{s.d}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="sec-head">
          <p className="eyebrow">What we&apos;re trying</p>
          <h2>A scene is a small group of people. What they do is open.</h2>
        </div>
        <div className="exps">
          {experiments.map((e) => (
            <div className="exp" key={e.t}>
              <span className="t">{e.t}</span>
              <span className="d">{e.d}</span>
            </div>
          ))}
        </div>
        <div className="prose" style={{ marginTop: 22 }}>
          <p className="small faint">
            We genuinely don&apos;t know which of these works yet. That&apos;s
            the honest state of it — the plan is to try a lot of them quickly
            with real people and keep whatever produces friendships.
          </p>
        </div>
      </section>

      <section>
        <div className="sec-head">
          <p className="eyebrow">What we learned from the ones that died</p>
          <h2>Everyone who tried this before got something specific wrong</h2>
        </div>
        <div className="lessons">
          {lessons.map((l) => (
            <div className="lesson" key={l.who}>
              <span className="who">{l.who}</span>
              <span className="what">{l.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="sec-head">
          <p className="eyebrow">The bet</p>
          <h2>Small, closed, and warm beats big, open, and cold</h2>
        </div>
        <div className="prose stack">
          <p>
            The research on this is unusually clear. People get attached to
            groups in two different ways — to the <em>topic</em>, or to the{" "}
            <em>people</em>. Attachment to people is what makes somebody say the
            true thing instead of the impressive thing. It is also fragile: it
            needs a small room, repeated contact, and no stream of strangers
            arriving.
          </p>
          <p>
            So Scenes doesn&apos;t try to be findable. It forms new rooms
            instead of filling old ones, which means nobody has to break into a
            group that already exists, and nobody&apos;s group gets diluted by
            someone they didn&apos;t choose.
          </p>
          <p className="small faint">
            Everything here is early and made by one person. If it sounds like
            something you want, the most useful thing you can do is get on the
            list and then actually show up to the first one.
          </p>
        </div>
        <div style={{ marginTop: 26 }}>
          <a className="cta" href="#apply">
            Apply for a pilot seat
          </a>
        </div>
      </section>

      <footer>
        <p className="small faint">
          scenes.chat — an experiment in making internet friendship feel human.
        </p>
      </footer>
    </div>
  );
}

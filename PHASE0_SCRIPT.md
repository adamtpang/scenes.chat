# Phase 0 forming script (fast-friends-v1)

This is the host. Read it aloud, word for word, on a plain video or voice call.
Nothing else in the product exists yet, and nothing else should until this has
run six times. See `SPEC.md` section 4.4 and section 8.

Source protocol: Aron, Melinat, Aron, Vallone and Bator (1997), the escalating
self-disclosure task usually called Fast Friends. Prompts below are lifted or
lightly adapted from that set, cut from 36 questions to 6 so that five people
can each answer every prompt inside 45 minutes. Sprecher (2021) found the
protocol works the same over video as in person, so a call is a fair test.

## The one question this script tests

Does a scripted 45-minute session between five strangers produce a group that
is still talking, unprompted, two weeks later?

Pass criterion, decided before the first run so it cannot drift:

- A cohort **passes** if, in the 7 days ending on day 14, at least 3 of the
  members posted in the group chat without Adam prompting them.
- A cohort **fails** otherwise. Adam posting does not count. Replies to Adam
  do not count.
- Phase 0 **passes** if 4 of 6 cohorts pass. Then Phase 1 may start.
- Phase 0 **fails** if 3 or more cohorts fail. Then change the script, not the
  software, and run six more.

## Seats and timing

- Target 5 in the room. Confirm 7, because two will not show.
- If 6 show, run it as written. If 4 show, run it as written.
- If fewer than 3 show, do not run it. Reschedule those people into the next
  week's room and say so plainly.

Turn caps are ceilings, not targets. Most answers run about 60 percent of cap.

| Segment | Prompts | Cap per person | Max at 5 people |
|---|---|---|---|
| Host open | 0 | | 2:00 |
| Round 1 | 3 (first is 30s) | 60s | 12:30 |
| Round 2 | 2 | 90s | 15:00 |
| Round 3 | 1 | 120s | 10:00 |
| Closing round | 1 | 60s | 5:00 |
| Host close | 0 | | 1:00 |
| **Total at every cap** | | | **45:30** |

At 6 people the ceiling is about 54 minutes. Tell a room of 6 that you will
hold to 45 and cut the second Round 2 prompt if Round 1 runs past 15:00.

## Rules the host enforces

1. Everyone answers every prompt, in order, before the next prompt is read.
2. Turn order is fixed for the session. The person who starts rotates one seat
   forward each prompt, so nobody always goes first or always goes last.
3. No cross-talk during a turn. Reactions wait until the round ends.
4. No advice. If someone shares a problem, the response is not a fix.
5. One pass allowed per person for the whole session. Say "pass" and the turn
   moves on. Nobody asks why.
6. The host keeps time out loud: "fifteen seconds" at fifteen seconds left.
7. This is friendship formation, not dating. Say it once in the open and do
   not bring it up again.

## Host lines

Read these. Do not improvise the framing; the framing is the intervention.

### Open (2 minutes)

> Hi, I'm Adam. Thanks for showing up. There are [N] of us. I'm going to be the
> timekeeper, not a participant.
>
> Here is what we're doing. I'll read a question. Everyone answers it, one at a
> time, in an order I'll give you. Then I read the next one. There are six
> questions and they get more personal as we go. That escalation is the whole
> point: it is a real protocol from friendship research, not icebreakers, and
> it works because everyone goes at the same pace.
>
> Three rules. One: no interrupting a turn. Save reactions for the end of the
> round. Two: no fixing. If someone shares something hard, you don't solve it.
> Three: you can pass once, on anything, no explanation.
>
> I'll say "fifteen seconds" when you're close to time. Time caps are 60
> seconds now, 90 later, two minutes at the end.
>
> One more thing. This is about making friends. That is the only thing it is
> about.
>
> Order for the first question is [name], [name], [name], [name], [name]. Each
> question, the person who went first goes last.

### Round 1 (60 second cap; first prompt 30 seconds)

> **Question one, thirty seconds each.** Your name, and one sentence on what
> you're deep in right now. Whatever you wrote on the form is fine, or
> something newer.

> **Question two, sixty seconds.** Given the choice of anyone in the world,
> living or dead, who would you want as a dinner guest, and what would you
> want to ask them?

> **Question three, sixty seconds.** What would a perfect day look like for
> you? Not a vacation day. An ordinary day that went completely right.

> That's round one. Thirty seconds if anyone wants to react to anything you
> heard. [Wait. At thirty seconds:] Okay. Round two. The cap goes up to ninety
> seconds, and the order shifts one forward.

### Round 2 (90 second cap)

> **Question four, ninety seconds.** Is there something you've wanted to do
> for a long time and haven't done? What is it, and why haven't you?

> **Question five, ninety seconds.** What is your most treasured memory? Tell
> us the scene, not just the label.

> That's round two. Thirty seconds to react. [Wait.] Last round. Two minutes
> each. Order shifts again.

### Round 3 (120 second cap)

> **Question six, two minutes.** Finish this sentence, then keep going for as
> long as you want up to the cap: "I wish I had someone I could share..."

> [When the last person finishes, do not fill the silence immediately. Count to
> three.] Thank you. That's the last question. One more round, and it's a
> different kind.

### Closing round (60 second cap per person)

> **Closing round.** Go around the same order. For each of the other people in
> the room, say one thing you already like about them. Be honest and specific.
> Something they actually said tonight, not a compliment you'd give anyone.
> About fifteen seconds per person, a minute total.

### Close (1 minute)

> That's the session. Here is what happens next. In the next ten minutes I'll
> add all of you to one group chat, just this [N] of us, on [platform]. It's
> yours. I'll post one thing in it tonight and then I'm going to stay out of
> it. There's nothing you have to do in there. In two weeks I'll check in once,
> by message, to ask how it went.
>
> Thanks for doing this. Bye.

Leave the call first. Do not linger. Lingering makes it a hosted room instead
of their room.

## Before the session (Adam does these by hand)

**7 days before:** pick 7 from the intake export. Same slot, same language,
no two people with the same "deep in." That is the whole matching rule.

```bash
npm run intake:export
```

**24 hours before:** send the staged reveal and the confirm request. One email
per person, no names of the others in it. Adam sends it himself.

> Subject: Your scene is tomorrow, [day] at [time] [zone]
>
> There are [N] of you. [Aggregate only: e.g. "Three continents. Two are
> building something, one is studying, two just want people to talk to.
> Everyone picked English."]
>
> Reply YES to confirm your seat. Unconfirmed seats go to someone else at
> [time] tomorrow. Link and the questions come by reply.

Backfill any unconfirmed seat from the next best intake row.

**1 hour before:** send the call link to confirmed people only.

**Within 10 minutes after:** create the group chat, add everyone, post exactly
one message and nothing after it for 14 days:

> This is your scene. Nobody else will ever be added. It's yours now.

## Run log

Fill this in the same day. Six runs, then decide. Do not round up.

| Run | Date | Slot | Confirmed | Showed | Ran? | Group chat created | Day 14 date | Posts by members in days 8 to 14 | Members who posted | Pass? | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | /7 | | | | | | /5 | | |
| 2 | | | /7 | | | | | | /5 | | |
| 3 | | | /7 | | | | | | /5 | | |
| 4 | | | /7 | | | | | | /5 | | |
| 5 | | | /7 | | | | | | /5 | | |
| 6 | | | /7 | | | | | | /5 | | |

Notes column: what broke, which prompt landed, which prompt died, whether
anyone hit a cap, whether the closing round felt forced. This is the only
product feedback that matters until Phase 1.

## What to change if it fails

Change one thing per run, in this order, and log it:

1. The Round 3 prompt. It carries the most weight and is the most likely to
   misfire with strangers.
2. Headcount. Try 6 confirmed of 8.
3. The closing round wording.
4. The group chat's first message.

Do not change the caps, the order rule, or the no-fixing rule. Those are the
protocol.

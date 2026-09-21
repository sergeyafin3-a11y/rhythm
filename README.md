# Rhythm

A personal app: habits, yoga every day, English speaking practice and the
Armenian driving-theory course. One HTML file plus its content files; everything you do
stays on the phone itself.

## Live

**https://sergeyafin3-a11y.github.io/rhythm/**

Repository: https://github.com/sergeyafin3-a11y/rhythm — public, GitHub Pages
serving `main` / root.

### Publishing a change

Edit the files here, then on GitHub: **Add file → Upload files**, drop the changed
file in, **Commit changes**. The site updates in about a minute.

## Add it to the home screen

- **iPhone (Safari):** open the address → Share → *Add to Home Screen*.
- **Android (Chrome):** open the address → menu ⋮ → *Install app*.

## What is inside

| Tab | What it does |
|---|---|
| Today | The day's to-do card, today's yoga (or the pool), and the habits — grouped into **Morning · Day · Evening**. Every tick sets off a full-screen firework |
| To-do | Tasks that are not habits — a call, an appointment, a bill. Quick-add at the top, optional day and time, grouped into Overdue · Today · Tomorrow · Later · No date |
| English | **Speak** — the speaking roulette: a topic, a minute, a recording, then the language you could have used. **Saved words** — the phrases you kept from it |
| Practice | **Driving theory** — the interactive textbook and the official Armenian question bank. **Diction** — ten minutes of Russian speech practice a day |
| 🧘 Yoga | A card on Today opens the **yoga** page: the focus of the day, a practice already chosen, forty more to pick from, ten minutes for the neck — and on Wednesdays the pool instead |

## Files

- `index.html` — the whole app
- `pdd/q.json` — the official question bank, 1030 questions
- `pdd/learn.json` — the driving-theory textbook: 10 chapters, 82 lessons, and an explanation for every question
- `pdd/img/` — 662 pictures from the official tickets
- `english/talk.json` — 200 speaking topics with a model answer and nine phrases each
- `manifest.json` — name and icon on the home screen
- `sw.js` — works without internet
- `icon-*.png` — icons

## Driving theory

The course for the Armenian category B theory exam, in Russian. **The textbook comes first:**
the daily questions only draw on the lessons already finished.

**The textbook** — 10 chapters in learning order: terms → traffic lights and the officer →
road signs → markings, stopping and parking → manoeuvres → junctions → overtaking and signals →
speed, towing and loads → vehicle faults → first aid. Every lesson is 3–8 minutes: short rules
in plain Russian, key numbers highlighted, diagrams whose numbered markers open an explanation
when tapped, tap-to-reveal cards, "Remember" and "Exam trap" boxes, and real ticket questions
answered inside the lesson.

Press **Got it** and that lesson's questions join the daily practice. Every one of the 1030
questions belongs to exactly one lesson and carries a short explanation of why the official
answer is right; get one wrong in practice and the explanation appears with a link back to
its lesson.

**Practice** — 15 questions a day (your mistakes first, then ones you have not seen),
practice by chapter or by single lesson, a Mistakes list that empties as you answer correctly,
and an exam ticket: 20 random questions, 30 minutes, at most two mistakes, answers only at the end.

Source: the Road Police of Armenia bank ([roadpolice.am](https://roadpolice.am/en/viv-exam)),
in Russian. Everything the lessons teach comes from those official answers. Two questions are
missing an answer in the source PDFs and were left out.

## Speaking roulette

English → **Speak**. Spin the wheel: one of 200 topics comes up. Tap **Start** and the minute
counts down while the phone records you — the first take is deliberately without any help.

Afterwards the app shows how the answer could have sounded: a model monologue with nine
phrases highlighted by level — **B1** green, **B2** amber, **C1** rose. Tap a highlighted
phrase and its card opens: what it means, a Russian equivalent, and another example. Then a
three-step plan and a second take with the phrases in front of you. Both takes play back side
by side; nothing is uploaded or saved anywhere.

Mark the topic **Done** and it leaves the wheel for good. The topics you have spoken stay in a
list you can reopen.

## Saved words

The **+** on any phrase card keeps it, with its meaning, its Russian equivalent and the
example sentence — the app highlights the phrase inside that sentence, placeholders and all, so
*to keep someone posted* lights up inside *"I will keep you posted…"*. **Hide meanings** blurs
the backs of the cards so you can test yourself; tap a card to check.

## Diction

Practice → **Diction**. Ten minutes a day in Russian: an articulation warm-up, the video of
the day from a speech teacher, and three tongue twisters, each said three ways. A week strip
shows what you have done.

## Neck and posture

Ten minutes inside every workout day: six exercises, a video of the day, and a note that pain
which is there almost all the time belongs to a doctor, not to an app.

## Themes and typefaces

The very first screen asks you to choose. Six themes — Greenhouse, Midnight, Peach,
Risograph, Dusk, Charcoal — and seven typeface pairs, set separately from the theme,
so any pair sits on any palette. Everything changes live as you tap.

Afterwards: Settings → Theme, and Settings → Typeface.

## The habits it starts with

Speak English for a minute · Learn 7 new words · Eight glasses of water ·
Meditate for 5 minutes · Yoga · 20 pages of a book · Face massage · Foot cream · Thigh roller

Each habit belongs to a time of day — Morning, Day or Evening — and the Today list is grouped
under those three headings. Change it in the habit editor, delete any of them, or add more from
the library of ready-made habits.

## To-do

Habits repeat; tasks do not, so they live apart. Type into the field at the top and it lands
on today. Tap the task to give it a day, a time and a note — or leave it undated.

The list groups itself: **Overdue · Today · Tomorrow · Later · No date yet**. Overdue is
flagged in red, timed tasks sort by the clock, and finished ones drop to the bottom with the
text struck through. Whatever is still open today also shows on the Today screen.

## Yoga

A coach’s plan instead of a library: one session a day, chosen in advance, never
shorter than 15 minutes. Four stages of seven sessions — **Foundation** (15–22 min),
**Build** (16–32), **Strong** (28–44), **Deep** (38–57) — for four goals: stamina,
flexibility, a lighter and stronger body, a calmer head. Each session comes with a short
note on what it is for.

The plan moves only when a session is marked done, never by the calendar, so a missed day
costs nothing. After session 28 round two begins. **Wednesday is the pool**: one button,
and the session waits for Thursday (or can be done the same day).

Every video was opened on YouTube: the channel and the running time are the real ones.
Ten minutes for the neck sit inside every day.

## Face massage

Tap the *Face massage* habit and five follow-along routines open under it — three gua sha,
two hands-only lymphatic drainage, 5–11 minutes, all from one Russian-speaking facialist so
the routine stays the same every day.

## Fireworks

Every completed habit fires a burst that spreads across the whole screen, drawn on a
dimmed backdrop with additive blending so the sparks glow on any theme. Closing the
last habit of the day sets off a seven-burst show with a fanfare — the sound is
synthesised with the Web Audio API, so there are no audio files and it works offline.

Settings → Fireworks sound to silence it. It also respects the system
"reduce motion" setting: no animation when that is on.

## Data

Habits, check-ins, to-dos, yoga days, saved words, lessons finished and
questions answered live in `localStorage` on the device. Voice recordings are never stored:
they exist only until you leave the topic. Backup: Settings → Backup.

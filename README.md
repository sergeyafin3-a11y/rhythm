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
| Today | The day’s to-do card, the food card, the daily check-in and the habits — grouped into **Morning · Day · Evening**. Every tick sets off a full-screen firework |
| To-do | Tasks that are not habits — a call, an appointment, a bill. Quick-add at the top, optional day and time, grouped into Overdue · Today · Tomorrow · Later · No date |
| English | **Speak** — the speaking roulette: a topic, a minute, a recording, then the language you could have used. **Saved words** — the phrases you kept from it |
| Practice | **Driving theory** — the interactive textbook and the official Armenian question bank. **Diction** — ten minutes of Russian speech practice a day |
| 🧘 Yoga | Tap the *Yoga* habit: today’s session opens right under it — one practice, 20 minutes or more, in an endless plan. Wednesday is the pool |

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

Every word of the model answer can be tapped: its Russian meaning in that very sentence, and a **+** to
keep it. Each recording can be saved or sent — to ChatGPT, Claude or a friend — with a ready request
for feedback; an optional live transcript (beta) or keyboard dictation turns the answer into text.

Mark the topic **Done** and it leaves the wheel for good. It also ticks the *Speaking spin* habit, which opens
straight into the roulette. The topics you have spoken stay in a
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

Yoga lives inside the *Yoga* habit: tap it and today’s session opens under it — one
practice, never shorter than 20 minutes, chosen in advance. The plan alternates
🔥 intense · 🌿 easy-going · 🔥 intense · 🌤 steady · 🌤 steady · 🌿 easy-going, so hard days never
pile up, and easy-going still means moving the whole time — no yin, no lying about.

It never runs out: 45 videos (15 of each kind, Russian and English, 20–57 minutes), each kind
in its own rotation, and fresh videos join the rotation as they are added. The session number
simply keeps counting. Ticking the habit — or **Done** on the session — moves the plan on;
unticking steps it back, so a missed day costs nothing. **Wednesday is the pool**: the habit
means a swim that day, with yoga instead if you want it.

Every video was opened on YouTube: the channel and the running time are the real ones.

## Daily check-in

Two minutes of taps on Today: mood, energy, last night’s sleep, the single-item stress measure
(Elo et al., 2003) and the ten feelings of the international PANAS short form (Thompson, 2007) —
positive and negative affect, 5–25 each. Every two weeks the WHO-5 Well-Being Index (0–100) is added.
The trends page shows the last 14 days, this week against the last, and — once there is enough data —
how yoga, sleep, food and speaking go with mood and energy. A self-check, not a diagnosis; very low
WHO-5 scores or many heavy days bring a gentle suggestion to talk to someone.

## Food

A card on Today: calories left for the day and a line to write what you ate, the way you would
in a note — «гречка 150 г, 2 яйца, огурец», «кофе с молоком», «горсть орехов». The app finds
each food by its stem (so any Russian case works, English too), reads the amount from г, мл,
шт, ст.л., ч.л., стакан, горсть, тарелка or a plain number, and uses a usual portion when
there is none. «с» splits a dish into its parts: «творог со сметаной» is two lines.

About 200 foods, vegetarian-friendly and local — matsoni, tan, Lori and Chanakh cheese, lavash,
gata — with calories and protein per 100 g from standard tables. A food it doesn’t know is
marked **?**: tap it, give the calories per 100 g once, and it is remembered.

The target comes from a standard formula (Mifflin–St Jeor): resting burn from age, height and
weight, times activity, minus 10% or 20%, and never below the resting burn. A number of your
own overrides it. The diary page shows the day’s list, a week of bars against the target,
protein, and a weekly weight log. Everything stays on the phone.

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

Habits, check-ins, mood check-ins, to-dos, yoga days, saved words, food diary and weight, lessons finished and
questions answered live in `localStorage` on the device. Voice recordings are never stored:
they exist only until you leave the topic. Backup: Settings → Backup.

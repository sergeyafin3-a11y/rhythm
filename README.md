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
| Today | The **word test** on top, the day’s to-do card and the habits — grouped into **Morning · Day · Evening**. Every tick sets off a full-screen firework |
| To-do | Tasks that are not habits — a call, an appointment, a bill. Quick-add at the top, optional day and time, grouped into Overdue · Today · Tomorrow · Later · No date |
| English | **Speak** — the speaking roulette: a topic, a minute, a recording, then the language you could have used. **Saved words** — the phrases you kept from it |
| Practice | **Driving theory** — the interactive textbook and the official Armenian question bank. **Diction** — ten minutes of Russian speech practice a day |
| 🧘 Yoga | Tap the *Yoga* habit: four choices open under it — 🌿 15–25, 🌤 26–35, 🔥 36–45 minutes, or 🏊 the pool on any day. They change the moment you mark one done |

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

## Winter Arc

The plan from **4 October to 31 December**. A card at the top of *Today* shows *Day N of 89* and opens the Arc:
a **habit tracker** — this week as a grid, and the whole Arc as one square per day, darker when more got done — and the
**Wednesday check-in**.

Two habits are added when the Arc starts: *Walk 15–20 minutes* and *Keep a journal*. Both are daily, one tick each. Delete either
and it stays deleted. Yoga stays the daily base, and the strength comes from the strength-focused yoga classes.

**Check-in** (opens from Wednesday until done, two minutes): energy, body, calm and home on a 1–5 scale and one line in your own
words. It answers with one small focus for next week.

No points, no streak numbers, no scale and no tape measure — only what was done and how it felt.

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

You can also type in a word of your own with **+ Add** — the word, what it means, an optional example.
The **+** on any phrase card keeps it, with its meaning, its Russian equivalent and the
example sentence — the app highlights the phrase inside that sentence, placeholders and all, so
*to keep someone posted* lights up inside *"I will keep you posted…"*. **Hide meanings** blurs
the backs of the cards so you can test yourself; tap a card to check.

## Word test

On top of *Today*: five questions a day, built **only from the words you saved yourself** — in the roulette or typed in by hand.
Some ask what a word means, some give a sentence with the word missing. A word you get right comes back less often; a wrong one comes back sooner.
It appears once you have four words. The old mood check-in card is gone; what you answered before stays stored on the device.

## Diction

Practice → **Diction**. Ten minutes a day in Russian: an articulation warm-up, the video of
the day from a speech teacher, and three tongue twisters, each said three ways. A week strip
shows what you have done.

## Themes and typefaces

The very first screen asks you to choose. Eight themes — Greenhouse, Midnight, Peach,
Risograph, Dusk, Charcoal and the two winter ones, **Frost** (icy and bright) and **Aurora** (a winter night with northern lights) — and seven typeface pairs, set separately from the theme,
so any pair sits on any palette. Everything changes live as you tap.

Afterwards: Settings → Theme, and Settings → Typeface.

## The habits it starts with

Speak English for a minute · Learn 7 new words (one tick when you have learned them) · Eight glasses of water (one tick when you have drunk them) ·
Meditate for 5 minutes · Yoga · 20 pages of a book · Face massage · Foot cream · Thigh roller — and, from the Winter Arc,
Walk · Keep a journal

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

Yoga lives inside the *Yoga* habit: tap it and **four choices** open under it, by how much you have in
you — 🌿 **low energy** 15–25 min, 🌤 **medium** 26–35, 🔥 **ready to work** 36–45 — and 🏊 **the pool**,
available any day of the week. The short and medium ones are never the intense classes; the long ones are
never the gentlest. Wednesday just says so on the pool card; it is a note, not a rule.

**The videos change the moment you finish one, not at midnight.** Tick the habit — or press **Done** on a
card — and that band moves on straight away, so a practice at one in the morning still leaves something
new underneath it. Go twice in a day and the second session gets its own video; *undo* on the last line
takes it back, and unticking the habit clears the day.

75 videos in Russian and English, all between 17 and 45 minutes for the three bands, **16 of them strength-focused**
(core, back, arms, legs — spread evenly through each band, the first one within the first few picks). A video she has already done
is skipped until she has been through the whole band, with a fresh batch
added automatically once a month. Every id was opened on YouTube: the channel and the running time are
the real ones. No yin, no lying-down classes — she stretches on her own. **Nothing for beginners either**:
no class whose title says «для начинающих», «с нуля» or «beginner» — all levels and intermediate only.

## Face massage

Tap the *Face massage* habit and **five follow-along routines** open under it, drawn from a pool of 15 —
**gua sha only**, each **7 to 12 minutes**, Russian and English, from several different teachers. **The five change the moment you tick the habit**, however late at night that is, so the set in
front of you is never the one you have just done.

## Fireworks

Every completed habit fires a burst that spreads across the whole screen, drawn on a
dimmed backdrop with additive blending so the sparks glow on any theme. Closing the
last habit of the day sets off a seven-burst show with a fanfare — the sound is
synthesised with the Web Audio API, so there are no audio files and it works offline.

Settings → Fireworks sound to silence it. It also respects the system
"reduce motion" setting: no animation when that is on.

## When the day turns over

The day changes at **4 a.m.**, not at midnight. A habit ticked at 1 a.m. counts for the day you have not slept off yet,
and the date at the top shows that day.

## Data

Habits, to-dos, word-test progress, yoga days, saved words, lessons finished and
questions answered live in `localStorage` on the device. Voice recordings are never stored:
they exist only until you leave the topic. Backup: Settings → Backup.

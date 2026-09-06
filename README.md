# Rhythm

A personal app: habit tracker, a daily English affirmation with ten phrases,
and a recipe book. One HTML file, everything stored on the phone itself.

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
| Today | Your **why** at the top, the day ring, the affirmation, and the habits — split into **Morning · Day · Evening**. Every tick sets off a full-screen firework |
| + Add | A library of ready-made habits in 11 categories, searchable, one tap to add — or write your own |
| 🏋️ Workout | A card on Today opens a full **Workouts** page: today's focus, five matching videos, filters by length and energy, and one tap to log it |
| English | Two halves. **Daily pack** — the affirmation and ten useful phrases, 30 topics in rotation. **My words** — your own vocabulary: each word saved with the sentence you met it in, plus a recall drill |
| Rhythm | Eight-week calendar per habit, totals, longest streak |
| Rewards | Achievements, and rewards you promise yourself |
| Recipes | 23 recipes across 8 courses — Breakfast, Soups, Salads, Snacks, Mains, Baking, Desserts, Drinks. Search, photos, tappable ingredients, numbered steps |

## Files

- `index.html` — the whole app
- `manifest.json` — name and icon on the home screen
- `sw.js` — works without internet
- `icon-*.png` — icons

## Themes and typefaces

The very first screen asks you to choose. Six themes — Greenhouse, Midnight, Peach,
Risograph, Dusk, Charcoal — and seven typeface pairs, set separately from the theme,
so any pair sits on any palette. Everything changes live as you tap.

Afterwards: Settings → Theme, and Settings → Typeface.

## The habits it starts with

One English article + new words · Learn 7 new words · 20 pages of a book ·
Meditate for 5 minutes · Yoga · Face massage · Eight glasses of water ·
Cold shower in the morning · Under 2 hours of games · Lights out by 1:30 ·
Foot cream · Thigh roller · A morning without the phone ·
Ask one question a day · No snapping, no grumbling

Each habit belongs to a time of day — Morning, Day or Evening — and the list on the
Today tab is grouped under those three headings. Change it in the habit editor.

Delete any of them, change how often, or add more from the library.

## Workouts

The week rotates on its own: **Mon** glutes + legs · **Tue** walking · **Wed** upper body + core ·
**Thu** walking · **Fri** glutes + legs · **Sat** full body · **Sun** rest. Any day can be
changed by hand, skipped, or turned into a recovery day.

Whatever the focus is, all five options train **the same thing** — they differ only in length
(10 → 45 min), intensity and trainer. Filter by how long you have (≤15 / 20–25 / 30–35 / 40+)
and by how you feel (no energy / normal / plenty) — the mood filter re-sorts the list, it never
hides anything.

Tapping **Start** opens the video on YouTube; **Done** logs which workout you did and how long
it took, and closes the "Workout" habit for the day. The page keeps a weekly count: workouts,
minutes, strength vs cardio, and a seven-day strip.

39 real YouTube videos are built in, with thumbnails pulled from the video id. If a video ever
disappears the card falls back to an emoji tile instead of breaking.

**On the wording:** the app never promises fat loss in a particular spot. Training builds the
muscle that shapes a leg or a waist; fat comes down across the whole body, and the descriptions
say so.

## Why

Three things answer the question "what is all this for":

- **Your why** — one sentence you write yourself, sitting at the top of every day.
- **A why per habit** — an optional line on the card, right where you decide whether to skip it.
- **Look how far you have come** — on the Rhythm tab, your history written out in plain
  sentences instead of numbers: days at it, promises kept, longest run, perfect days, words learned.

The day ring also tells you what is still ahead: *4 to go before the evening.*

## My words

Add a word or phrase together with the real sentence you met it in. The app finds that
phrase inside the sentence and highlights it — placeholders work too, so *to keep someone
posted* is found inside *"I will keep you posted…"*.

**Practise** takes ten words, weakest first, blanks the phrase out of its sentence and asks
you to recall it. *I knew it* moves the word up a level (five levels to "known by heart");
*Not yet* sends it back to the start so it comes round sooner.

## Fireworks

Every completed habit fires a burst that spreads across the whole screen, drawn on a
dimmed backdrop with additive blending so the sparks glow on any theme. Closing the
last habit of the day sets off a seven-burst show with a fanfare — the sound is
synthesised with the Web Audio API, so there are no audio files and it works offline.

Settings → Fireworks sound to silence it. It also respects the system
"reduce motion" setting: no animation when that is on.

## Data

Habits, check-ins, rewards, learned phrases and recipes live in `localStorage`.
Recipe photos are kept under a separate key (`ritm.photos.v1`) so a full storage
quota can never block saving your habit progress.
Backup: Settings → Backup.

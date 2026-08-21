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
| Today | The day ring, the affirmation, and the habits — split into **Morning · Day · Evening**. Every tick sets off a full-screen firework |
| + Add | A library of 79 ready-made habits in 11 categories, searchable, one tap to add — or write your own |
| English | Affirmation of the day plus ten useful phrases, 30 topics in rotation |
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

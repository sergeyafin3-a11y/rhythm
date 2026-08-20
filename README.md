# Rhythm

A personal app: habit tracker, a daily English affirmation with ten phrases,
and a recipe book. One HTML file, everything stored on the phone itself.

## Put it on GitHub Pages

1. Create a repository on github.com (for example `rhythm`), public.
2. Upload every file from this folder (**Add file → Upload files**).
3. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)` → Save.
4. A minute later the address is: `https://YOUR-USERNAME.github.io/rhythm/`

## Add it to the home screen

- **iPhone (Safari):** open the address → Share → *Add to Home Screen*.
- **Android (Chrome):** open the address → menu ⋮ → *Install app*.

## What is inside

| Tab | What it does |
|---|---|
| Today | The day ring, the affirmation, and the habits you tick off — each one answered out loud in English |
| + Add | A library of 74 ready-made habits in 11 categories, searchable, one tap to add — or write your own |
| English | Affirmation of the day plus ten useful phrases, 30 topics in rotation |
| Rhythm | Eight-week calendar per habit, totals, longest streak |
| Rewards | Achievements, and rewards you promise yourself |
| Recipes | Search, categories, photos, tappable ingredients, numbered steps |

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
Cold shower in the morning · Under 2 hours of games · Lights out by 1:30

Delete any of them, change how often, or add more from the library.

## Voice

Ticking a habit off plays a short English cheer through the phone's own speech
engine — no internet needed. Settings → Voice to switch it off or pick a different
voice. On iPhone it follows the silent switch.

## Data

Habits, check-ins, rewards, learned phrases and recipes live in `localStorage`.
Recipe photos are kept under a separate key (`ritm.photos.v1`) so a full storage
quota can never block saving your habit progress.
Backup: Settings → Backup.

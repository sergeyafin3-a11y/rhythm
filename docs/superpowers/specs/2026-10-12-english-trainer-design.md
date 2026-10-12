# English trainer, stage 1: spoken phrases that stick

Approved by Natali in chat on 2026-10-12. Stages 2 (mini-dialogues) and 3 (listening) get their own specs.

## Who and why
Natali teaches English to schoolchildren and wants to *speak* it. Level about B2: she reads and
understands, but lacks words and struggles to understand speech by ear. She wants **conversational** English
(real chunks of speech), 15–20 minutes a day, ready-made sets plus her own saved words.

## What stage 1 adds to the English tab
- **Train** (new first segment, now the default): a "15 minutes of English" card, the level check, the sets.
- **250 spoken phrases in 10 sets** (`english/phrases.json`): each has the English chunk, a Russian meaning, an example and its translation.
- **Spaced repetition**: steps 1 · 3 · 7 · 14 · 30 · 60 days. A forgotten phrase returns tomorrow.
  Her own saved words (`state.words`) join the same deck.
- **The session**: review the due phrases (at most 10), meet up to 5 new ones (4 / 5 / 6 after the level check),
  say 3 phrases aloud and hear yourself back (optional). Finishing the cards ticks the existing speaking habit
  (`spTick`), so leaving the optional speaking step never loses the day; no new habit. Her own words are mixed in, one for every two set phrases.
- **Voice**: 🔊 (normal and slow) via the phone's own speech synthesis, **only inside English**, only on a tap.
  With no English voice the app says so.
- **Level check**: 20 multiple-choice questions on natural phrases; sets reorder and new phrases per day adjust. Can be retaken.
- **Focus a set**: tap a set to move it to the front of the queue.

## Data and safety
- Everything new lives in `state.eng` (cards, days, placement, set order), created lazily; habits, XP, logs, words and the
  theme are never touched. It travels with backups. A fresh reset forgets it with everything else.
- Recordings are never stored (same rule as the roulette).
- The logic (steps, plan, level check) is pure and fenced by `/* srs:pure */ … /* srs:end */` and unit-tested.

## Out of scope for stage 1
Mini-dialogues, listening drills, writing, grammar lessons.

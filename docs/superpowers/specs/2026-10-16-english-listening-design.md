# English trainer, stage 3: listening

Approved by Natali in chat (16 Oct 2026). Builds on stage 1 (cards, voice) and stage 2 (dialogues).

## Why
She understands English badly by ear. The phone's own voice reads short texts; she works out what was said.

## What it is
A **round of 8** on the Train hub, in three kinds of task, all spoken by the phone (only on a tap, never by itself):
- **Sound-alikes (5)** — hear a sentence, choose which of three you heard (can/can't, 13/30, has/had, a past or a present …). A short Russian hint explains the trap.
- **Dictation (2)** — hear a sentence, type it. Capitals and punctuation don't matter; a one-letter slip in a long word is forgiven; each spoken word is marked heard or missed, with the Russian meaning.
- **Short message (1)** — a voicemail, an announcement or a few lines of someone's day (about 50–80 words), then two questions. The text can be read afterwards.
Speed chips (Slow / Normal / Fast) set the voice rate; 🐢 Slowly replays any item slower.

## How it learns
Every item is graded once with the same steps as the cards (1·3·7·14·30·60 days; a miss returns tomorrow). A round takes about half its items from those that are due, the rest new ones in her level order (gentle / steady / strong from the level check). Today's rounds and score are shown on the card.

## Data and safety
`english/listening.json` (138 items), lazily loaded; progress in `state.eng.cards['L:<id>']` and `state.eng.lis` (speed, per-day totals). With no English voice the app says so. Pure logic (checking dictation, building a round) is fenced by `/* lis:pure */ … /* lis:end */` and tested.

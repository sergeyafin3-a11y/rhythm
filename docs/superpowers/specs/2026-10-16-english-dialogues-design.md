# English trainer, stage 2: mini-dialogues

Approved by Natali in chat (16 Oct 2026: "делай все и сразу", then "да" for stages 2 and 3). Stage 3 (listening) has its own spec.

## What it is
Short scenes where someone speaks and she answers: 16 scenes in five groups (her lessons, everyday, work, people, travel),
six turns each — the other person speaks three times, she answers three times. She hears the other person (🔊, only on a tap),
picks the natural reply out of three (the wrong ones are plausible and come with a short Russian reason), then says the right
reply aloud, optionally recording herself and hearing it back.

## Flow
- **Train hub** gets a *Mini-dialogues* card: the next scene (nearest her level, not done yet) and "All scenes".
- **Scene list** grouped by theme; each row shows the level and a ✓ when done.
- **Play**: their line (with 🔊 and a "Show translation" toggle) → her turn (Russian instruction, three options) → feedback
  (right: green; wrong: why, and the right one is revealed) → say it aloud (🔊 model, optional ● record) → next.
- **End**: score, the three replies, **Save these phrases** (adds them to her saved words, so they join the card queue and the
  word test; duplicates skipped). Finishing a scene ticks the existing speaking habit.

## Data and safety
- `english/dialogues.json` is loaded lazily like the phrases. Progress is `state.eng.dlg.done[sceneId] = {date, right, n}`.
- Voice and microphone rules are unchanged: voice only inside the trainer, only on a tap; recordings never stored.
- Pure logic (building a scene with shuffled options, choosing the next scene) is fenced by `/* dlg:pure */ … /* dlg:end */` and tested.

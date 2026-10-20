# English Lessons Implementation Plan

> **For agentic workers:** executed natively in one session (Natali asked for it to be built and merged), then reviewed by a fresh subagent.

**Goal:** Add a "Lessons" course to the English tab: six lessons of two parts each, unit tests, a quick speaking check, all resumable.

**Architecture:** Lesson content is data (`english/lessons.json`, loaded lazily like the other English files). Pure logic (status, unlock rule, test building, answer checking, speaking analysis) is fenced as `/* course:pure */` inside the English trainer block and unit-tested in JXA; the UI is a second fenced region `/* course:ui */`, also inside `/* eng:ui */` (the only place allowed to use speech synthesis). Progress lives in `state.eng.course`, created lazily.

**Tech Stack:** vanilla JS single file `index.html`, JSON content, JXA tests (`osascript -l JavaScript tests/english_course.js`).

**Spec:** `docs/superpowers/specs/2026-10-20-english-lessons-design.md`

## Global Constraints
- UI in English, calm; no streaks, badges, levels or points.
- Voice only inside `/* eng:ui */` and only on a tap; recordings never stored.
- Source texts are not stored in the repo; lessons use original wording and link to the originals.
- Existing data untouched; new state only in `state.eng.course` (and `state.eng.speakCheck` for the quick check's last date).
- Part 2 is a soft gate: "Do it now" is always visible; next lesson opens only when both parts are done.

## Review Focus
- Closing the app mid-step and reopening returns to the same step with her answers kept.
- Part 2 opening across the 4 a.m. day boundary; "Do it now" the same day.
- The last lesson finished: no "next lesson" dead end.
- A lesson id missing from `lessons.json` after an update must not crash the screen.
- Words added from a lesson twice (two taps or a repeated lesson) never duplicate in her saved words.
- Speaking analysis on empty text or text without punctuation.
- No English voice / no microphone / no speech recognition: every Speak and Words step still works.

## Files
- Create `english/lessons.json` (`{version, units:[{id,name,lessons:[...]}], lessons:[...]}`), `tests/english_course.js`.
- Modify `index.html` (state helpers, pure block, UI block, handlers, CSS), `README.md`.

### Task 1: Pure course logic
**Interfaces (Produces):**
- `crsState(): object` → `state.eng.course = {pos:{l, part, step}, parts:{<lid>:{1:{day}, 2:{day}}}, done:{<lid>:{date, score}}, ans:{<lid>:{<part>:{<step>:any}}}, tests:{<uid>:{date, right, n}}, words:{}}`
- `crsOrder(data): [{kind:'lesson'|'test', id}]` — lessons in order, a unit test after the last lesson of each unit.
- `crsStatus(course, order, today): {cur:{kind,id}|null, part:1|2, part2Open:boolean, doneCount, total}`
- `crsFinishPart(course, lid, part, today): void` (stamps day; part 2 also sets done)
- `crsTest(lessons, unit, rnd): [{q, options:[{t,ok}], why, from}]` (12 questions drawn from the unit's quiz, gap and words items)
- `crsRecall(words, rnd, n): [{q, options:[{t,ok}]}]`
- `crsGapOk(typed, answers): boolean` (case, punctuation and apostrophes ignored)
- `speakAnalyze(text, targets, secs): {words, unique, fillers, connectors, used:[], missed:[], wpm|null}`
- [ ] Failing test in `tests/english_course.js` for each function (order with tests after units; part 2 closed the same day and open the next; finishing both parts ends the lesson; gap check cases; test builder gives 12 questions with one right option each; analysis of empty text; used/missed targets with inflections like "felt down").
- [ ] Implement in `/* course:pure */ … /* course:end */`. Run test.
- [ ] Commit.

### Task 2: Data loading, state, navigation shell
**Consumes:** Task 1. **Produces:** `crsLoad()`, `renderCourse()`, `engSeg` with Lessons first, default view `lessons`.
- [ ] Test: source checks for `english/lessons.json` loading with a failure guard (`crsFailed`), the Lessons segment, the default view.
- [ ] Implement lazy loader (no refetch after failure), segment, Lessons home: current-lesson card with Continue/Do it now, course map, counts. `en-view lessons`.
- [ ] Commit.

### Task 3: Step renderers and handlers
**Consumes:** Tasks 1–2. Step types: intro, words (+ My words, 🔊), read, quiz, gap, grammar, task, write, roulette, recall, speak, plus finish screens for both parts.
- [ ] Tests (source + pure): handlers exist; `+ My words` dedupes by lower-cased term and sets `src:'lesson'`; answers are persisted under `ans`; the roulette step links to the Speak view and returns.
- [ ] Implement `renderCrsStep()` dispatching on `t`; resume position saved on every Continue/answer; Back allowed; checked quiz/gap locked; first attempt is the score; Speak uses the roulette recorder functions (enMic*) and speech recognition when present, otherwise a text box with the keyboard-microphone hint; "Copy for my tutor" copies prompt + transcript.
- [ ] Commit.

### Task 4: Unit tests, map, progress
- [ ] Test: unit test completes → result stored; revisit list for scores under 60%; the next item opens only after it.
- [ ] Implement test screen reusing the quiz renderer; map tags "revisit".
- [ ] Commit.

### Task 5: Quick speaking check
- [ ] Test: four prompts, copies all four transcripts with prompts; stores only the last date.
- [ ] Implement card and flow.
- [ ] Commit.

### Task 6: Content and docs
- [ ] Test (content): six lessons, two units, step order as in the spec, quiz/gap/words/speak shape rules, every URL https, no source sentence longer than 8 words copied (check against the saved transcripts is done once by hand), unique word terms across a unit.
- [ ] Assemble `english/lessons.json` from the six lesson files; add README rows.
- [ ] Run all tests, verify in the browser at phone width in Doodle and one dark theme, commit, push, open PR, fresh-reviewer round(s), merge.

# English lessons: a self-study course with a tutor's structure

Written 20 Oct 2026 from Natali's own words in chat. Everything marked **(my call)** is a choice made by the builder, not by her.

## Who and why
Natali teaches English to schoolchildren and her own level is B2. Her weak spot is **conversational vocabulary**: she speaks little, and everyday situations catch her out (in a taxi she cannot say "stop here" or "drop me off here"; around the house she does not know what things are called). She does not want a paid tutor. What she says stops her is **discipline**, not ability. She wants the English tab to behave as if she had a tutor who prepares her lessons: she sits down, does one lesson, sees her progress, and the next one is waiting.

## What she asked for (her words, condensed)
- Rework the English tab almost completely. Keep the speaking roulette (it records and turns her speech into text so she can analyse it); it may also live inside a lesson.
- **One lesson per two days, at most about 30 minutes.** A lesson she has not finished stays open; the next one does not unlock.
- Lessons are alive and **connected by theme**, not random fragments, and she must **see her progress**.
- Content: **conversational vocabulary first**; B2–C1 **grammar, repeated rather than taught from zero**; new vocabulary by topic; **articles and videos** as the material of lessons (BBC, The Pudding, interviews on YouTube, magazines she names).
- In a lesson she ticks things on the phone, may write by hand, may **speak into the phone**, adds new words to her word list and learns them (the existing spaced-repetition cards).
- **Final tests** at the end of a block of lessons, and "a plan of my progress".
- A **quick speaking check** she can do right now, so her English can be assessed.
- First delivery: **a few lessons to look at**, so she can say whether she likes it. Not the whole course.

Topics she picked or named: taxi and daily situations at home; heartbreak and rejection; stress and energy; shopping as therapy (an article called *Retail Therapy* from a magazine of that name); *a closer look: optimisation culture*; *ways to stop a jealousy spiral*; *does everyone hate you*; *Reflection* (a magazine). Sources she likes: BBC Learning English, The Pudding. For the three named articles and the two magazines she has not supplied text or links: the builder may not invent their content (see Constraints).

## Goals
1. Open the English tab → see "Lesson N" and one big button → work through short steps → finish → see a tick, a score and what is next.
2. Lessons teach conversational vocabulary in context, rehearse grammar briefly, and always end in speaking.
3. Visible progress: lesson map with ticks, words added, unit-test scores, a bar for the course.
4. Never a dead end: she can stop mid-lesson and come back to the same step.

## Non-goals and anti-goals
- Not a replacement for the existing Train / Speak / Words screens: they stay, unchanged in behaviour.
- No streak counters, badges, levels or points (she removed these before; do not propose them again). Progress is shown as ticks and a plain "Lesson 4 of 6".
- Not a full course now: the first release has **six lessons and two unit tests**.
- Failure modes to avoid: a wall of text; lessons that need a keyboard for long typing; reproducing copyrighted articles; inventing the content of articles nobody has read; pretending the app can assess speech better than it can; blocking her for days because of a calendar rule she did not ask for; losing her place.

## Constraints
- One HTML file PWA, vanilla JS, no server, no accounts, no API keys. Content lives in `english/lessons.json`, loaded lazily like the other English files. UI strictly in English (Russian only for glosses and short explanations, as elsewhere). Calm UI. Every new behaviour has a test; the logic that can be pure is pure and fenced.
- Voice (speech synthesis) only inside the English trainer block and only on a tap; recordings are never stored; microphone use as in the roulette.
- **Copyright:** lessons are written in the builder's own words. For BBC 6 Minute English and The Pudding the lesson links to the original and quotes at most a few words; vocabulary glosses, questions and exercises are original. Source text is read to make accurate questions but is not stored in the repo.
- **YouTube:** the builder can only build content-specific questions for a video if its subtitles could be read; otherwise the lesson uses topic vocabulary and generic watching tasks, and says so honestly. First release uses BBC and The Pudding only.
- Existing data must never be touched: habits, XP, word list contents, theme. New state lives in `state.eng.course`.

## How a lesson works
**One lesson = two parts.** Part 1 and Part 2, each about 15 minutes. Part 2 opens on the **next calendar day** (the app's 4 a.m. day) but she can press "Do it now" (my call: she asked for two days per lesson, not a forced wait). The next lesson opens only when both parts are done. A lesson never expires.

Steps (each is one short screen; progress dots at the top; Back and Continue; the current step is remembered):
- **Intro**: the goal in one line ("By the end you can ask a driver to stop and to wait") and what the two parts contain.
- **Words**: 8–12 items with a Russian gloss and an example; each has **+ My words** (adds to her saved words, so the card queue and the word test pick it up) and 🔊.
- **Read / Listen**: a link to the original, how long it takes, one instruction ("read once without a dictionary; underline what you want to ask about"), then "I've read it".
- **Quiz**: multiple choice with an instant explanation (comprehension, vocabulary, grammar).
- **Gap fill**: type the missing words; tolerant checking (capitals, punctuation and apostrophes do not matter).
- **Grammar**: a short reminder (B2–C1 point tied to the lesson topic) with examples, followed by gap-fill or quiz.
- **Write**: a prompt for a few sentences, **by hand in a notebook** or typed in a box that is saved on the phone (optional); a tick when done.
- **Speak**: a prompt and a list of target words; she records for 1–2 minutes (the roulette's recorder); the app shows a transcript when the browser can, otherwise she types or dictates one; a **rough analysis** (word count, variety, fillers, which target words she used and which she missed, a comparison with a model answer); a button **"Copy for my tutor"** that copies the prompt plus her transcript so she can paste it to Claude for a real assessment.
- **Roulette warm-up** (Part 2): one spin of the existing roulette, a tick when done.
- **Recall** (Part 2): a quick quiz built from the lesson's words.
- **Finish**: what she did, her scores, words added, the next lesson.

**Unit tests**: after every three lessons, a test of about 12 questions drawn from those lessons' vocabulary and grammar. It has to be completed to move on; there is no pass mark (my call), but the result screen lists the lessons to revisit when the score is under 60%.

**Quick speaking check**: a separate card on the Lessons page: four prompts (everyday, a short story, a feeling, an opinion), each recorded for about a minute, transcript, rough analysis, and "Copy for my tutor" with all four. The real assessment (vocabulary range, grammar accuracy, collocations, estimate of B2/C1, three priorities) is done by Claude in chat when she pastes it; pronunciation cannot be assessed from text.

## The first six lessons (my call; she can reorder)
1. **Taxi and getting around** (everyday): requests and short instructions; grammar: polite requests and indirect questions.
2. **Why does heartbreak hurt so much?** (BBC 6 Minute English, 1 Oct 2026): feelings and relationships; grammar: present perfect vs past simple for life events.
3. **At home: things and chores** (everyday): naming objects, phrasal verbs for housework; grammar: separable phrasal verbs. → **Unit test 1**
4. **Is rejection good for us?** (BBC, 17 Sep 2026): asking for favours, rejection, resilience; grammar: second and third conditionals.
5. **Comparisons as predictable as the sunrise** (The Pudding, similes): similes and idioms of comparison; grammar: comparatives, *as … as*, *like* vs *as*.
6. **How advertisers make us spend money** (BBC, 11 Jun 2026; her "retail therapy" theme): persuasion, shopping, money and mood; grammar: passive voice and causatives. → **Unit test 2**

Lessons 2, 4 and 6 are built from the BBC page (audio, transcript and vocabulary list, all read by the builder); 5 from The Pudding story (summary and structure read); 1 and 3 are original.

## The page
The English tab gets a first segment **Lessons** (the default), then Train, Speak, Words. The Lessons page shows: the current lesson card (title, part 1/2 state, one button "Continue" with the step it will resume at), a plain course map (ticked lessons with their scores, the open one, the locked ones, unit tests between), numbers for words added, and the quick speaking check card.

## Left to the builder
Exact wording and ordering of steps within a lesson (within the types above), the grammar explanations, the analysis heuristics for speaking, visual design inside the existing themes, how much of Part 1 vs Part 2 each step goes to (target 15 + 15 minutes), file layout of `lessons.json`, tests.

## Out of scope for the first release
Lessons beyond the six, YouTube-based lessons, the two magazines and three named articles (waiting for her to send the text or links), automatic assessment by a language model inside the app, audio of the lessons recorded by the builder.

## Decisions added after the builder check (all my calls)
- **Part 2 is a soft gate.** It shows "opens tomorrow" and an always-visible **Do it now** button. Part 1 stamps the day it was finished (`part1Day`); Part 2 counts as open when the app's day is later than that stamp. No confirm dialog.
- **Resume.** `state.eng.course` stores the current lesson, part and step index, and per step the answers given (quiz picks, gap-fill text, notes text, speaking transcript) so a half-done step comes back as she left it. Finished steps can be revisited with Back; a checked quiz or gap-fill is locked, and its score is the **first attempt**, kept as the lesson score. A finished lesson can be reopened read-only from the map.
- **Parts.** Part 1 ends with its own Finish screen (words learnt, quiz score, a one-line "tomorrow: …"). **Speaking closes Part 2 only**; Part 1 ends with the writing step. Part 2 opens with the roulette warm-up and recall, then Speak, then Finish.
- **Content access (verified).** BBC 6 Minute English pages (audio link, transcript, vocabulary) are readable for episodes 261001 (heartbreak), 260917 (rejection) and 260611 (advertisers). The Pudding "similes" story page is readable as a summary; the lesson uses its structure (the as … as pattern, predictable comparisons, ironic similes) and links to the original. Exact URLs are in the lesson data.
- **Speaking on her phone.** If the browser has speech recognition the transcript is filled automatically; if not (an iPhone web app usually has none) the Speak step shows a text box and tells her to tap the **microphone key on the phone keyboard** and talk, so there is no long typing. The recorder can still be used to play her voice back; recordings are never stored.
- **Rough analysis** shows counts only, never pretends to grade: words, how many different words, fillers (um, uh, like, you know, I mean), connectors used (because, although, however, so, but…), the lesson's target words used and missed, and the model answer to compare by eye.
- **Unit tests** are generated from the lessons' own quiz, gap-fill and recall items (no extra authoring): 12 questions, one result screen with the revisit list; the lesson map marks lessons to revisit with a small tag. The quick speaking check stores only the date it was last done.
- **Checks.** Same as the rest of the repo: a JXA test per feature (`osascript -l JavaScript tests/…`), pure logic fenced, verified in the browser at phone width.

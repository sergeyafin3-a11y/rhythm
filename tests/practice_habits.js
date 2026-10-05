// Two habits for the Practice tab — one driving-theory lesson a day, a diction session a day — and a diction page without videos.
// Run:  osascript -l JavaScript tests/practice_habits.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const m = /\/\* practice:pure \*\/([\s\S]*?)\/\* practice:end \*\//.exec(html);
check(!!m, 'no pure logic found between /* practice:pure */ and /* practice:end */');
if(m){
  const api = new Function(m[1] + '; return {PRACTICE_HABITS:PRACTICE_HABITS, practiceEnsure:practiceEnsure, practiceMark:practiceMark, DRIVE_RX:DRIVE_RX, DICTION_RX:DICTION_RX};')();
  check(api.PRACTICE_HABITS.map(function(h){ return h.id; }).join() === 'hp-drive,hp-diction', 'two habits: driving and diction');
  api.PRACTICE_HABITS.forEach(function(h){ check(h.perDay === 1 && h.weekGoal === 7 && !!h.emoji, h.title + ' is a daily, single-tick habit with an emoji'); });
  check(/lesson/i.test(api.PRACTICE_HABITS[0].title) && /driving/i.test(api.PRACTICE_HABITS[0].title), 'the driving habit says it is one lesson of the driving theory');
  check(/diction/i.test(api.PRACTICE_HABITS[1].title), 'the diction habit says diction');

  // adding them: once, nothing of hers touched, a deleted one stays deleted
  const st = {habits:[{id:'h5', title:'Yoga', perDay:1}], log:{}};
  check(api.practiceEnsure(st) === true && st.practiceHabits === true, 'first run adds the habits and sets the flag');
  check(st.habits.map(function(h){ return h.id; }).join() === 'h5,hp-drive,hp-diction', 'her habit stays, both are added: ' + st.habits.map(function(h){ return h.id; }).join());
  st.habits = st.habits.filter(function(h){ return h.id !== 'hp-diction'; });
  check(api.practiceEnsure(st) === false && st.habits.length === 2, 'a habit she deleted is not added back');
  const own = {habits:[{id:'hp-drive', title:'My own lessons', perDay:1}], log:{}};
  api.practiceEnsure(own);
  check(own.habits.filter(function(h){ return h.id === 'hp-drive'; }).length === 1 && own.habits[0].title === 'My own lessons', 'an existing habit with the same id is not duplicated or renamed');

  // the habit follows the lesson / the diction page
  const s2 = {habits:[{id:'hp-drive', title:'Driving theory: one lesson', perDay:1}, {id:'hp-diction', title:'Diction exercises', perDay:1}], log:{}};
  check(api.practiceMark(s2, 'hp-drive', '2026-10-05', true) === true && s2.log['hp-drive']['2026-10-05'] === 1, 'finishing a lesson ticks the habit');
  check(api.practiceMark(s2, 'hp-drive', '2026-10-05', true) === false && s2.log['hp-drive']['2026-10-05'] === 1, 'a second lesson the same day changes nothing');
  check(api.practiceMark(s2, 'hp-drive', '2026-10-05', false) === true && s2.log['hp-drive']['2026-10-05'] === undefined, 'undoing it unticks the habit');
  check(api.practiceMark(s2, 'hp-drive', '2026-10-05', false) === false, 'undoing when nothing was ticked changes nothing');
  check(api.practiceMark(s2, 'nope', '2026-10-05', true) === false, 'an unknown habit (she deleted it) is ignored without a crash');
  check(api.practiceMark({habits:[{id:'hp-drive', perDay:1}]}, 'hp-drive', '2026-10-05', true) === true, 'a state without a log still works');
  // the habits open the right screen
  check(api.DRIVE_RX.test('Driving theory: one lesson') && api.DRIVE_RX.test('Урок ПДД') && !api.DRIVE_RX.test('Yoga') && !api.DRIVE_RX.test('Diction exercises'), 'the driving panel matches its own habit only');
  check(api.DICTION_RX.test('Diction exercises') && api.DICTION_RX.test('Дикция') && !api.DICTION_RX.test('Speaking spin') && !api.DICTION_RX.test('Driving theory: one lesson'), 'the diction panel matches its own habit only');
}
check(/match:DRIVE_RX[\s\S]{0,200}?panel:drivePanel\}/.test(html) && /match:DICTION_RX[\s\S]{0,200}?panel:dictionPanel\}/.test(html), 'both habits open a panel through HABIT_PANELS');
check(/act==='go-drive'/.test(html) && /act==='go-diction'/.test(html), 'the panels have buttons that open the lessons and the diction page');
const lnDone = /act==='ln-done'\)\{[\s\S]*?\n  \}\n/.exec(html), lnUndo = /act==='ln-undo'\)\{[\s\S]*?\n  \}\n/.exec(html);
check(!!lnDone && /practiceMark\(state, 'hp-drive', today\(\), true\)/.test(lnDone[0]), 'pressing “Got it” on a lesson ticks the driving habit');
check(!!lnUndo && /practiceMark\(state, 'hp-drive', today\(\), false\)/.test(lnUndo[0]) && /some\(/.test(lnUndo[0]), 'undoing a lesson unticks it only when no other lesson was learned today');
const dcDone = /act==='dc-done'\)\{[^\n]*\n/.exec(html), dcUndo = /act==='dc-undo'\)\{[^\n]*\n/.exec(html);
check(!!dcDone && /practiceMark\(state, 'hp-diction', today\(\), true\)/.test(dcDone[0]), 'pressing Done on the diction page ticks the diction habit');
check(!!dcUndo && /practiceMark\(state, 'hp-diction', today\(\), false\)/.test(dcUndo[0]), 'undoing diction unticks the habit');
check(/practiceEnsure\(state\)/.test(html), 'the habits are added at load (fresh install and the app she already has)');
check(/const imp = 1/.test('const imp = 1') && /act==='import-data'\)\{[\s\S]*?practiceEnsure\(state\)[\s\S]*?\n  \}\n/.test(html), 'restoring a backup runs practiceEnsure before the first render');
const resetM = /act==='reset'\)\{[\s\S]*?\n  \}\n/.exec(html);
check(!!resetM && /practiceHabits\s*=\s*true/.test(resetM[0]), 'a reset must not bring the two habits back');

// the diction page: warm-up and tongue twisters only
check(html.indexOf('DICTION_VIDEOS') < 0 && html.indexOf('dictionOfDay') < 0, 'the diction videos are gone from the app');
check(html.indexOf('Video of the day') < 0 && html.indexOf('>All lessons<') < 0, 'the “Video of the day” step and the list of videos are gone');
check(/dc-num">1<\/div>/.test(html) && /dc-num">2<\/div>/.test(html) && !/dc-num">3<\/div>/.test(html), 'the two remaining steps are numbered 1 and 2');
check(/Warm-up/.test(html) && /Tongue twisters/.test(html) && /twistersOfDay\(\)/.test(html) && /DICTION_WARMUP/.test(html), 'the warm-up and the tongue twisters stay');
check(/Warm-up <span>3 min<\/span>/.test(html) && /Tongue twisters <span>3 min<\/span>/.test(html) && html.indexOf('about 10 minutes') < 0, 'the page no longer promises ten minutes (two three-minute steps)');
check(!/diction[^.\n]*video/i.test(readme.replace(/Video of the day[^\n]*/g, '')) || readme.indexOf('video of the day') < 0, 'the README no longer mentions a video of the day');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: driving and diction habits, diction without videos');

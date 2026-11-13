// Her own habits: any emoji as the icon, and the days of the week it is on (Mon / Wed / Fri, or a few times a week).
// Run:  osascript -l JavaScript tests/habit_days.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

// ---------- 1. pure logic (inside the arc block, because the Winter Arc week reads it too) ----------
const m = /\/\* arc:pure \*\/([\s\S]*?)\/\* arc:end \*\//.exec(html);
check(!!m, 'no /* arc:pure */ block');
let A = null;
if(m){
  A = new Function(m[1] + '; return {habitOn:habitOn, habitFreq:habitFreq, habitPlan:habitPlan, habitDaysLabel:habitDaysLabel, emojiOne:emojiOne, arcWeek:arcWeek, arcDayLevel:arcDayLevel};')();
  // 2026-11-16 is a Monday
  const mon = '2026-11-16', wed = '2026-11-18', sun = '2026-11-22';
  const h = {id:'g', title:'Gym', days:[1, 3, 5]};
  check(A.habitOn(h, mon) && A.habitOn(h, wed) && !A.habitOn(h, '2026-11-17') && !A.habitOn(h, sun), 'a habit with Mon, Wed, Fri is on only those days');
  check(A.habitOn({id:'a'}, sun) && A.habitOn({id:'b', days:[]}, sun) && A.habitOn({id:'c', days:[0, 1, 2, 3, 4, 5, 6]}, sun), 'no list, an empty list, or all seven days means every day');
  check(A.habitOn({days:[0]}, sun) && !A.habitOn({days:[0]}, mon), 'Sunday is day 0');
  check(A.habitFreq({days:[1, 3]}) === 'days' && A.habitFreq({weekGoal:3}) === 'few' && A.habitFreq({weekGoal:7}) === 'every' && A.habitFreq({}) === 'every' && A.habitFreq({days:[1, 3], weekGoal:2}) === 'days', 'the old «N days a week» habits stay «a few times a week»');
  const p1 = A.habitPlan('days', [5, 1, 3], 3), p2 = A.habitPlan('days', [0, 1, 2, 3, 4, 5, 6], 3), p3 = A.habitPlan('few', [1], 3), p4 = A.habitPlan('every', [1], 3), p5 = A.habitPlan('days', [], 3);
  check(JSON.stringify(p1) === JSON.stringify({days:[1, 3, 5], weekGoal:3}), 'chosen days are sorted and set the weekly goal');
  check(p2.weekGoal === 7 && !p2.days, 'all seven days is the same as every day');
  check(p3.weekGoal === 3 && !p3.days && p4.weekGoal === 7 && !p4.days, 'a few times a week keeps no days; every day keeps no days');
  check(p5 === null, 'chosen days with no day chosen is not a plan');
  check(A.habitDaysLabel({days:[5, 1, 3]}) === 'Mon · Wed · Fri' && A.habitDaysLabel({days:[0, 6]}) === 'Sat · Sun' && A.habitDaysLabel({}) === '', 'the days read Monday first');
  // the icon: the first emoji of whatever she typed
  check(A.emojiOne('🏋️‍♀️ gym') === '🏋️‍♀️' && A.emojiOne('  🧘') === '🧘' && A.emojiOne('🇬🇧!') === '🇬🇧' && A.emojiOne('gym') === '' && A.emojiOne('') === '' && A.emojiOne('1') === '', 'the first emoji is kept whole (also a family of joined emoji); plain text is not an icon');
  // the Winter Arc week: a day off is marked, and it does not count against the day
  const log = {g:{}, d:{}};
  const habits = [{id:'g', title:'Gym', days:[1, 3, 5], weekGoal:3, perDay:1}, {id:'d', title:'Read', weekGoal:7, perDay:1}];
  const row = A.arcWeek(habits, log, wed)[0];
  check(row.cells[0].off === false && row.cells[1].off === true && row.cells[2].off === false, 'the week row marks the days the habit is off');
  log.d['2026-11-17'] = 1;
  check(A.arcDayLevel(habits, log, '2026-11-17') === 4, 'on a day the gym is off, doing everything that is on counts as a full day: ' + A.arcDayLevel(habits, log, '2026-11-17'));
  check(A.arcDayLevel(habits, log, mon) === 0, 'on a gym day nothing done is still zero');
}

// ---------- 2. Today ----------
check(/function todayHabits\(/.test(html) && /habitOn\(h, today\(\)\)/.test(body('todayHabits')), 'there is a list of the habits that are on today');
const rt = body('renderToday');
check(/todayHabits\(\)|habitOn\(/.test(rt) && /Not scheduled today/.test(rt) && /<details/.test(rt), 'Today shows what is on; the rest waits in «Not scheduled today» and can still be ticked');
check(/function habitCard\(/.test(html) && /habitCard\(/.test(rt), 'one card drawing is used for both lists');
check(/habitDaysLabel\(h\)/.test(body('habitCard')), 'a habit with chosen days shows which days');
check(/doneToday\(\) === todayHabits\(\)\.length/.test(html), 'the all-done fireworks count only what was on that day');
check(/function doneToday\(\)\{[^}]*todayHabits\(\)/.test(html), 'doneToday counts only what is on that day');

// ---------- 3. the habit sheet ----------
const sh = body('sheetHabit');
check(/id="freqPick"/.test(sh) && /data-freq=/.test(sh) && /\['every'/.test(sh) && /\['days'/.test(sh) && /\['few'/.test(sh), 'the sheet asks how often: every day, chosen days, a few times a week');
check(/id="dayPick"/.test(sh) && /Mon/.test(sh) && /Sun/.test(sh) && /data-day=/.test(sh), 'the sheet has the seven weekdays to choose');
check(/id="emojiIn"/.test(sh) && /any emoji/i.test(sh), 'the sheet lets her type any emoji');
check(/\.chip\[data-day\]/.test(html) && /\.chip\[data-freq\]/.test(html), 'the weekday chips switch on and off one by one, the frequency chips one at a time');
const sv = html.slice(html.indexOf("act==='save-habit'"), html.indexOf("act==='del-habit'"));
check(/habitPlan\(/.test(sv) && /emojiOne\(/.test(sv), 'saving uses the plan and her typed emoji');
check(/h\.days|delete h\.days/.test(sv) && /days/.test(sv), 'saving writes or clears the chosen days');
check(/toast\('Choose at least one day'\)|Choose at least one day/.test(sv), 'chosen days with none ticked says so instead of saving');
// ---------- 4. nothing else is touched ----------
check(/\.arc-cell\.off\{/.test(html) && /class="arc-cell'\+[^']*off/.test(html.replace(/\s+/g, ' ')) || /\(c\.off/.test(html), 'a day off is drawn quieter in the Winter Arc week');
check(!/state\.habits = state\.habits\.map|h\.weekGoal = 7;\s*\n\s*delete h\.days/.test(html), 'no migration touches her existing habits');
check(/Mon · Wed · Fri|chosen days|which days/i.test(readme) && /emoji/i.test(readme), 'the README describes chosen days and own emoji');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: habits on chosen days, with her own emoji');

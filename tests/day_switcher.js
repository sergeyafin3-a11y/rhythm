// Switching between days: mark a habit for yesterday (or any past day) and see it in the tracker.
// Run:  osascript -l JavaScript tests/day_switcher.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const m = /\/\* daynav:pure \*\/([\s\S]*?)\/\* daynav:end \*\//.exec(html);
check(!!m, 'no pure day-navigation logic found between /* daynav:pure */ and /* daynav:end */');
if(m){
  const api = new Function(m[1] + '; return {dnAdd:dnAdd, dnPrev:dnPrev, dnNext:dnNext, dnLabel:dnLabel, dnCanMark:dnCanMark, DN_BACK:DN_BACK};')();
  const R = '2026-10-05';
  check(api.dnAdd('2026-10-01', -1) === '2026-09-30' && api.dnAdd('2026-01-01', -1) === '2025-12-31' && api.dnAdd('2026-12-31', 1) === '2027-01-01' && api.dnAdd('2026-03-01', -1) === '2026-02-28', 'adding days crosses month and year ends');
  check(api.dnPrev(null, R) === '2026-10-04', '‹ from today goes to yesterday');
  check(api.dnPrev('2026-10-04', R) === '2026-10-03' && api.dnPrev('2026-10-01', R) === '2026-09-30', '‹ keeps going back, across months');
  const floor = api.dnAdd(R, -api.DN_BACK);
  check(api.dnPrev(floor, R) === floor, '‹ stops a year back');
  check(api.dnNext(null, R) === null, '› on today stays on today');
  check(api.dnNext('2026-10-03', R) === '2026-10-04', '› goes one day forward');
  check(api.dnNext('2026-10-04', R) === null, '› from yesterday returns to today (null), never past it');
  check(api.dnNext('2026-10-09', R) === null, 'a date in the future collapses to today');
  check(api.dnLabel(null, R) === 'Today' && api.dnLabel('2026-10-04', R) === 'Yesterday' && api.dnLabel('2026-10-02', R) === '3 days ago', 'labels: Today, Yesterday, N days ago');
  check(api.dnCanMark('2026-10-05', R) === true && api.dnCanMark('2026-10-01', R) === true && api.dnCanMark('2026-10-06', R) === false, 'a day can be marked up to and including today, never in the future');
}
// the clock: today() follows the chosen day; the real day is still available
check(/function today\(\)\{ return selDay \|\| dayKeyAt\(\); \}/.test(html), 'today() must return the chosen day when there is one');
check(/function realToday\(\)\{ return dayKeyAt\(\); \}/.test(html), 'realToday() must stay the real day');
check(/let selDay = null;/.test(html), 'selDay is declared');
const goM = /function go\(t\)\{[\s\S]*?\n\}\n/.exec(html);
check(!!goM && /selDay = null/.test(goM[0]), 'changing tab always comes back to the real today');
check(/visibilitychange'[^\n]*selDay = null/.test(html), 'coming back to the app shows the real today again');
check(/paintedDay !== realToday\(\)/.test(html) && /selDay = null[^\n]*paintHeader|paintHeader[^\n]*selDay = null/.test(html) || /setInterval\([\s\S]{0,260}selDay = null/.test(html), 'the 4 a.m. rollover timer compares real days and clears the chosen day');
// the screen
check(/function dayBar\(\)/.test(html) && /dayBar\(\)/.test((/function renderToday\(\)\{[\s\S]*?\n\}\n/.exec(html) || [''])[0]), 'Today shows the day bar');
const rt = (/function renderToday\(\)\{[\s\S]*?\n\}\n/.exec(html) || [''])[0];
check(/selDay/.test(rt) && /arcTodayCard\(\)/.test(rt) && /wqTodayCard\(\)/.test(rt) && /tdTodayCard\(\)/.test(rt), 'renderToday knows about the chosen day and still builds the cards');
check(/if\(!selDay\)\{?[\s\S]{0,200}arcTodayCard\(\)|selDay \? '' : arcTodayCard\(\)|!selDay && /.test(rt), 'the Arc, word-test and to-do cards are shown only on the real today');
['day-prev', 'day-next', 'day-today', 'arc-cell'].forEach(function(a){ check(new RegExp("act==='" + a + "'").test(html), 'the ' + a + ' action is missing'); });
check(/class="arc-cell/.test(html) && /data-act="arc-cell"/.test(html), 'the tracker cells are buttons');
const cellM = /act==='arc-cell'\)\{[\s\S]*?\n  \}\n/.exec(html);
check(!!cellM && /toggleHabit\(/.test(cellM[0]) && /selDay = /.test(cellM[0]) && /selDay = null/.test(cellM[0]), 'tapping a tracker cell goes through toggleHabit for that day and then returns to today');
check(!!cellM && /realToday\(\)/.test(cellM[0]), 'a tracker cell in the future cannot be ticked');
check(/\.daybar\{/.test(html), 'the day bar has styles');
// second round
check(!!goM && /selDay = null[\s\S]*paintHeader\(\)/.test(goM[0]), 'changing tab repaints the header, so it never keeps the date of a past day');
check(!!cellM && /try\{[\s\S]*toggleHabit\(id, null\)[\s\S]*\}\s*finally\s*\{\s*selDay = null/.test(cellM[0]), 'the tracker square returns to the real today even if the tick throws (try / finally)');
check(!!cellM && /ygHabitChanged\(hb\)/.test(cellM[0]) && /fcHabitChanged\(hb\)/.test(cellM[0]), 'a several-ticks-a-day yoga or face-massage habit still runs its own hooks when a square is tapped');
// found in review
// the tracker squares are big enough to tap: one row of seven wide buttons under each habit's name, the weekday and the date inside
const cellCss = /\.arc-cell\{([^}]*)\}/.exec(html), cellsCss = /\.arc-cells\{([^}]*)\}/.exec(html);
check(!!cellCss && /min-height:\s*(4[4-9]|[5-9]\d)px/.test(cellCss[0]) && !/width:\s*18px/.test(cellCss[0]), 'a tracker square must be at least 44 px tall and fill its seventh of the row, not be an 18 px dot');
check(!!cellsCss && /grid-template-columns:\s*repeat\(7,\s*1fr\)/.test(cellsCss[0]), 'the seven squares of a habit share the whole row (grid of 7 equal columns)');
check(!/\.arc-wrow|\.arc-whead/.test(html), 'the old cramped grid (a name column plus seven 18 px dots) is gone');
check(/border-radius:\s*min\(12px,\s*calc\(var\(--radius\) - 2px\)\)/.test(cellCss ? cellCss[0] : ''), 'the squares take their roundness from the theme (a sharp theme like Risograph stays sharp)');
check(/arcWeek\([\s\S]{0,400}r\.weekly \? ' <small>weekly<\/small>'/.test(html), 'a habit that is not daily keeps its “weekly” tag');
check(/\(c\.today \? ' aria-current="date"' : ''\)/.test(html), 'today’s button is marked aria-current');
check(/class="arc-cells"/.test(html) && /class="arc-wname"/.test(html) && /<span class="d">/.test(html) && /<span class="n">/.test(html), 'each square shows the weekday letter and the date number');
check(!!cellM && /per > 1|perDay \|\| 1\) > 1/.test(cellM[0]), 'a habit that needs several ticks a day is set to done / not done by one tap on a square, not one count at a time');
const tg = /function toggleHabit\(id, el\)\{[\s\S]*?\n\}\n/.exec(html);
check(!!tg && /if\(!selDay && doneToday\(\) === activeHabits\(\)\.length\)/.test(tg[0]), 'the “every habit is closed” fanfare is only for the real today, not for a day filled in afterwards');
const ptd = /function paintTabDots\(\)\{[\s\S]*?\n\}\n/.exec(html);
check(!!ptd && /selDay = null/.test(ptd[0]) && /selDay = keep|selDay = was/.test(ptd[0]), 'the Practice-tab dot always describes the real today');
const db = /function dayBar\(\)\{[\s\S]*?\n\}\n/.exec(html);
check(!!db && /dnPrev\(selDay, real\)/.test(db[0]) && /data-act="day-prev"[^>]*disabled|day-prev" aria-label="Previous day"'\+\(atLimit/.test(db[0]), 'the ‹ button is disabled at the one-year limit');
const timer = /setInterval\(\(\)=>\{[\s\S]*?\}, 60000\);/.exec(html);
check(!!timer && /realToday\(\)/.test(timer[0]) && /selDay = null/.test(timer[0]), 'the 4 a.m. timer compares real days and clears the chosen day');
const ph = /function paintHeader\(\)\{[\s\S]*?\n\}\n/.exec(html);
check(!!ph && /toDate\(today\(\)\)/.test(ph[0]) && !/const d = new Date\(\)/.test(ph[0]), 'the header shows the chosen day, from today(), not the calendar day');
check(/day by day|switch between days|yesterday/i.test(readme), 'the README explains how to mark a day you missed');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: switching between days');

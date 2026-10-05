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
check(/day by day|switch between days|yesterday/i.test(readme), 'the README explains how to mark a day you missed');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: switching between days');

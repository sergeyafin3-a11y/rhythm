// The To-do tab as a calendar: a month you can page through, dots on the busy days, the chosen day's tasks right under it.
// Run:  osascript -l JavaScript tests/todo_calendar.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

const m = /\/\* cal:pure \*\/([\s\S]*?)\/\* cal:end \*\//.exec(html);
check(!!m, 'no pure logic between /* cal:pure */ and /* cal:end */');
if(m){
  const A = new Function(m[1] + '; return {calKey:calKey, calMonth:calMonth, calShift:calShift, calDots:calDots, CAL_HEAD:CAL_HEAD};')();
  const pad = function(n){ return String(n).padStart(2, '0'); };
  const oct = A.calMonth(2026, 9);
  check(oct.length === 35, 'October 2026 needs five weeks, got ' + oct.length + ' days');
  check(oct[0].key === '2026-09-28' && !oct[0].inMonth, 'the grid starts on a Monday (28 Sep), outside the month');
  check(oct[3].key === '2026-10-01' && oct[3].inMonth && oct[3].day === 1, '1 October 2026 is a Thursday: the fourth cell');
  check(oct[33].key === '2026-10-31' && oct[33].inMonth && !oct[34].inMonth, 'the month ends on 31 October, one trailing day shows November');
  check(A.calMonth(2027, 1).length === 28 && A.calMonth(2027, 1)[0].key === '2027-02-01', 'February 2027 starts on a Monday and fits four weeks');
  check(A.calMonth(2026, 7).length === 42, 'August 2026 needs six weeks');
  const dec = A.calMonth(2026, 11);
  check(dec[dec.length - 1].key.indexOf('2027-01') === 0, 'December runs into January of the next year');
  let ok = true;
  for(let i = 1; i < oct.length; i++){ const p = oct[i - 1].key.split('-').map(Number), q = oct[i].key; const d = new Date(p[0], p[1] - 1, p[2] + 1); if(q !== d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())) ok = false; }
  check(ok, 'the cells are consecutive days');
  check(A.calMonth(2024, 1).filter(function(c){ return c.inMonth; }).length === 29, 'a leap February has 29 days');
  check(JSON.stringify(A.calShift(2026, 0, -1)) === '{"y":2025,"m":11}' && JSON.stringify(A.calShift(2026, 11, 1)) === '{"y":2027,"m":0}' && JSON.stringify(A.calShift(2026, 9, 14)) === '{"y":2027,"m":11}', 'paging crosses the year in both directions');
  check(A.CAL_HEAD.join() === 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', 'the week starts on Monday');
  const list = [
    {id:'a', date:'2026-10-17', done:false}, {id:'b', date:'2026-10-17', done:false}, {id:'c', date:'2026-10-17', done:true},
    {id:'d', date:'2026-10-20', done:false}, {id:'e', date:'', done:false}, {id:'f', date:'2026-10-10', done:false}, {id:'g', date:'2026-10-10', done:false}, {id:'h', date:'2026-10-10', done:false}, {id:'i', date:'2026-10-10', done:false}
  ];
  const d = A.calDots(list, '2026-10-17');
  check(d['2026-10-17'].n === 2 && !d['2026-10-17'].late, 'a day counts only its open tasks');
  check(d['2026-10-20'].n === 1 && d['2026-10-10'].n === 4 && d['2026-10-10'].late === true, 'a past day with open tasks is marked late');
  check(Object.keys(d).length === 3, 'no dot for undated or finished-only days');
}
// the screen
const rt = body('renderTodos'), ct = body('tdCalendar');
check(/tdCalendar\(\)/.test(rt), 'renderTodos draws the calendar');
check(/class="cal"/.test(ct) && /calMonth\(/.test(ct) && /calDots\(/.test(ct), 'the To-do tab shows the month grid with dots');
check(/data-act="cal-prev"/.test(ct) && /data-act="cal-next"/.test(ct) && /data-act="cal-today"/.test(ct), 'there are arrows for the month and a way back to today');
check(/data-act="cal-pick"/.test(ct) && /aria-pressed/.test(ct), 'a day can be picked');
check(!/'Later'/.test(rt) && !/\['tomorrow'/.test(rt), 'the long Tomorrow / Later lists are replaced by the calendar');
check(/Overdue/.test(rt) && /No date yet/.test(rt) && /data-act="td-archive"/.test(rt), 'Overdue, No date yet and the Archive stay');
check(/tdSelKey\(\)/.test(rt) && /placeholder="Add a task for/.test(rt), 'the add field says which day a new task goes to');
['cal-pick', 'cal-prev', 'cal-next', 'cal-today'].forEach(function(a){ check(new RegExp("act==='" + a + "'").test(html), 'handler ' + a + ' is missing'); });
check(/act==='td-quick'\)\{[\s\S]{0,400}date:tdSelKey\(\)/.test(html), 'a quick-added task lands on the chosen day');
check(/function go\(t\)\{[\s\S]{0,300}tdSel = null/.test(html), 'opening the To-do tab starts on today');
check(/touchstart/.test(html) && /touchend/.test(html) && /Math\.abs\(dx\)/.test(body('tdCalSwipe')) && /tdCalSwipe\(\)/.test(rt), 'swiping the calendar sideways turns the month');
check(/\.cal-day\.sel\{/.test(html) && /\.cal-day\.today\{/.test(html) && /\.cal-day\.out\{/.test(html), 'chosen day, today and days of other months look different');
check(/\.cal-day\{[^}]*min-height:\s*(4[4-9]|5\d)px/.test(html), 'a day is at least 44px high to tap');
check(/calendar/i.test(readme), 'the README mentions the calendar');
// review fixes
check(/const n = dx < 0 \? 1 : -1/.test(body('tdCalSwipe')) && /Math\.abs\(dx\) < 50/.test(body('tdCalSwipe')) && /Math\.abs\(dy\) \* 2/.test(body('tdCalSwipe')), 'swipe left is the next month, 50px at least and clearly sideways');
check(/tdMon = \{y:x\.getFullYear\(\), m:x\.getMonth\(\)\}/.test(html.slice(html.indexOf("act==='cal-pick'"), html.indexOf("act==='cal-pick'") + 300)), 'picking a day makes the month follow it');
check(/\(c\.inMonth \? '' : ' out'\)/.test(body('tdCalendar')) && /Math\.min\(o\.n, 3\)/.test(body('tdCalendar')) && /here && sel === key/.test(body("tdCalendar")), 'days of other months are marked, at most three dots, Back to today when away');
check(/filter\(function\(t\)\{ return t\.date !== sel; \}\)/.test(body('renderTodos')), 'the chosen day is not listed twice (once more under Overdue)');
check(/act==='go-todo'\)\{[^}]*data-d/.test(html) && /data-act="go-todo" data-d="'\+shift\(key, 1\)/.test(body('tdPlansCard')), 'the Tomorrow “more” button opens the calendar on tomorrow');
check(/scrollIntoView\(\{block:'nearest'\}\)/.test(html.slice(html.indexOf("act==='cal-pick'"), html.indexOf("act==='cal-pick'") + 500)) && /\.td-day \.eyebrow\{[^}]*scroll-margin-bottom/.test(html), 'after picking a day its list is scrolled into view above the tab bar');
check(/cal-mid/.test(body('tdCalendar')) && /visibility:hidden/.test(body('tdCalendar')), 'Back to today never changes the height of the calendar');
check(/tdDay !== today\(\)/.test(body('tdSelKey') + body('tdMonth')), 'the calendar returns to today when the day changes (after 4 a.m.)');
check(/\.cal-day\.out\{[^}]*color:var\(--ink-mute\)/.test(html) && /\.cal-day\.late u\{[^}]*border-radius:\s*\d/.test(html) && /\.cal-day\.today\.sel\{/.test(html), 'out days stay readable, late dots differ by shape, today is visible even when chosen');
check(/getFullYear\(\) !== /.test(body('tdDayLabel')), 'a day in another year shows its year');
check(/act==='td-save'\)\{[\s\S]{0,700}tdSel = t\.date/.test(html), 'after saving a task the calendar follows its day');
check(/Nothing written down/.test(rt), 'a completely empty list still explains itself');

if(fails.length) throw new Error('FAIL:\n  ' + fails.filter(Boolean).join('\n  '));
console.log('OK: the to-do calendar');

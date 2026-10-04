// Winter Arc: the 4 October – 31 December plan, its habits, the Wednesday check-in and the tracker.
// Run:  osascript -l JavaScript tests/winter_arc.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const m = /\/\* arc:pure \*\/([\s\S]*?)\/\* arc:end \*\//.exec(html);
check(!!m, 'no pure Winter Arc logic found between /* arc:pure */ and /* arc:end */');
if(m){
  const api = new Function(m[1] + '; return {ARC_END:ARC_END, ARC_HABITS:ARC_HABITS, arcEnsure:arcEnsure, arcTotal:arcTotal, arcDayNo:arcDayNo, arcPhase:arcPhase, arcKeyAdd:arcKeyAdd, arcMonday:arcMonday, arcReviewDue:arcReviewDue, arcBedMinutes:arcBedMinutes, arcClock:arcClock, arcFocus:arcFocus, arcWeek:arcWeek, arcHeat:arcHeat, arcDayLevel:arcDayLevel};')();
  const arc = {start:'2026-10-04', end:api.ARC_END, reviews:{}, bed:{base:120, goal:60, step:10}};

  // the calendar of the Arc
  check(api.ARC_END === '2026-12-31', 'the Arc ends on 31 December');
  check(api.arcTotal(arc) === 89, '4 Oct to 31 Dec is 89 days, got ' + api.arcTotal(arc));
  check(api.arcDayNo(arc, '2026-10-04') === 1, 'the first day is day 1');
  check(api.arcDayNo(arc, '2026-10-14') === 11, '14 Oct is day 11');
  check(api.arcDayNo(arc, '2026-12-31') === 89, '31 Dec is day 89');
  check(api.arcPhase(arc, '2026-10-03') === 'before' && api.arcPhase(arc, '2026-10-04') === 'in' && api.arcPhase(arc, '2026-12-31') === 'in' && api.arcPhase(arc, '2027-01-01') === 'after', 'before / in / after the Arc');
  check(api.arcKeyAdd('2026-10-30', 3) === '2026-11-02' && api.arcKeyAdd('2026-12-30', 3) === '2027-01-02', 'adding days crosses month and year ends');
  check(api.arcMonday('2026-10-07') === '2026-10-05' && api.arcMonday('2026-10-04') === '2026-09-28' && api.arcMonday('2026-10-05') === '2026-10-05', 'the week starts on Monday (a Sunday belongs to the week before)');

  // starting it: habits are added once, nothing she has is touched, a deleted one does not come back
  const st = {habits:[{id:'h5', title:'Yoga', perDay:1}], log:{}};
  check(api.arcEnsure(st, '2026-10-04') === true, 'first run reports a change');
  check(st.arc.start === '2026-10-04' && st.arc.end === '2026-12-31', 'the Arc starts the day it is first opened and ends 31 December');
  const ids = st.habits.map(function(h){ return h.id; });
  check(new Set(ids).size === ids.length, 'no duplicate habit ids');
  check(ids.indexOf('h5') >= 0 && st.habits.filter(function(h){ return h.arc; }).length === 6, 'her own habit stays, six Arc habits are added');
  const weekly = st.habits.filter(function(h){ return h.weekGoal === 1; });
  check(weekly.length === 1 && /no/i.test(weekly[0].title), 'exactly one weekly habit: the honest “no”');
  st.habits = st.habits.filter(function(h){ return h.id !== 'a-walk'; });
  check(api.arcEnsure(st, '2026-10-20') === false && !st.habits.some(function(h){ return h.id === 'a-walk'; }), 'a habit she deleted is not added back');
  check(st.arc.start === '2026-10-04', 'the start date never moves');

  // the check-in is due from Wednesday until it is done
  const a2 = {start:'2026-10-04', end:'2026-12-31', reviews:{}};
  check(api.arcReviewDue(a2, '2026-10-05') === false && api.arcReviewDue(a2, '2026-10-06') === false, 'not due on Monday or Tuesday');
  check(api.arcReviewDue(a2, '2026-10-04') === false, 'not due on the very first day (a Sunday), the Arc has only just begun');
  check(api.arcReviewDue(a2, '2026-10-07') === true && api.arcReviewDue(a2, '2026-10-09') === true && api.arcReviewDue(a2, '2026-10-11') === true, 'due from Wednesday through Sunday');
  a2.reviews['2026-10-05'] = {note:'x'};
  check(api.arcReviewDue(a2, '2026-10-08') === false, 'done for this week, no longer due');
  check(api.arcReviewDue(a2, '2026-10-14') === true, 'due again the next Wednesday');
  check(api.arcReviewDue(a2, '2027-01-06') === false, 'never due after the Arc is over');

  // bedtime: 10 minutes earlier after every week she got to bed on time, never past 01:00
  check(api.arcClock(110) === '01:50' && api.arcClock(60) === '01:00', 'clock format');
  check(api.arcBedMinutes(arc) === 110, 'week one target is 01:50, got ' + api.arcClock(api.arcBedMinutes(arc)));
  const a3 = {bed:{base:120, goal:60, step:10}, reviews:{'2026-10-05':{bed:'yes'}, '2026-10-12':{bed:'no'}, '2026-10-19':{bed:'mostly'}}};
  check(api.arcBedMinutes(a3) === 90, 'two good weeks and one bad: 01:30, got ' + api.arcClock(api.arcBedMinutes(a3)));
  const a4 = {bed:{base:120, goal:60, step:10}, reviews:{}};
  for(let i = 0; i < 12; i++) a4.reviews['w' + i] = {bed:'yes'};
  check(api.arcBedMinutes(a4) === 60, 'the target stops at 01:00');

  // what to change next week
  check(api.arcFocus({energy:4, body:2, calm:4, home:4, yes:0}).key === 'body', 'the weakest area is the focus');
  check(api.arcFocus({energy:3, body:4, calm:2, home:4, yes:0}).key === 'calm', 'calm can be the focus');
  check(api.arcFocus({energy:1, body:5, calm:5, home:5, yes:0}).key === 'energy', 'energy can be the focus');
  check(api.arcFocus({energy:5, body:5, calm:5, home:2, yes:0}).key === 'home', 'home can be the focus');
  check(api.arcFocus({energy:5, body:5, calm:5, home:5, yes:2}).key === 'people', 'saying yes against her wish more than once makes it the focus');
  check(api.arcFocus({energy:4, body:4, calm:4, home:4, yes:0}).key === 'keep', 'everything fine: keep going');
  const f = api.arcFocus({energy:3, body:3, calm:3, home:3, yes:1});
  check(f.title && f.text && f.text.length > 30, 'advice has a title and a sentence');

  // the tracker
  const habits = [{id:'a', title:'Yoga', emoji:'🧘', perDay:1, weekGoal:7}, {id:'b', title:'Water', emoji:'💧', perDay:1, weekGoal:7}, {id:'c', title:'No', emoji:'🙅', perDay:1, weekGoal:1}, {id:'d', title:'Old', perDay:1, weekGoal:7, archived:true}];
  const log = {a:{'2026-10-05':1, '2026-10-06':1}, b:{'2026-10-05':1}, c:{'2026-10-06':1}};
  const rows = api.arcWeek(habits, log, '2026-10-07');
  check(rows.length === 3, 'the week grid skips archived habits');
  check(rows[0].cells.length === 7 && rows[0].cells[0].key === '2026-10-05' && rows[0].cells[6].key === '2026-10-11', 'seven cells, Monday to Sunday');
  check(rows[0].cells[0].done && rows[0].cells[1].done && !rows[0].cells[2].done, 'done cells follow the log');
  check(rows[0].cells[2].today && rows[0].cells[3].future && !rows[0].cells[1].future, 'today and future cells are marked');
  check(api.arcDayLevel(habits, log, '2026-10-05') === 4, 'every daily habit done = level 4 (the weekly one does not count)');
  check(api.arcDayLevel(habits, log, '2026-10-06') === 2, 'half done = level 2, got ' + api.arcDayLevel(habits, log, '2026-10-06'));
  check(api.arcDayLevel(habits, log, '2026-10-08') === 0, 'nothing done = level 0');
  const heat = api.arcHeat(arc, habits, log, '2026-10-07');
  check(heat.length === 89 && heat[0].key === '2026-10-04' && heat[88].key === '2026-12-31', 'one square per day of the Arc');
  check(heat[1].level === 4 && heat[3].level === 0 && heat[4].level === -1, 'past days have a level, future days are -1');
}
check(/function arcWhy\(/.test(html) && /arcWhy\(h\)/.test(html), 'the habit row must show the bedtime target through arcWhy(h)');
check(/arcTodayCard\(\)/.test(html), 'Today must show the Winter Arc card');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: Winter Arc logic');

// Winter Arc, simplified: 4 October – 31 December, two habits (walk, journal), a day-by-day tracker, a Wednesday check-in.
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
  const api = new Function(m[1] + '; return {ARC_START:ARC_START, ARC_END:ARC_END, ARC_HABITS:ARC_HABITS, arcEnsure:arcEnsure, arcSimplify:arcSimplify, arcTotal:arcTotal, arcDayNo:arcDayNo, arcPhase:arcPhase, arcKeyAdd:arcKeyAdd, arcMonday:arcMonday, arcReviewDue:arcReviewDue, arcCanReview:arcCanReview, arcFocus:arcFocus, arcWeek:arcWeek, arcHeat:arcHeat, arcDayLevel:arcDayLevel};')();
  const arc = {start:'2026-10-04', end:api.ARC_END, reviews:{}};

  // the calendar of the Arc
  check(api.ARC_START === '2026-10-04' && api.ARC_END === '2026-12-31', 'the Arc runs 4 October to 31 December');
  check(api.arcTotal(arc) === 89, '4 Oct to 31 Dec is 89 days, got ' + api.arcTotal(arc));
  check(api.arcDayNo(arc, '2026-10-04') === 1 && api.arcDayNo(arc, '2026-10-14') === 11 && api.arcDayNo(arc, '2026-12-31') === 89, 'day numbers');
  check(api.arcPhase(arc, '2026-10-03') === 'before' && api.arcPhase(arc, '2026-10-04') === 'in' && api.arcPhase(arc, '2026-12-31') === 'in' && api.arcPhase(arc, '2027-01-01') === 'after', 'before / in / after the Arc');
  check(api.arcKeyAdd('2026-10-30', 3) === '2026-11-02' && api.arcKeyAdd('2026-12-30', 3) === '2027-01-02', 'adding days crosses month and year ends');
  check(api.arcMonday('2026-10-07') === '2026-10-05' && api.arcMonday('2026-10-04') === '2026-09-28', 'the week starts on Monday');

  // starting it: only two habits, both daily
  check(api.ARC_HABITS.length === 2, 'the Arc adds just two habits, got ' + api.ARC_HABITS.length);
  check(api.ARC_HABITS.map(function(h){ return h.id; }).join() === 'a-walk,a-worry', 'the habits are the walk and the journal');
  api.ARC_HABITS.forEach(function(h){ check(h.weekGoal === 7 && h.perDay === 1, h.title + ' must be a daily, single-tick habit'); });
  check(api.ARC_HABITS[1].title === 'Keep a journal', 'the worries habit is now a journal');
  const st = {habits:[{id:'h5', title:'Yoga', perDay:1}], log:{}};
  check(api.arcEnsure(st, '2026-10-04') === true, 'first run reports a change');
  check(st.arc.start === '2026-10-04' && st.arc.end === '2026-12-31' && st.arc.simple === true, 'a new Arc is already the simple one');
  const ids = st.habits.map(function(h){ return h.id; });
  check(ids.join() === 'h5,a-walk,a-worry', 'her habit stays, the two Arc habits are added: ' + ids.join());
  const s6 = {habits:[], log:{}}; api.arcEnsure(s6, '2026-10-06');
  check(s6.arc.start === '2026-10-04', 'opened on 6 October the Arc still began on 4 October');
  st.habits = st.habits.filter(function(h){ return h.id !== 'a-walk'; });
  check(api.arcEnsure(st, '2026-10-20') === false && !st.habits.some(function(h){ return h.id === 'a-walk'; }), 'a habit she deleted is not added back');
  const late = {habits:[], log:{}};
  check(api.arcEnsure(late, '2027-02-01') === false && !late.arc && late.habits.length === 0, 'opened after 31 December: nothing is created');

  // she already has the first version (six habits, a weekly one): it is simplified once, nothing else touched
  const old = {
    arc:{start:'2026-10-04', end:'2026-12-31', reviews:{'2026-10-05':{energy:3, body:3, calm:3, home:3, bed:'yes', yes:0, note:'x'}}, bed:{base:120, goal:60, step:10}, seeded:true},
    strength:{i:5, k:'2026-10-04'},
    habits:[{id:'h5', title:'Yoga', perDay:1, weekGoal:7}, {id:'h2', title:'Learn 7 new words', perDay:1, weekGoal:7},
      {id:'a-core', title:'Core & strength', perDay:1, weekGoal:6, arc:'body'}, {id:'a-walk', title:'Walk 15–20 minutes', perDay:1, weekGoal:6, arc:'body'},
      {id:'a-avoid', title:'10 minutes on one thing I put off', perDay:1, weekGoal:6}, {id:'a-no', title:'One honest “no” this week', perDay:1, weekGoal:1},
      {id:'a-worry', title:'Write the worries down', emoji:'📝', perDay:1, weekGoal:7, arc:'head'}, {id:'a-bed', title:'Phone away, in bed on time', perDay:1, weekGoal:7}],
    log:{h5:{'2026-10-04':1}, 'a-walk':{'2026-10-04':1}, 'a-core':{'2026-10-04':1}, 'a-bed':{'2026-10-04':1}}
  };
  check(api.arcEnsure(old, '2026-10-05') === true, 'the old Arc is changed');
  check(old.habits.map(function(h){ return h.id; }).join() === 'h5,h2,a-walk,a-worry', 'strength, put-off, honest-no and bedtime habits are gone, the rest stays: ' + old.habits.map(function(h){ return h.id; }).join());
  const wh = old.habits.filter(function(h){ return h.id === 'a-worry'; })[0], wk = old.habits.filter(function(h){ return h.id === 'a-walk'; })[0];
  check(wh.title === 'Keep a journal' && wh.emoji === '📓', 'the worries habit is renamed to a journal');
  check(wk.weekGoal === 7, 'the walk is a daily habit now');
  check(old.log.h5['2026-10-04'] === 1 && old.log['a-walk']['2026-10-04'] === 1, 'what she ticked for yoga and the walk is kept');
  check(!old.log['a-core'] && !old.log['a-bed'], 'the log of the removed habits goes with them');
  check(old.strength === undefined, 'the strength-video state is gone');
  check(Object.keys(old.arc.reviews).length === 1 && old.arc.reviews['2026-10-05'].note === 'x', 'her check-in is kept');
  check(api.arcEnsure(old, '2026-10-06') === false && old.habits.length === 4, 'running it again changes nothing');
  check(api.arcSimplify({habits:[], log:{}}) === false, 'no Arc, nothing to simplify');
  // what she changed herself before the update is respected
  const mine = {arc:{start:'2026-10-04', end:'2026-12-31', reviews:{}, seeded:true},
    habits:[{id:'a-worry', title:'My evening notes', emoji:'🌙', perDay:1, weekGoal:5}, {id:'a-core', title:'Abs, my way', perDay:1, weekGoal:6}],
    log:{'a-worry':{'2026-10-04':1}}};
  api.arcEnsure(mine, '2026-10-05');
  check(mine.habits.length === 1 && mine.habits[0].id === 'a-worry' && mine.habits[0].title === 'My evening notes' && mine.habits[0].emoji === '🌙', 'a journal habit she renamed keeps her name and emoji');
  check(mine.habits[0].weekGoal === 7 && mine.log['a-worry']['2026-10-04'] === 1, 'but it is daily now, and her ticks stay');
  const nothing = {arc:{start:'2026-10-04', end:'2026-12-31', reviews:{}, seeded:true}, habits:[{id:'h5', title:'Yoga', perDay:1, weekGoal:7}], log:{}};
  check(api.arcEnsure(nothing, '2026-10-05') === true && nothing.habits.length === 1 && nothing.arc.simple === true, 'she had already deleted every Arc habit: none come back');

  // the check-in is possible from Wednesday to Sunday and due until it is done
  const a2 = {start:'2026-10-04', end:'2026-12-31', reviews:{}};
  check(api.arcReviewDue(a2, '2026-10-04') === false && api.arcReviewDue(a2, '2026-10-05') === false && api.arcReviewDue(a2, '2026-10-06') === false, 'not due on the first days, Monday or Tuesday');
  check(api.arcCanReview(a2, '2026-10-12') === false && api.arcCanReview(a2, '2026-10-13') === false, 'no check-in on a Monday or Tuesday');
  check(api.arcCanReview(a2, '2026-10-14') === true && api.arcCanReview(a2, '2026-10-18') === true && api.arcCanReview(a2, '2027-01-06') === false, 'check-in from Wednesday to Sunday, never after the Arc');
  check(api.arcReviewDue(a2, '2026-10-07') === true && api.arcReviewDue(a2, '2026-10-11') === true, 'due from Wednesday through Sunday');
  a2.reviews['2026-10-05'] = {note:'x'};
  check(api.arcReviewDue(a2, '2026-10-08') === false && api.arcReviewDue(a2, '2026-10-14') === true, 'done this week; due again next Wednesday');

  // what to change next week: the weakest of four areas
  check(api.arcFocus({energy:4, body:2, calm:4, home:4}).key === 'body', 'the weakest area is the focus');
  check(api.arcFocus({energy:3, body:4, calm:2, home:4}).key === 'calm', 'calm can be the focus');
  check(api.arcFocus({energy:1, body:5, calm:5, home:5}).key === 'energy', 'energy can be the focus');
  check(api.arcFocus({energy:5, body:5, calm:5, home:2}).key === 'home', 'home can be the focus');
  check(api.arcFocus({energy:4, body:4, calm:4, home:4}).key === 'keep', 'everything fine: keep going');
  check(api.arcFocus({energy:5, body:5, calm:5, home:5, yes:2}).key === 'keep', 'the old “yes against my wish” answer no longer decides anything');
  ['body', 'calm', 'energy', 'home', 'keep'].forEach(function(k){
    const f = api.arcFocus(k === 'keep' ? {energy:5, body:5, calm:5, home:5} : (function(){ const r = {energy:5, body:5, calm:5, home:5}; r[k] = 1; return r; })());
    check(f.title && f.text && f.text.length > 30, k + ': advice has a title and a sentence');
    check(!/Core & strength|strength block|put off|honest|bedtime|lights out|phone away/i.test(f.text + f.title), k + ': the advice must not mention habits that no longer exist');
  });

  // the tracker
  const habits = [{id:'a', title:'Yoga', emoji:'🧘', perDay:1, weekGoal:7}, {id:'b', title:'Water', emoji:'💧', perDay:1, weekGoal:7}, {id:'c', title:'Old', perDay:1, weekGoal:7, archived:true}];
  const log = {a:{'2026-10-05':1, '2026-10-06':1}, b:{'2026-10-05':1}};
  const rows = api.arcWeek(habits, log, '2026-10-07');
  check(rows.length === 2, 'the week grid skips archived habits');
  check(rows[0].cells.length === 7 && rows[0].cells[0].key === '2026-10-05' && rows[0].cells[6].key === '2026-10-11', 'seven cells, Monday to Sunday');
  check(rows[0].cells[0].done && rows[0].cells[1].done && !rows[0].cells[2].done, 'done cells follow the log');
  check(rows[0].cells[2].today && rows[0].cells[3].future && !rows[0].cells[1].future, 'today and future cells are marked');
  check(api.arcDayLevel(habits, log, '2026-10-05') === 4 && api.arcDayLevel(habits, log, '2026-10-06') === 2 && api.arcDayLevel(habits, log, '2026-10-08') === 0, 'day levels');
  const heat = api.arcHeat(arc, habits, log, '2026-10-07');
  check(heat.length === 89 && heat[0].key === '2026-10-04' && heat[88].key === '2026-12-31', 'one square per day of the Arc');
  check(heat[1].level === 4 && heat[3].level === 0 && heat[4].level === -1, 'past days have a level, future days are -1');
}

// what must be gone from the screens
check(html.indexOf('ARC_SPHERES') < 0 && html.indexOf('Where I am going') < 0, '“Where I am going” (the three goals) must be gone');
check(html.indexOf('arcBedMinutes') < 0 && html.indexOf(' tonight</p>') < 0 && html.indexOf('>Sleep<') < 0, 'the bedtime target and the Sleep block must be gone');
check(html.indexOf('Did you get to bed') < 0 && html.indexOf('Did you say yes to something') < 0, 'the bedtime and “said yes” questions must be gone from the check-in');
check(html.indexOf('STRENGTH_VIDEOS') < 0 && html.indexOf('scHabitChanged') < 0 && html.indexOf('scPanel') < 0, 'the Core & strength videos and their habit panel must be gone');
check(!/'a-core'|'a-bed'|'a-no'|'a-avoid'/.test(html.replace(/const ARC_GONE = \[[^\]]*\];/, '')), 'the removed habits are only mentioned in the cleanup list');
check(/arcTodayCard\(\)/.test(html) && (html.match(/arcTodayCard\(\)/g) || []).length >= 2, 'Today still shows the Winter Arc card');
check(/\(h\.why \? '<p class="habit-why">'\+esc\(h\.why\)\+'<\/p>' : ''\)\+/.test(html), 'the habit row shows its own “why” again');
const impM = /act==='import-data'\)\{[\s\S]*?\n  \}\n/.exec(html);
check(!!impM && /arcEnsure\(/.test(impM[0]), 'restoring a backup must run arcEnsure before the first render');
check(/arcDraft = \{week:\s*arcMonday\(today\(\)\)\}/.test(html) && /d\.week/.test(html), 'the week a check-in belongs to is fixed when it is opened, not when it is saved');
check(/arcCanReview\(a, key\)/.test(html), 'the Arc screen must show the check-in button only through arcCanReview');
check(/addEventListener\('input'[\s\S]{0,200}arcNote/.test(html), 'the check-in note must be kept in the draft as she types');
const resetM = /act==='reset'\)\{[\s\S]*?\n  \}\n/.exec(html);
check(!!resetM && /simple:\s*true/.test(resetM[0]) && /seeded:\s*true/.test(resetM[0]) && /today\(\) <= ARC_END/.test(resetM[0]), 'a reset after 31 Dec builds no Arc, before it builds an already seeded, simple one');
const drop = /const DROP = (\[[^\]]*\]);/.exec(html);
if(drop && m){
  const list = new Function('return ' + drop[1])(), hs = new Function(m[1] + '; return ARC_HABITS;')();
  hs.forEach(function(h){ list.forEach(function(d){ check(h.title.toLowerCase().indexOf(d) < 0, '“' + h.title + '” would be deleted by the old cleanup rule “' + d + '”'); }); });
}
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: Winter Arc logic');

// The neck warm-up habit: added once, two short videos and a three-minute written routine, gentle by design.
// Run:  osascript -l JavaScript tests/neck_warmup.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

const m = /\/\* neck:pure \*\/([\s\S]*?)\/\* neck:end \*\//.exec(html);
check(!!m, 'no pure logic between /* neck:pure */ and /* neck:end */');
if(m){
  const A = new Function(m[1] + '; return {NECK_HABIT:NECK_HABIT, NECK_VIDEOS:NECK_VIDEOS, NECK_STEPS:NECK_STEPS, NECK_NOTE:NECK_NOTE, neckEnsure:neckEnsure};')();
  const h = A.NECK_HABIT;
  check(h.id === 'hp-neck' && /neck/i.test(h.title) && h.perDay === 1 && h.weekGoal === 7 && h.when === 'day' && h.emoji, 'the habit is a daily "Neck warm-up" in the Day group');
  check(A.NECK_VIDEOS.length === 2, 'two short videos, got ' + A.NECK_VIDEOS.length);
  A.NECK_VIDEOS.forEach(function(v){
    check(/^[\w-]{11}$/.test(v.v) && v.t && v.by && v.min >= 3 && v.min <= 6 && v.lang === 'ru', 'video ' + v.v + ' needs an id, title, channel, 3–6 minutes and lang ru');
  });
  check(new Set(A.NECK_VIDEOS.map(function(v){ return v.v; })).size === 2, 'the two videos differ');
  check(A.NECK_STEPS.length >= 5 && A.NECK_STEPS.every(function(s){ return s.t && s.how && /\d/.test(s.how); }), 'the written routine has at least five steps, each with a count or a time');
  check(/never force|stop|doctor/i.test(A.NECK_NOTE) && /(tingling|numb|dizz)/i.test(A.NECK_NOTE), 'the safety note says to stop and when to see a doctor');
  check(!/(crack|click|jerk|full circle)/i.test(JSON.stringify(A.NECK_STEPS)), 'no risky moves in the routine (no neck circles, cracking or jerks)');
  const st = {habits:[{id:'h1', title:'Yoga'}]};
  check(A.neckEnsure(st) === true && st.habits.some(function(x){ return x.id === 'hp-neck'; }) && st.neckHabit === true, 'the habit is added once');
  st.habits = st.habits.filter(function(x){ return x.id !== 'hp-neck'; });
  check(A.neckEnsure(st) === false && !st.habits.some(function(x){ return x.id === 'hp-neck'; }), 'a habit she deletes stays deleted');
  const st2 = {habits:[{id:'hp-neck', title:'Neck stretch of my own', archived:false}]};
  A.neckEnsure(st2);
  check(st2.habits.length === 1, 'never a second copy');
}
check(/neckEnsure\(state\)/.test(html), 'the habit is added on start for the app she already has');
check(/act==='reset'[\s\S]{0,300}neckHabit = true/.test(html), 'starting over does not bring the habit back');
const panel = /\{match:\/[^\n]*neck[^\n]*\n/i.exec(html);
check(!!panel && /neckPanel/.test(panel[0]) && /hint:/.test(panel[0]), 'the habit opens a panel when tapped');
const np = body('neckPanel');
check(/vidCard\(/.test(np) && /NECK_STEPS/.test(np) && /NECK_NOTE/.test(np), 'the panel shows the videos, the written routine and the note');
check(/Neck warm-up/.test(readme) || /neck warm-up/i.test(readme), 'the README mentions the neck warm-up');
check(/\.nk-steps\{[^}]*display:block/.test(html), 'the written routine uses the full width of the card');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the neck warm-up');

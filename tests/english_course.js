// English lessons: a self-study course with a tutor's structure (two parts per lesson, unit tests, speaking check).
// Run:  osascript -l JavaScript tests/english_course.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };
let seed = 7; const rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

// ---------- 1. pure logic ----------
const m = /\/\* course:pure \*\/([\s\S]*?)\/\* course:end \*\//.exec(html);
check(!!m, 'no pure logic between /* course:pure */ and /* course:end */');
const sm = /\/\* srs:pure \*\/([\s\S]*?)\/\* srs:end \*\//.exec(html);
let C = null;
if(m && sm){
  C = new Function('srsShuffle', m[1] + '; return {crsOrder:crsOrder, crsStatus:crsStatus, crsFinishPart:crsFinishPart, crsScore:crsScore, crsTest:crsTest, crsRecall:crsRecall, crsGapOk:crsGapOk, speakAnalyze:speakAnalyze, CRS_TEST_N:CRS_TEST_N};')(new Function(sm[1] + '; return srsShuffle;')());
  const data = {units:[{id:'u1', lessons:['l1', 'l2']}, {id:'u2', lessons:['l3']}]};
  const order = C.crsOrder(data);
  check(order.map(function(x){ return x.kind + ':' + x.id; }).join() === 'lesson:l1,lesson:l2,test:u1,lesson:l3,test:u2', 'a unit test follows the last lesson of each unit: ' + order.map(function(x){ return x.kind + ':' + x.id; }).join());
  const mk = function(){ return {pos:null, parts:{}, done:{}, ans:{}, tests:{}}; };
  let c = mk();
  let s = C.crsStatus(c, order, '2026-10-20');
  check(s.cur.id === 'l1' && s.part === 1 && s.doneCount === 0 && s.total === 3, 'a fresh course starts at lesson 1, part 1: ' + JSON.stringify(s));
  C.crsFinishPart(c, 'l1', 1, '2026-10-20');
  s = C.crsStatus(c, order, '2026-10-20');
  check(s.cur.id === 'l1' && s.part === 2 && s.part2Open === false, 'part 2 stays closed on the same day');
  s = C.crsStatus(c, order, '2026-10-21');
  check(s.part === 2 && s.part2Open === true, 'part 2 opens the next day');
  C.crsFinishPart(c, 'l1', 1, '2026-10-22');
  check(c.parts.l1[1].day === '2026-10-20', 'finishing part 1 again keeps the first day');
  C.crsFinishPart(c, 'l1', 2, '2026-10-21', {right:9, n:14});
  s = C.crsStatus(c, order, '2026-10-21');
  check(c.done.l1.date === '2026-10-21' && c.done.l1.score.right === 9 && s.cur.id === 'l2' && s.part === 1 && s.doneCount === 1, 'finishing part 2 ends the lesson with its score and moves on: ' + JSON.stringify(s));
  C.crsFinishPart(c, 'l2', 2, '2026-10-21', {right:1, n:2});
  s = C.crsStatus(c, order, '2026-10-21');
  check(s.cur.kind === 'test' && s.cur.id === 'u1', 'after the unit\'s lessons the unit test is next');
  c.tests.u1 = {date:'2026-10-21', right:8, n:12};
  C.crsFinishPart(c, 'l3', 2, '2026-10-22', {right:1, n:1});
  c.tests.u2 = {date:'2026-10-23', right:5, n:12};
  s = C.crsStatus(c, order, '2026-10-23');
  check(s.cur === null && s.doneCount === 3, 'when everything is done there is no current item: ' + JSON.stringify(s));
  // scores come from the stored first attempts
  const lesson = {parts:[{steps:[{t:'intro'}, {t:'quiz', qs:[1, 2, 3]}, {t:'write'}]}, {steps:[{t:'gap', items:[1, 2]}, {t:'speak'}]}]};
  const ans = {1:{1:{res:[true, false, true], checked:true}}, 2:{0:{res:[true, true], checked:true}}};
  const sc = C.crsScore(lesson, ans);
  check(sc.right === 4 && sc.n === 5, 'the lesson score is the sum of the first attempts of its quiz and gap steps: ' + JSON.stringify(sc));
  check(C.crsScore(lesson, {}).n === 0, 'no answers, no score');
  // gap answers
  check(C.crsGapOk("Haven't spoken", ["haven't spoken", 'have not spoken']) && C.crsGapOk('have not spoken.', ["haven't spoken", 'have not spoken']), 'gap answers ignore capitals and punctuation');
  check(C.crsGapOk('havent spoken', ["haven't spoken"]) && C.crsGapOk('Haven’t  spoken', ["haven't spoken"]), 'gap answers ignore apostrophes and extra spaces');
  check(!C.crsGapOk('have spoken', ["haven't spoken"]) && !C.crsGapOk('', ['x']) && !C.crsGapOk('went', ['go']), 'wrong or empty answers are wrong');
  // unit test and recall
  const L = [];
  for(let i = 1; i <= 3; i++) L.push({id:'l' + i, parts:[
    {steps:[{t:'words', items:[1, 2, 3, 4, 5, 6].map(function(k){ return {w:'phrase ' + i + k, ru:'перевод ' + i + k, ex:'example'}; })}, {t:'quiz', qs:[1, 2, 3].map(function(k){ return {q:'q' + i + k, o:['right' + k, 'wrong a', 'wrong b'], a:0, why:'because'}; })}]},
    {steps:[{t:'gap', items:[1, 2, 3].map(function(k){ return {s:'I ___ it ' + i + k, a:['do'], hint:'h'}; })}]}]});
  const t = C.crsTest(L, {id:'u1', lessons:['l1', 'l2', 'l3']}, rnd);
  check(C.CRS_TEST_N === 12 && t.length === 12, 'a unit test has 12 questions, got ' + t.length);
  check(t.filter(function(x){ return x.kind === 'mc'; }).every(function(x){ return x.options.length === 3 && x.options.filter(function(o){ return o.ok; }).length === 1; }), 'each multiple-choice question has exactly one right option');
  check(t.filter(function(x){ return x.kind === 'gap'; }).every(function(x){ return /___/.test(x.s) && x.answers.length; }), 'gap questions keep their blank and answers');
  check(t.filter(function(x){ return x.kind === 'gap'; }).length >= 3 && t.filter(function(x){ return x.kind === 'mc'; }).length >= 6, 'a mix of gap and multiple-choice questions');
  check(new Set(t.map(function(x){ return x.q || x.s; })).size === 12, 'no question twice');
  check(C.crsTest(L, {id:'u1', lessons:['l1', 'zzz']}, rnd).length >= 6, 'a lesson missing from the data does not break the test');
  const rc = C.crsRecall([1, 2, 3, 4, 5, 6].map(function(k){ return {w:'w' + k, ru:'р' + k, ex:'e'}; }), rnd, 5);
  check(rc.length === 5 && rc.every(function(q){ return q.options.length === 3 && q.options.filter(function(o){ return o.ok; }).length === 1; }), 'recall: five questions, three options each, one right');
  check(C.crsRecall([{w:'a', ru:'а', ex:'e'}], rnd, 5).length === 0, 'with fewer than three words there is no recall quiz');
  // speaking analysis
  const a0 = C.speakAnalyze('', ['go through a rough patch'], 60);
  check(a0.words === 0 && a0.unique === 0 && a0.missed.length === 1 && a0.used.length === 0 && a0.wpm === 0, 'empty text analyses to zeros: ' + JSON.stringify(a0));
  const txt = "Um, so last year we went through a rough patch, and I felt down for weeks. I mean, it was hard because we never talked. However, we made up in the end, you know.";
  const a1 = C.speakAnalyze(txt, ['go through a rough patch', 'feel down', 'make up', 'come out the other side'], 60);
  check(a1.used.join() === 'go through a rough patch,feel down,make up' && a1.missed.join() === 'come out the other side', 'targets are found in their inflected forms: used=' + a1.used.join() + ' missed=' + a1.missed.join());
  check(a1.fillers >= 3, 'fillers counted (um, I mean, you know), got ' + a1.fillers);
  check(a1.connectors.indexOf('because') >= 0 && a1.connectors.indexOf('however') >= 0, 'connectors are listed');
  check(a1.words > 25 && a1.unique <= a1.words && a1.wpm === a1.words, 'word counts and words per minute: ' + JSON.stringify([a1.words, a1.unique, a1.wpm]));
  check(C.speakAnalyze('hello there', [], 0).wpm === null, 'without a duration there is no speed');
}
// the rest of the checks are added task by task below
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: English lessons');

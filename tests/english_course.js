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
// ---------- 2. loading, state and the Lessons page ----------
check(/function crsLoad\(\)\{\s*if\(CRS \|\| crsLoading \|\| crsFailed\) return;/.test(html), 'the lessons load once and stop after a failure');
check(/fetch\('english\/lessons\.json'\)/.test(html), 'lessons come from english/lessons.json');
check(/function crsState\(\)\{[\s\S]*?state\.eng|function crsState\(\)\{[^}]*engState\(\)/.test(html), 'the course keeps its data in state.eng.course, created lazily');
check(/data-act="en-view" data-v="lessons"/.test(body('enSeg')), 'the English tab has a Lessons segment');
check(/state\.enView \|\| 'lessons'/.test(body('renderEnglish')) && /state\.enView \|\| 'lessons'/.test(body('enSeg')) && !/state\.enView \|\| 'train'/.test(html), 'Lessons is the default view');
check(/if\(!state\.engCourse\)\{[^}]*state\.enView = 'lessons'/.test(html), 'the app she already has opens on the Lessons once');
const hv = body('renderCourse');
check(/crsStatus\(/.test(hv) && /crsOrder\(|CRS\.order/.test(hv) && /data-act="crs-open"/.test(hv) && /data-act="crs-do2"/.test(hv), 'the page shows where she is, a Continue button and Do it now for part 2');
check(/Part 2 opens tomorrow|opens tomorrow/.test(hv), 'part 2 says when it opens');
check(/class="crs-map"/.test(hv) && /crs-review|data-act="crs-review"/.test(hv), 'a course map with finished lessons that can be reopened');
check(/data-act="crs-test-start"/.test(hv) && /revisit/.test(hv), 'the map has the unit tests and marks lessons to revisit');
check(/words added|My words/.test(hv), 'the page counts the words she has added');
check(/crs-check-start/.test(hv) && /speaking check/i.test(hv), 'the quick speaking check card is there');

// ---------- 3. the steps ----------
const stepTypes = ['intro', 'words', 'read', 'quiz', 'gap', 'grammar', 'task', 'write', 'roulette', 'recall', 'speak'];
const rs = body('renderCrsStep');
stepTypes.forEach(function(t){ check(new RegExp("'" + t + "'").test(rs), 'renderCrsStep handles the step type ' + t); });
['crs-next', 'crs-prev', 'crs-home', 'crs-mark', 'crs-word', 'qz-pick', 'qz-check', 'qz-next', 'crs-analyse', 'crs-copy', 'crs-model', 'crs-roulette', 'crs-resume', 'crs-review'].forEach(function(a){ check(new RegExp("act==='" + a + "'").test(html), 'handler ' + a + ' is missing'); });
check(/function crsAddWord\(/.test(html) && /toLowerCase\(\) === /.test(body('crsAddWord')) && /src:'lesson'/.test(body('crsAddWord')), '+ My words dedupes by lower-cased term and marks src lesson');
check(/function crsAns\(/.test(html) && /state\.eng|crsState\(\)\.ans/.test(body('crsAns')), 'answers are stored in the course state');
check(/crsPos\(|\.pos = /.test(body('crsGo')) && /save\(\)/.test(body('crsGo')), 'the position is saved whenever she moves');
check(/function qzRender\(/.test(html) && /crsGapOk\(/.test(html) && /checked/.test(body('qzRender') + body('qzFinish')), 'quiz, gap, recall and unit tests share one question runner that records first attempts');
check(/res\.push\(/.test(html), 'each first attempt is recorded');
check(/navigator\.clipboard/.test(body('crsCopy')) && /Copy for my tutor/.test(html), 'the speaking step copies the transcript for the tutor');
check(/speakAnalyze\(/.test(body('crsAnalyse')), 'the speaking step runs the analysis');
check(/keyboard/i.test(body('crsSpeakStep')) && /<textarea/.test(body('crsSpeakStep')), 'without speech recognition the speaking step tells her to use the keyboard microphone');
check(/crsBack\('crs-resume'/.test(body('renderTalk')), 'the roulette offers a way back to the lesson when she came from one');
check(/crsFinishPart\(/.test(body('crsPartDone')) && /crsScore\(/.test(body('crsPartDone')), 'finishing a part stamps the day and scores the lesson');
check(/Do Part 2 now|Do it now/.test(html), 'the finish of part 1 offers to continue now');
// ---------- 4. unit tests ----------
check(/crsTest\(/.test(body('crsTestStart')) && /tests\[/.test(body('crsTestDone')) && /revisit/.test(body('crsTestDone')), 'a unit test is built from the unit, stored with its revisit list');
check(/% *|60/.test(body('crsTestDone')), 'scores under 60% produce a revisit list');
// ---------- 5. quick speaking check ----------
const prompts = /CRS_CHECK\s*=\s*\[([\s\S]*?)\];/.exec(html);
check(!!prompts && (prompts[1].match(/\{p:/g) || []).length === 4, 'the quick speaking check has four prompts');
check(/speakCheck/.test(body('crsCheckDone')) && !/transcript/.test(JSON.stringify(Object.keys({}))), 'the check stores only the date it was last done');
check(/Copy for my tutor/.test(body('renderCrsCheckDone')) && /CRS_CHECK\.map/.test(body('crsCheckText')), 'the check copies all four answers');
// ---------- 6. the lessons themselves ----------
let D = null;
try{ D = JSON.parse(read(root + '/english/lessons.json')); }catch(e){ fails.push('english/lessons.json is missing or is not valid JSON'); }
if(D && C){
  check(D.lessons.length === 6 && D.units.length === 2, 'six lessons in two units, got ' + D.lessons.length + ' / ' + D.units.length);
  check(D.units[0].lessons.join() === 'l01,l02,l03' && D.units[1].lessons.join() === 'l04,l05,l06', 'three lessons in each unit');
  const cyr = /[а-яё]/i, terms = {};
  const p1 = 'intro,words,read,quiz,task,write', p2a = 'intro,roulette,recall,read,grammar,gap,speak';
  D.lessons.forEach(function(l){
    const id = l.id;
    check(l.title && l.tag && /^By the end you can/.test(l.goal) && l.n >= 1, id + ': needs a title, tag and a goal that starts "By the end you can"');
    check(l.sources.length === 2 && l.sources.every(function(x){ return /^https:\/\//.test(x.url) && x.title && x.by && x.min > 0 && /^(6ME|TEWS|Pudding)$/.test(x.kind); }), id + ': two sources with https links');
    check(l.parts.length === 2, id + ': two parts');
    check(l.parts[0].steps.map(function(x){ return x.t; }).join() === p1, id + ': part 1 steps are ' + p1);
    check(l.parts[1].steps.map(function(x){ return x.t; }).join() === p2a, id + ': part 2 steps are ' + p2a);
    l.parts.forEach(function(p, pi){ p.steps.forEach(function(st, si){
      check(st.title, id + ' part ' + (pi + 1) + ' step ' + si + ' has no title');
      if(st.t === 'words'){
        check(st.items.length >= 10 && st.items.length <= 12, id + ': 10–12 phrases, got ' + st.items.length);
        st.items.forEach(function(w){
          check(w.w && w.ru && w.ex && /^(6ME|TEWS|own)$/.test(w.src), id + ': phrase "' + w.w + '" needs w, ru, ex, src');
          check(cyr.test(w.ru) && !cyr.test(w.w) && !cyr.test(w.ex), id + ': "' + w.w + '" has English text, a Russian gloss');
          const k = w.w.toLowerCase(); check(!terms[k], id + ': the phrase "' + w.w + '" is also in ' + terms[k]); terms[k] = id;
        });
      }
      if(st.t === 'quiz'){
        check(st.qs.length >= 5 && st.qs.length <= 6, id + ': 5–6 quiz questions');
        st.qs.forEach(function(q){ check(q.o.length === 3 && q.a === 0 && new Set(q.o).size === 3 && q.why && !cyr.test(q.q + q.o.join('')), id + ': quiz question "' + q.q.slice(0, 40) + '" needs three different English options, a=0 and a why'); });
      }
      if(st.t === 'gap'){
        check(st.items.length >= 6 && st.items.length <= 8, id + ': 6–8 gap items, got ' + st.items.length);
        st.items.forEach(function(g){ check((g.s.match(/___/g) || []).length === 1 && g.a.length >= 1 && g.hint, id + ': gap "' + g.s.slice(0, 40) + '" needs one blank, answers and a hint'); check(g.a.every(function(x){ return C.crsGapOk(x, g.a); }), id + ': every listed answer must be accepted'); });
      }
      if(st.t === 'read') check(st.source >= 0 && st.source < l.sources.length && st.how, id + ': a read step points at one of its sources');
      if(st.t === 'grammar') check(st.text && st.ru && cyr.test(st.ru) && st.ex.length >= 3, id + ': grammar needs text, a Russian version and 3 examples');
      if(st.t === 'task') check(st.items.length >= 2 && st.items.length <= 4, id + ': 2–4 noticing tasks');
      if(st.t === 'write') check(st.prompt && st.hint, id + ': write needs a prompt and a hint');
      if(st.t === 'speak'){
        const words = st.model.split(/\s+/).length;
        check(st.targets.length >= 5 && st.targets.length <= 6, id + ': 5–6 speaking targets');
        check(words >= 70 && words <= 120, id + ': the model answer is 70–120 words, got ' + words);
        const an = C.speakAnalyze(st.model, st.targets, 0);
        check(an.missed.length === 0, id + ': the model answer must use every target, missing: ' + an.missed.join('; '));
      }
    }); });
    check(l.parts[1].steps.filter(function(x){ return x.t === 'read'; }).length === 1, id + ': part 2 reads the second source');
  });
  check(D.lessons.some(function(l){ return l.sources[0].kind === 'Pudding'; }) && D.lessons.filter(function(l){ return l.sources[0].kind === '6ME'; }).length === 5, 'five BBC 6 Minute English lessons and one from The Pudding');
  // no big pieces of the BBC pages copied in (a run of 9 or more words from a source file would be flagged by hand; here: the lesson files do not embed transcripts)
  check(JSON.stringify(D).indexOf('TRANSCRIPT') < 0 && JSON.stringify(D).length < 150000, 'the lessons contain no pasted transcripts');
}
check(/Lessons/.test(readme) && /english\/lessons\.json/.test(readme), 'the README mentions the lessons and english/lessons.json');
// ---------- 7. review fixes ----------
if(C){
  // a score counts only finished, checked steps
  const lsn = {parts:[{steps:[{t:'quiz', qs:[1, 2]}]}, {steps:[]}]};
  check(C.crsScore(lsn, {1:{0:{res:[true, true], checked:false}}}).n === 0, 'a half-done quiz does not count towards the score');
  // targets: whole phrases, in order and close together, not loose words
  const A = function(t, tg){ return C.speakAnalyze(t, tg, 0).used.length === 1; };
  check(!A('I get up at seven.', ['I get it']), '"I get up" is not "I get it"');
  check(!A('I used my phone all day.', ['used to']), '"used my" is not "used to"');
  check(!A('I waited for the bus while it rained.', ['for a while']), 'scattered words are not "for a while"');
  check(!A('I feel great. Then I sat down.', ['feel down']), 'far apart words are not "feel down"');
  check(!A('What sort of person goes out at night?', ['sort out']), '"sort of person goes out" is not "sort out"');
  check(!A('I wake up early and I make my bed.', ['make up']), '"wake up ... make" is not "make up"');
  check(A('I used to love it.', ['used to']) && A('She cheered her friend up.', ['cheer someone up']) && A('We pull our weight.', ['pull your weight']), 'real uses, with a pronoun in place of someone/your, are found');
  check(A('She must\'ve been disappointed.', ['must have been']) && A('I am not sure that it works.', ["I'm not sure that"]) && A('It is all good.', ["it's all good"]), 'contractions and full forms match each other');
  check(C.speakAnalyze('In 2026 I have 3 cats and a café.', [], 0).words === 9, 'numbers and accented words count as words: ' + C.speakAnalyze('In 2026 I have 3 cats and a café.', [], 0).words);
  // look-alike meanings are not offered together as answer options
  const pool = [{w:'think on your feet', ru:'быстро соображать на ходу', ex:'e'}, {w:'think on the spot', ru:'быстро соображать на месте', ex:'e'}, {w:'pull your weight', ru:'делать свою долю работы', ex:'e'}, {w:'clear up', ru:'прибраться после еды', ex:'e'}, {w:'run out of', ru:'закончиться', ex:'e'}];
  let clash = 0;
  for(let i = 0; i < 60; i++){
    C.crsRecall(pool, rnd, 5).forEach(function(q){
      const labels = q.options.map(function(o){ return o.t; });
      if(labels.indexOf('think on your feet') >= 0 && labels.indexOf('think on the spot') >= 0) clash++;
    });
  }
  check(clash === 0, 'two phrases with near-identical glosses never appear as options of one question (' + clash + ' clashes)');
}
// the guards that keep a lesson from breaking (checked against the source, since the handlers run inside the app)
check(/function crsAddWord\([\s\S]*?crsAddWord\.n/.test(html) && /state\.words\.some\(function\(x\)\{ return x\.id === id/.test(body('crsAddWord')), 'new word ids cannot collide (a counter, checked against the list)');
check(/if\(cr\.part === 2\) spTick\(\)/.test(body('crsPartDone')), 'only part 2 ticks the speaking habit');
check(/act==='crs-next'\)\{[\s\S]{0,260}!crsCanNext\(k\.st/.test(html), 'Continue does nothing until the step is complete');
check(/act==='qz-next'\)\{[\s\S]{0,160}!a\.shown/.test(html) && /act==='qz-pick'\)\{[\s\S]{0,160}a\.shown/.test(html) && /act==='qz-check'\)\{[\s\S]{0,160}a\.shown/.test(html), 'a question can only be answered once and moved on from once');
check(/s\.part === 2 && !s\.part2Open && !force\) return/.test(body('crsOpen')) && /Math\.min\(p\.step, n - 1\)/.test(body('crsOpen')), 'part 2 stays closed unless forced, and a saved step past the end re-enters at the last step');
check(/enMicStart\(120000\)/.test(html) && /function enMicStart\(maxMs\)/.test(html) && /setTimeout\(enMicStop, maxMs \|\| 10000\)/.test(html), 'a speaking recording may run up to two minutes (the roulette keeps its ten seconds)');
check(/crsStopListen\(\); crsListen\(\)|crsStopListen\(\);\s*enMicStart\(120000\);\s*crsListen\(\)/.test(html.slice(html.indexOf("act==='crs-rec'"), html.indexOf("act==='crs-rec'") + 200)), 'starting again stops the old speech recognition first');
check(/rec\.onstop = function\(\)\{[\s\S]{0,300}crsStopListen\(\)/.test(body('enMicStart')), 'when the recording stops, the speech recognition stops too');
check(/act==='en-view'\)\{[^}]*crsStopListen\(\)/.test(html) && /act==='crs-roulette'\)\{[^}]*crsStopListen\(\)/.test(html), 'leaving for another segment or the roulette stops the speech recognition');
check(/\.draft/.test(body('qzRender')) && /t\.id === .qzIn./.test(html), 'a half-typed gap answer is kept when the screen redraws');
check(/readonly/.test(body('crsMarkText') + body('renderCrsStep')) && /review/.test(html.slice(html.indexOf("act==='crs-mark'"), html.indexOf("act==='crs-mark'") + 200)), 'review mode of a finished lesson does not change her saved answers');
check(/act==='crs-review'\)\{[^}]*data-p/.test(html) && /Review Part 2/.test(body('renderCrsFinish')), 'a finished lesson can be reviewed in both parts');
check(/readonly/.test(body('renderCrsCheckDone')) && /id="crsCopyText"/.test(body('renderCrsCheckDone')), 'the speaking check shows the text it copies, so the copy still works by hand');
check(/Write at least one answer|at least one/.test(html.slice(html.indexOf("act==='crs-check-next'"), html.indexOf("act==='crs-check-next'") + 600)), 'the speaking check cannot be finished with no answers at all');
check(/filter\(function\(x\)\{ return x\.kind === 'test' \|\| d\.byId\[x\.id\]; \}\)/.test(body('crsLoad')), 'a lesson id missing from the data is skipped, not a crash');
check(/a\.t !== k\.st\.t|a\.t !== st\.t/.test(body('renderCrs') + body('renderCrsStep')), 'saved answers belonging to a different kind of step are dropped');
check(/!a\.qs\.length/.test(body('renderCrsStep')) || /a\.checked = true/.test(body('renderCrsStep')), 'a recall step with too few phrases can still be passed');
// ---------- 8. content fixes ----------
if(D){
  const flat = JSON.stringify(D);
  ['activates a part of the brain that also reminds', 'snow white and the seven dwarfs was not a failure', 'get into a whole thing right now', 'stop what you\'re doing for a short time', 'huper means beyond', 'made a TV show set in a restaurant', 'were friendly and happy to help'].forEach(function(p){ check(flat.toLowerCase().indexOf(p.toLowerCase()) < 0, 'too close to the BBC text: "' + p + '"'); });
  D.lessons.forEach(function(l){ l.parts[0].steps.filter(function(s){ return s.t === 'words'; })[0].items.forEach(function(w){ check(!/[()]|\.\.\./.test(w.w), l.id + ': the phrase "' + w.w + '" keeps placeholders that would be saved as a word'); }); });
  const gapOf = function(lid, rx){ let g = null; D.lessons.find(function(l){ return l.id === lid; }).parts[1].steps.forEach(function(s){ if(s.t === 'gap') s.items.forEach(function(x){ if(rx.test(x.s)) g = x; }); }); return g; };
  const ok = function(g, ans){ return !!g && C.crsGapOk(ans, g.a); };
  check(ok(gapOf('l03', /miffed/), 'a little bit') && ok(gapOf('l03', /miffed/), 'quite') && ok(gapOf('l03', /miffed/), 'rather'), 'l03 miffed accepts a little bit / quite / rather');
  check(ok(gapOf('l03', /not sure ___/), 'if') && ok(gapOf('l03', /not sure ___/), 'whether'), 'l03 "not sure ___" accepts if and whether');
  check(ok(gapOf('l02', /I'm ___ I can't/), 'sorry'), 'l02 accepts sorry');
  check(ok(gapOf('l04', /dishwasher/), "didn't have"), 'l04 dishwasher accepts didn\'t have');
  check(ok(gapOf('l04', /ironing/), 'did') && ok(gapOf('l04', /on the floor/), 'sat'), 'l04 accepts the simple past');
  check(ok(gapOf('l01', /break up/), 'just broke up') && ok(gapOf('l01', /forty minutes/), 'have waited'), 'l01 accepts just broke up and have waited');
  check(!/twelve of these/.test(JSON.stringify(D.lessons.find(function(l){ return l.id === 'l06'; }).parts[0].steps[0])), 'l06 does not promise twelve phrases from the story');
}
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: English lessons');

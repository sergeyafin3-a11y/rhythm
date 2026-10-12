// English trainer, stage 1: spoken phrases, spaced repetition, level check, voice only inside English.
// Run:  osascript -l JavaScript tests/english_trainer.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }

// 1. the content
let P = null;
try{ P = JSON.parse(read(root + '/english/phrases.json')); }catch(e){ fails.push('english/phrases.json is missing or is not valid JSON'); }
if(P){
  check(P.sets.length === 10, '10 sets, got ' + P.sets.length);
  const ids = {}, cyr = /[а-яё]/i, all = [];
  P.sets.forEach(function(s){
    check(s.id && s.name && s.emoji && s.about && s.lvl >= 1 && s.lvl <= 3, 'set ' + s.id + ' lacks id / name / emoji / about / lvl 1-3');
    check(s.cards.length === 25, 'set ' + s.id + ' has ' + s.cards.length + ' cards, want 25');
    s.cards.forEach(function(c){
      all.push(c);
      check(!ids[c.id], 'duplicate card id ' + c.id); ids[c.id] = 1;
      check(c.id.indexOf(s.id) === 0, 'card ' + c.id + ' does not belong to set ' + s.id);
      check(c.en && c.ru && c.ex && c.exru, 'card ' + c.id + ' is missing en / ru / ex / exru');
      check(!cyr.test(c.en) && !cyr.test(c.ex), 'card ' + c.id + ': the English side has Russian letters');
      check(cyr.test(c.ru) && cyr.test(c.exru), 'card ' + c.id + ': the Russian side has no Russian letters');
      check(c.en.length <= 60 && c.ex.length <= 110, 'card ' + c.id + ' is too long to say in one breath');
    });
  });
  check(all.length === 250, '250 cards in all, got ' + all.length);
  const enSet = {}; all.forEach(function(c){ check(!enSet[c.en.toLowerCase()], 'the phrase "' + c.en + '" appears twice'); enSet[c.en.toLowerCase()] = 1; });
  check(P.sets.some(function(s){ return s.id === 'teach'; }), 'there is a set for her own lessons');
  check(P.placement.length === 20, '20 level-check questions, got ' + P.placement.length);
  P.placement.forEach(function(q, i){
    check(q.o.length === 4 && q.a >= 0 && q.a < 4 && q.lvl >= 1 && q.lvl <= 3, 'question ' + i + ' needs four options, a valid answer and lvl 1-3');
    check(new Set(q.o).size === 4, 'question ' + i + ' has repeated options');
  });
}

// 2. the pure logic
const m = /\/\* srs:pure \*\/([\s\S]*?)\/\* srs:end \*\//.exec(html);
check(!!m, 'no pure logic between /* srs:pure */ and /* srs:end */');
if(m && P){
  const A = new Function(m[1] + '; return {SRS_STEPS:SRS_STEPS, srsAdd:srsAdd, srsGrade:srsGrade, srsDue:srsDue, srsPlan:srsPlan, srsStats:srsStats, placeBuild:placeBuild, placeScore:placeScore, placeOrder:placeOrder};')();
  check(JSON.stringify(A.SRS_STEPS) === '[1,3,7,14,30,60]', 'the steps are 1, 3, 7, 14, 30, 60 days');
  check(A.srsAdd('2026-10-30', 3) === '2026-11-02' && A.srsAdd('2026-12-30', 3) === '2027-01-02', 'adding days crosses month and year ends');
  const T = '2026-10-12';
  // a new phrase: known at once jumps ahead, not known starts at one day
  let c = A.srsGrade(undefined, true, T, true);
  check(c.b === 1 && c.due === '2026-10-15' && c.seen === 1, 'a new phrase she already knows is next due in 3 days, got ' + JSON.stringify(c));
  c = A.srsGrade(undefined, false, T, true);
  check(c.b === 0 && c.due === '2026-10-13' && c.lapses === 0, 'a new phrase she does not know comes back tomorrow, got ' + JSON.stringify(c));
  // a review climbs the steps, forgetting drops to the start, the top step holds
  let x = {b:0, due:T, seen:1, ok:0, lapses:0, last:''}; const seenDue = [];
  for(let i = 0; i < 8; i++){ x = A.srsGrade(x, true, T); seenDue.push(x.due); }
  check(x.b === 5, 'the box stops at the top step, got ' + x.b);
  check(seenDue[0] === '2026-10-15' && seenDue[1] === '2026-10-19' && seenDue[4] === '2026-12-11', 'intervals follow the steps: ' + seenDue.join(' '));
  const f = A.srsGrade(x, false, T);
  check(f.b === 0 && f.due === '2026-10-13' && f.lapses === 1, 'forgetting sends it back to tomorrow and counts a lapse');
  check(x.b === 5 && x.lapses === 0, 'grading does not change the old record');
  // due list
  const cards = {a:{b:1, due:'2026-10-10'}, b:{b:0, due:'2026-10-12'}, c:{b:2, due:'2026-10-13'}, d:{b:1, due:'2026-10-01'}};
  check(JSON.stringify(A.srsDue(['a','b','c','d','e'], cards, T)) === '["d","a","b"]', 'due phrases come most overdue first, future and unseen ones stay out');
  // plan: review capped, new limited by what was already introduced today
  const deck = []; for(let i = 0; i < 30; i++) deck.push('p' + i);
  const many = {}; for(let i = 0; i < 14; i++) many['p' + i] = {b:0, due:'2026-10-11'};
  let plan = A.srsPlan(deck, many, T, 5, 10, 0);
  check(plan.rev.length === 10 && plan.fresh.length === 5 && plan.fresh[0] === 'p14', 'plan: 10 reviews, then 5 new from the first unseen, got ' + plan.rev.length + '/' + plan.fresh.join());
  plan = A.srsPlan(deck, many, T, 5, 10, 3);
  check(plan.fresh.length === 2, 'three already introduced today leaves two new, got ' + plan.fresh.length);
  check(A.srsPlan(deck, many, T, 5, 10, 9).fresh.length === 0, 'the daily limit is never exceeded');
  const st = A.srsStats(deck, {p0:{b:4, due:'2026-12-01'}, p1:{b:5, due:'2027-01-01'}, p2:{b:0, due:'2026-10-11'}, p3:{b:1, due:'2026-10-20'}}, T);
  check(st.total === 30 && st.learned === 2 && st.learning === 2 && st.due === 1 && st.fresh === 26, 'stats: ' + JSON.stringify(st));
  // level check
  let seed = 11; const rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const qs = A.placeBuild(P.placement, rnd);
  check(qs.length === 20 && qs.every(function(q){ return q.options.length === 4 && q.options.filter(function(o){ return o.ok; }).length === 1; }), 'the level check has 20 questions with exactly one right option each');
  const pos = {}; qs.forEach(function(q){ pos[q.options.findIndex(function(o){ return o.ok; })] = 1; });
  check(Object.keys(pos).length >= 3, 'the right answer is not always in the same place');
  check(A.placeScore(5, 20).level === 'starter' && A.placeScore(5, 20).newPerDay === 4, 'a low score starts gently with 4 new a day');
  check(A.placeScore(12, 20).level === 'core' && A.placeScore(12, 20).newPerDay === 5, 'a middle score keeps 5 a day');
  check(A.placeScore(18, 20).level === 'stretch' && A.placeScore(18, 20).newPerDay === 6, 'a high score gets harder sets and 6 a day');
  const ord = function(level){ return A.placeOrder(P.sets, level).map(function(s){ return s.lvl; }); };
  check(ord('starter')[0] === 1 && ord('stretch')[0] === 3 && ord('core')[0] === 2, 'the first set matches the level');
  check(A.placeOrder(P.sets, 'core').length === 10, 'ordering keeps every set');
}

// 3. wired into the app
check(/data-act="en-view" data-v="train"/.test(html), 'the English tab has a Train segment');
check(/state\.enView \|\| 'train'/.test(html) && !/state\.enView \|\| 'speak'/.test(html), 'Train is the default view of the English tab');
check(/act==='en-start'/.test(html) && /act==='en-rate'/.test(html) && /act==='en-say-next'/.test(html), 'the session has start / rate / say actions');
check(/act==='en-place-start'/.test(html) && /act==='en-pick'/.test(html), 'the level check has start / pick actions');
check(/act==='en-focus'/.test(html), 'a set can be moved to the front');
check(/english\/phrases\.json/.test(html), 'the phrases are loaded from english/phrases.json');
check(/function engState\(\)\{[^}]*state\.eng/.test(html), 'the trainer keeps its data in state.eng, created lazily');
check(/spTick\(\)/.test(/function engFinish\([a-z]*\)\{([\s\S]*?)\n\}/.exec(html) ? /function engFinish\([a-z]*\)\{([\s\S]*?)\n\}/.exec(html)[1] : ''), 'finishing a session ticks the speaking habit');
// voice only inside English, only on a tap
const ui = /\/\* eng:ui \*\/([\s\S]*?)\/\* eng:end \*\//.exec(html);
check(!!ui, 'the trainer UI is fenced by /* eng:ui */ … /* eng:end */');
const outside = ui ? html.replace(ui[0], '') : html;
check(!/speechSynthesis|SpeechSynthesisUtterance/.test(outside), 'the phone must not speak anywhere outside the English trainer');
check(ui && /speechSynthesis\.speak/.test(ui[1]) && /No English voice/.test(ui[1]), 'the voice says so when the phone has no English voice');
check(ui && !/speechSynthesis\.speak\([^)]*\)[^;]*;[\s\S]{0,40}setTimeout/.test(ui[1]) && /data-act="en-speak"/.test(ui[1]), 'the voice starts only from a tap on the 🔊 button');
check(/Spaced|spaced repetition|Train/.test(readme) && /phrases\.json/.test(readme), 'the README mentions the trainer and english/phrases.json');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: English trainer stage 1');

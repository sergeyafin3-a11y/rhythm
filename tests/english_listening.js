// English trainer, stage 3: listening (sound-alikes, dictation, short messages).
// Run:  osascript -l JavaScript tests/english_listening.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

// 1. the content
let L = null;
try{ L = JSON.parse(read(root + '/english/listening.json')); }catch(e){ fails.push('english/listening.json is missing or is not valid JSON'); }
if(L){
  const cyr = /[а-яё]/i, ids = {}, kinds = {pick:0, type:0, story:0}, said = {};
  const bySet = {}; L.sets.forEach(function(s){ bySet[s.kind] = (bySet[s.kind] || 0) + 1; });
  check(bySet.pick === 6 && bySet.type === 3 && bySet.story === 3, 'sets: 6 pick, 3 type, 3 story, got ' + JSON.stringify(bySet));
  L.sets.forEach(function(s){
    check(s.id && s.name && s.about && s.lvl >= 1 && s.lvl <= 3 && /^(pick|type|story)$/.test(s.kind), 'set ' + s.id + ' needs id / name / about / lvl 1-3 / kind');
    check(s.items.length === (s.kind === 'pick' ? 15 : s.kind === 'type' ? 12 : 4), 'set ' + s.id + ' has ' + s.items.length + ' items');
    s.items.forEach(function(it){
      kinds[s.kind]++;
      check(it.id && !ids[it.id], 'duplicate or missing item id ' + it.id); ids[it.id] = 1;
      check(it.say && !cyr.test(it.say), it.id + ': the spoken text must be English');
      check(!said[it.say.toLowerCase()], it.id + ': the same text appears twice'); said[it.say.toLowerCase()] = 1;
      if(s.kind === 'pick'){
        check(it.o.length === 3 && it.a === 0 && it.o[0] === it.say, it.id + ': three options, the first is exactly what is said');
        check(new Set(it.o.map(function(x){ return x.toLowerCase(); })).size === 3 && it.o.every(function(x){ return !cyr.test(x); }), it.id + ': the options must differ and be English');
        check(it.note && it.note.length <= 60, it.id + ': a short hint (at most 60 characters)');
      } else if(s.kind === 'type'){
        check(it.ru && cyr.test(it.ru) && it.say.split(/\s+/).length >= 3 && it.say.split(/\s+/).length <= 14, it.id + ': Russian meaning and 3-14 words');
      } else {
        const wc = it.say.split(/\s+/).length;
        check(wc >= 40 && wc <= 90, it.id + ': a story of 40-90 words, got ' + wc);
        check(it.qs.length === 2 && it.qs.every(function(q){ return q.q && q.o.length === 3 && q.a === 0 && new Set(q.o).size === 3 && !cyr.test(q.q + q.o.join()); }), it.id + ': two questions with three different English options');
      }
    });
  });
  check(kinds.pick === 90 && kinds.type === 36 && kinds.story === 12, 'items: 90 / 36 / 12, got ' + JSON.stringify(kinds));
  // the right answer must not stand out by length
  let longest = 0, total = 0;
  L.sets.forEach(function(s){ s.items.forEach(function(it){
    const groups = s.kind === 'pick' ? [it.o] : s.kind === 'story' ? it.qs.map(function(q){ return q.o; }) : [];
    groups.forEach(function(o){ total++; if(o[0].length > Math.max(o[1].length, o[2].length)) longest++; });
  }); });
  check(longest <= total * 0.5, 'the right option is the longest in ' + longest + ' of ' + total + ' (at most half)');
}

// 2. the pure logic
const sm = /\/\* srs:pure \*\/([\s\S]*?)\/\* srs:end \*\//.exec(html), m = /\/\* lis:pure \*\/([\s\S]*?)\/\* lis:end \*\//.exec(html);
check(!!m, 'no pure logic between /* lis:pure */ and /* lis:end */');
if(m && sm){
  const S = new Function(sm[1] + '; return {placeOrder:placeOrder, srsShuffle:srsShuffle, srsDue:srsDue};')();
  const A = new Function('placeOrder', 'srsShuffle', 'srsDue', m[1] + '; return {lisNorm:lisNorm, lisCheck:lisCheck, lisRound:lisRound, LIS_ROUND:LIS_ROUND, LIS_SPEEDS:LIS_SPEEDS};')(S.placeOrder, S.srsShuffle, S.srsDue);
  check(A.lisNorm("  Can’t  come, on FRIDAY! ") === "can't come on friday", 'normalising lower-cases, straightens apostrophes and drops punctuation');
  const ok = function(t, s){ return A.lisCheck(t, s).ok; };
  check(ok("i can't come on friday", "I can't come on Friday."), 'capitals and the full stop do not matter');
  check(!ok('i can come on friday', "I can't come on Friday."), 'can vs can\'t is a mistake');
  check(!ok("i can't come friday", "I can't come on Friday."), 'a missing word is a mistake');
  check(!ok("i can't come on a friday", "I can't come on Friday."), 'an extra word is a mistake');
  check(ok("Could you say that agian, please", "Could you say that again, please?"), 'a one-letter slip in a long word is forgiven');
  check(!ok('I want to go', "I won't go"), 'short words are not forgiven');
  const r = A.lisCheck("could you say that please", "Could you say that again, please?");
  check(r.words.map(function(w){ return w.hit ? 1 : 0; }).join('') === '111101' && r.words[4].raw === 'again,', 'the missed word is marked with its original punctuation: ' + r.words.map(function(w){ return w.raw + (w.hit ? '+' : '-'); }).join(' '));
  check(A.lisCheck('', 'Hello there').ok === false && A.lisCheck('hello there', 'Hello there').extra === 0, 'empty input is wrong, a perfect one has no extra words');
  check(A.LIS_ROUND.pick === 5 && A.LIS_ROUND.type === 2 && A.LIS_ROUND.story === 1, 'a round is 5 + 2 + 1');
  check(A.LIS_SPEEDS.slow < A.LIS_SPEEDS.normal && A.LIS_SPEEDS.normal < A.LIS_SPEEDS.fast, 'three speeds, slow to fast');
  if(L){
    let seed = 3; const rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const T = '2026-10-16';
    const r1 = A.lisRound(L.sets, {}, T, 'core', rnd);
    check(r1.filter(function(x){ return x.kind === 'pick'; }).length === 5 && r1.filter(function(x){ return x.kind === 'type'; }).length === 2 && r1.filter(function(x){ return x.kind === 'story'; }).length === 1, 'a fresh round has 5 + 2 + 1 items');
    check(new Set(r1.map(function(x){ return x.id; })).size === 8, 'no item twice in a round');
    check(r1.filter(function(x){ return x.kind === 'pick'; }).every(function(x){ return x.options.length === 3 && x.options.filter(function(o){ return o.ok; }).length === 1; }), 'each sound-alike item has exactly one right option');
    check(r1.filter(function(x){ return x.kind === 'story'; })[0].qs.every(function(q){ return q.options.filter(function(o){ return o.ok; }).length === 1; }), 'each story question has exactly one right option');
    const lvlOf = {}; L.sets.forEach(function(s){ s.items.forEach(function(it){ lvlOf['L:' + it.id] = s.lvl; }); });
    check(A.lisRound(L.sets, {}, T, 'starter', rnd).filter(function(x){ return x.kind === 'pick'; }).every(function(x){ return lvlOf[x.id] === 1; }), 'a gentle start begins with the easy sets');
    check(A.lisRound(L.sets, {}, T, 'stretch', rnd).filter(function(x){ return x.kind === 'pick'; }).every(function(x){ return lvlOf[x.id] === 3; }), 'a strong start begins with the hard sets');
    // due items come back, up to half of each kind, and new ones are not repeated
    const first = r1.filter(function(x){ return x.kind === 'pick'; }).map(function(x){ return x.id; });
    const cards = {}; first.forEach(function(id){ cards[id] = {b:0, due:'2026-10-15', seen:1}; });
    const r2 = A.lisRound(L.sets, cards, T, 'core', rnd), p2 = r2.filter(function(x){ return x.kind === 'pick'; }).map(function(x){ return x.id; });
    check(p2.length === 5 && p2.filter(function(id){ return first.indexOf(id) >= 0; }).length === 3, 'three of five sound-alikes are the ones that are due, the rest are new: ' + p2.join());
    check(p2.slice(0, 3).every(function(id){ return first.indexOf(id) >= 0; }), 'the due ones come first');
    const future = {}; first.forEach(function(id){ future[id] = {b:1, due:'2026-10-20', seen:1}; });
    check(A.lisRound(L.sets, future, T, 'core', rnd).filter(function(x){ return x.kind === 'pick'; }).every(function(x){ return first.indexOf(x.id) < 0; }), 'items waiting for a later day are not repeated');
  }
}

// 3. wired into the app, and the voice rules still hold
['lis-start', 'lis-speed', 'lis-play', 'lis-pick', 'lis-check', 'lis-next', 'lis-show'].forEach(function(a){ check(new RegExp("act==='" + a + "'").test(html), 'handler ' + a + ' is missing'); });
check(/english\/listening\.json/.test(html), 'the tasks are loaded from english/listening.json');
check(/Listening/.test(body('renderTrain')) && /lis-start/.test(body('renderTrain')) && /lisSpeedChips\(\)/.test(body('renderTrain')), 'the Train hub has a Listening card with the speed chips');
check(/srsGrade\(/.test(body('lisGrade')) && /e\.cards\[it\.id\]/.test(body('lisGrade')), 'a listening item is graded with the same spaced-repetition steps as the cards');
check(/English voice/.test(body('lisStart')) && /English voice/.test(body('lisPlay')), 'with no English voice the app says so instead of staying silent');
const ui = /\/\* eng:ui \*\/([\s\S]*?)\/\* eng:end \*\//.exec(html);
check(ui && /function lisPlay\(/.test(ui[1]) && !/speechSynthesis/.test(html.replace(ui[0], '')), 'the voice lives only inside the trainer block');
check(!/lisPlay\(/.test(body('renderLisPlay')) && !/lisPlay\(/.test(body('lisStart')) && !/speechSynthesis\.speak/.test(body('lisStart') + body('renderLisPlay')), 'nothing plays by itself: the voice starts only from a tap on Play');
check(/id="lisIn"/.test(body('renderLisPlay')) && /autocapitalize="none"/.test(body('renderLisPlay')), 'the dictation field does not capitalise or autocorrect for her');
check(/listening\.json/.test(readme) && /Listening|listening/.test(readme), 'the README mentions listening');
// review fixes
if(m && sm){
  const S2 = new Function(sm[1] + '; return {placeOrder:placeOrder, srsShuffle:srsShuffle, srsDue:srsDue};')();
  const C = new Function('placeOrder', 'srsShuffle', 'srsDue', m[1] + '; return {lisCheck:lisCheck};')(S2.placeOrder, S2.srsShuffle, S2.srsDue);
  const ok2 = function(t, said){ return C.lisCheck(t, said).ok; };
  check(ok2('Dont forget to switch off the lights', "Don't forget to switch off the lights."), 'a missing apostrophe is not a mistake (dont)');
  check(ok2('Im sorry Im a bit late', "I'm sorry, I'm a bit late."), 'a missing apostrophe is not a mistake (im)');
  check(ok2('I cant make it on Thursday but any other day suits me', "I can't make it on Thursday, but any other day suits me."), 'cant is accepted for can\'t');
  check(ok2("'Hello' there", 'Hello there'), 'quote marks around a word do not matter');
  check(!ok2('She teache English to children', 'She teaches English to children.'), 'a missing final s is a mistake');
  check(!ok2("I'll call you back in ten minute", "I'll call you back in ten minutes."), 'a missing plural s is a mistake');
  check(!ok2('Dont forget to switch off the light', "Don't forget to switch off the lights."), 'light for lights is a mistake');
  check(!ok2('The train leave at half past nine', 'The train leaves at half past nine.'), 'leave for leaves is a mistake');
  check(!ok2('Where is the three', 'Where is the there'), 'confusable words are not forgiven');
  check(!ok2('It was quiet good', 'It was quite good'), 'quiet for quite is a mistake');
  check(ok2('Could you say that agian please', 'Could you say that again, please?'), 'a swapped pair of letters is still forgiven');
  check(ok2("I'll call you back in 10 minutes", "I'll call you back in ten minutes."), 'digits are accepted for number words');
  check(ok2('The train leaves at half past 9', 'The train leaves at half past nine.'), 'nine and 9 are the same');
  check(C.lisCheck('we run out of the milk again', "We've run out of milk again.").extra === 2, 'extra words are counted for the message');
}
check(/extra word/.test(body('renderLisPlay')), 'an extra typed word is reported, so a green line never says Not quite without a reason');
check(/function lsLoad\(\)\{\s*if\(LS \|\| lsLoading \|\| lsFailed\) return;/.test(html), 'lsLoad stops after a failure');
check(/l\.draft/.test(body('renderLisPlay')), 'what she has typed survives a redraw (coming back to the app)');
check(/key === 'Enter'/.test(body('renderLisPlay')), 'Enter checks the dictation');
check(/autocorrect="off"/.test(body('renderLisPlay')), 'the dictation field does not autocorrect');
check(/days/.test(body('lisGrade')), 'an unfinished round still counts in today’s totals');
check(/scroll-margin-bottom/.test(html), 'the Next button is not hidden behind the tab bar');
if(L){
  const flat = JSON.stringify(L);
  check(flat.indexOf('Either of them came') < 0 && flat.indexOf('Have you got a menu') < 0, 'two odd distractors are still in pick-4 / pick-6');
  check(!/Her laptop|she had two private|She went to the cinema alone/.test(flat), 'story questions say “the speaker”, not a gender nobody mentioned');
}

if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: English trainer, listening');

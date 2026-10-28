// Word games: more ways to learn her saved words than flashcards — speed round, match pairs, type it, build the phrase, listen.
// Run:  osascript -l JavaScript tests/word_games.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };
let seed = 11; const rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

// ---------- 1. pure logic ----------
const wm = /\/\* wq:pure \*\/([\s\S]*?)\/\* wq:end \*\//.exec(html), gm = /\/\* wg:pure \*\/([\s\S]*?)\/\* wg:end \*\//.exec(html);
check(!!wm, 'the word-test pure block is missing');
check(!!gm, 'no pure game logic between /* wg:pure */ and /* wg:end */');
let G = null;
if(wm && gm){
  G = new Function(wm[1] + gm[1] + '; return {wqUsable:wqUsable, wgQuestion:wgQuestion, wgPick:wgPick, wgPairs:wgPairs, wgTypeOk:wgTypeOk, wgHint:wgHint, wgTiles:wgTiles, wgGrade:wgGrade, wgBest:wgBest, wgReady:wgReady, wgPhrase:wgPhrase, wgSpoken:wgSpoken};')();
  const W = function(i, term, ru, extra){ return Object.assign({id:'w' + i, term:term, ru:ru, ctx:'', box:0}, extra || {}); };
  const words = [W(1, 'go through a rough patch', 'переживать трудный период', {ctx:'We went through a rough patch last year.'}), W(2, 'spill the tea', 'выдать сплетню'), W(3, 'cut corners', 'халтурить'), W(4, 'pull your weight', 'делать свою долю работы'), W(5, 'a big ask', 'большая просьба'), W(6, 'think on your feet', 'соображать на ходу'), W(7, 'nag', 'пилить'), W(8, 'take a breather', 'сделать передышку')];

  // a question always has four different options, one right, in both directions
  ['mean', 'term'].forEach(function(dir){
    for(let i = 0; i < 40; i++){
      const w = words[i % words.length], q = G.wgQuestion(words, w, rnd, dir);
      const ok = q.options.filter(function(o){ return o.ok; }), seen = {};
      q.options.forEach(function(o){ seen[o.t.toLowerCase()] = true; });
      check(q.options.length === 4 && ok.length === 1 && Object.keys(seen).length === 4, dir + ': four different options with one right answer');
      check(q.wid === w.id && q.kind === dir, dir + ': the question says which word and which direction');
      check(dir === 'mean' ? (q.prompt === w.term && ok[0].t === w.ru) : (q.prompt === w.ru && ok[0].t === w.term), dir + ': the right option is the word\'s own meaning / term');
    }
  });
  check(G.wgQuestion(words.slice(0, 3), words[0], rnd, 'mean') === null, 'with fewer than four words there are not enough options: no question');

  // the next word is a weak one, and never one of the last few if there is any other
  const weak = words.map(function(w, i){ return Object.assign({}, w, {box:i < 4 ? 0 : 4}); });
  const counts = {}; let recent = [];
  for(let i = 0; i < 300; i++){ const w = G.wgPick(weak, recent, rnd); counts[w.id] = (counts[w.id] || 0) + 1; check(recent.indexOf(w.id) < 0, 'a word just asked is not asked again at once'); recent = recent.concat([w.id]).slice(-3); }
  const weakN = ['w1', 'w2', 'w3', 'w4'].reduce(function(a, k){ return a + (counts[k] || 0); }, 0);
  check(weakN > 300 - weakN, 'words she knows least come up more often: ' + weakN + ' of 300');
  check(G.wgPick([], [], rnd) === null, 'no words, no pick');

  // match pairs: n words, all different, with different meanings
  const dup = words.concat([W(9, 'hold off', 'халтурить')]);
  for(let i = 0; i < 30; i++){
    const p = G.wgPairs(dup, 6, rnd), ids = {}, ms = {};
    p.forEach(function(x){ ids[x.id] = 1; ms[x.meaning.toLowerCase()] = 1; });
    check(p.length === 6 && Object.keys(ids).length === 6 && Object.keys(ms).length === 6, 'six pairs: different words with different meanings');
  }
  check(G.wgPairs(words.slice(0, 3), 6, rnd).length === 0 && G.wgPairs(words.slice(0, 5), 6, rnd).length === 5, 'fewer than four: no board; four to five: a smaller board');

  // typing: tolerant of case, punctuation, the leading «to», placeholders and contractions
  const ok = function(t, term){ return G.wgTypeOk(t, term); };
  check(ok('Spill the tea!', 'spill the tea') && ok('spill the tea', 'to spill the tea') && ok('to spill the tea', 'to spill the tea'), 'case, punctuation and a leading «to» do not matter');
  check(ok('get on with', 'get on with (sb)') && ok('get on with someone', 'get on with (sb)') && ok('get on with sb', 'get on with someone'), 'placeholders like (sb) / someone may be left out or typed');
  check(ok('don\'t mind', 'do not mind') && ok('do not mind', 'don\'t mind'), 'contractions are the same as the full form');
  check(!ok('spill tea', 'spill the tea') && !ok('', 'spill the tea') && !ok('cut corner', 'cut corners'), 'a missing word, an empty answer or a wrong ending is not right');
  const hint = G.wgHint('go through a rough patch');
  check(hint === 'g_ t______ a r____ p____', 'the hint shows the first letter of each word and dashes for the rest: ' + hint);

  // build the phrase: the same words, in another order
  for(let i = 0; i < 30; i++){
    const t = G.wgTiles('go through a rough patch', rnd);
    check(t.length === 5 && t.slice().sort().join() === ['a', 'go', 'patch', 'rough', 'through'].sort().join() && t.join(' ') !== 'go through a rough patch', 'tiles: the same five words, shuffled out of order');
  }
  check(G.wgTiles('nag', rnd).length === 1, 'a single word is a single tile');

  // grading: typing from memory is the strongest proof; other games only push a word back when it was missed
  const w0 = Object.assign({}, words[0], {box:2, seen:3, right:2, last:'2026-10-01'});
  const t1 = G.wgGrade(w0, true, 'type', '2026-10-28'), s1 = G.wgGrade(w0, true, 'speed', '2026-10-28'), m1 = G.wgGrade(w0, false, 'speed', '2026-10-28'), m2 = G.wgGrade(Object.assign({}, w0, {box:0}), false, 'match', '2026-10-28');
  check(t1.box === 3 && t1.right === 3 && t1.seen === 4, 'a word typed right moves up a box');
  check(s1.box === 2 && s1.right === 3 && s1.seen === 4, 'a word picked right in a speed game keeps its box');
  check(m1.box === 1 && m1.right === 2 && m1.seen === 4, 'a missed word drops one box (not all the way back)');
  check(m2.box === 0, 'the box never goes below zero');
  check(t1.last === '2026-10-01' && s1.last === '2026-10-01' && m1.last === '2026-10-01', 'games never change when the daily test last asked a word, so it still gets its turn');
  check(w0.box === 2 && w0.seen === 3, 'the saved word is not changed in place');
  check(G.wgBest(null, 9, false).score === 9 && G.wgBest({score:12}, 9, false).score === 12 && G.wgBest({score:12}, 15, false).score === 15, 'the best score is kept (higher is better)');
  check(G.wgBest({score:4, n:4}, 7, false, 8).score === 4 && G.wgBest({score:7, n:8}, 8, false, 8).score === 8 && G.wgBest({score:3, n:4}, 8, false, 8).score === 8, 'rounds of different length are compared by the share right, and the best keeps its length');
  check(G.wgBest({score:40}, 35, true).score === 35 && G.wgBest({score:40}, 50, true).score === 40, 'the best time is kept (lower is better)');
  check(G.wgReady(words, 'speed') && G.wgReady(words, 'match') && !G.wgReady(words.slice(0, 3), 'speed') && !G.wgReady([W(1, 'nag', 'пилить'), W(2, 'cut', 'резать'), W(3, 'tea', 'чай'), W(4, 'ask', 'просить')], 'build'), 'a game is ready when enough usable words fit it (build needs phrases of two or more words)');
  check(G.wgReady(words, 'build') && G.wgReady(words, 'type') && G.wgReady(words, 'listen'), 'every game is ready with eight usable words');
  // review round 1: a game is ready only when it can really be played
  const dupes = [W(1, 'cut corners', 'халтурить'), W(2, 'cut corners', 'халтурить'), W(3, 'nag', 'пилить'), W(4, 'ask', 'просить')];
  check(!G.wgReady(dupes, 'speed') && !G.wgReady(dupes, 'match') && !G.wgReady(dupes, 'listen'), 'four saved words that are really three (a duplicate) cannot feed a speed round, a board or a listening round');
  check(G.wgReady(dupes, 'type'), 'typing needs no other options, so four words are enough');
  const odd = [W(1, 'a/the ...', 'артикль'), W(2, 'to do / make a point', 'сделать замечание'), W(3, 'bye bye', 'пока'), W(4, 'nag', 'пилить'), W(5, 'spill the tea', 'выдать сплетню'), W(6, 'cut corners', 'халтурить')];
  check(!G.wgPhrase(odd[0]) && !G.wgPhrase(odd[1]) && !G.wgPhrase(odd[2]) && !G.wgPhrase(odd[3]) && G.wgPhrase(odd[4]), 'Build leaves out slashes, dots, identical words and single words');
  check(!G.wgReady(odd, 'build'), 'with only two usable phrases there is no Build round');
  // typing without an apostrophe, with a bracket, with slash alternatives
  const ok2 = function(t, term){ return G.wgTypeOk(t, term); };
  check(ok2('dont mind', "don't mind") && ok2("don't mind", 'dont mind') && ok2('isnt it', "isn't it") && ok2('can not stand', "can't stand") && ok2('cant stand', "can't stand") && ok2('wont', "won't") && ok2('it is', "it's"), 'a contraction typed without its apostrophe (or spelled out) is right');
  check(ok2('be fed up with sb', 'be fed up (with sb)') && ok2('be fed up', 'be fed up (with sb)') && ok2('be fed up with', 'be fed up (with sb)'), 'what is in brackets may be typed or left out');
  check(ok2('make a point', 'to do / make a point') && ok2('do a point', 'to do / make a point') && ok2('to make a point', 'to do / make a point'), 'either side of a slash is right');
  check(!ok2('the', 'the ...') && !ok2('lot', 'a lot') && !ok2('a', 'a lot'), 'one article or half the phrase is not an answer');
  // what the phone says aloud
  check(G.wgSpoken('be fed up (with sb)') === 'be fed up with somebody' && G.wgSpoken('spill the tea') === 'spill the tea' && !/[\/.]/.test(G.wgSpoken('a/the ...')) && !/[\/.]/.test(G.wgSpoken('to do / make a point')), 'the phone says a clean phrase: no brackets, slashes, dots, or spelled-out sb');
}

// ---------- 2. wiring ----------
const hub = body('renderSavedWords');
check(/data-act="wg-start"/.test(body('wgHub') + hub) && /Play with your words|Word games/.test(body('wgHub') + hub), 'the Words screen has the game tiles');
['speed', 'match', 'build', 'listen'].forEach(function(g){ check(new RegExp("game === '" + g + "'").test(body('wgStart')), 'wgStart starts the game ' + g); });
check(/const n = game === 'build' \? 6 : 8/.test(body('wgStart')), 'wgStart starts Type it, Build and Listen as rounds of questions');
check(/clearInterval\(wgTimer\)/.test(body('wgStop')) && /clearInterval\(wgTimer\)/.test(body('wgFinish')), 'the timer is cleared when a game is stopped and when it ends');
check(/wgStop\(\)/.test(body('engLeave')), 'leaving the English tab stops a running game');
check(/act==='en-view'\)\{[^}]*wgStop\(\)/.test(html), 'switching English sections stops a running game');
check(/if\(wg\) return renderWordGame\(\)/.test(body('renderEnglish')), 'the English tab shows the running game');
['wg-start', 'wg-pick', 'wg-next', 'wg-quit', 'wg-sel', 'wg-check', 'wg-tile', 'wg-undo', 'wg-play', 'wg-hub'].forEach(function(a){ check(html.indexOf("act==='" + a + "'") >= 0, 'the handler ' + a + ' exists'); });
check(/id:\+\+wgSeq/.test(body('wgStart')) && /wg\.id === gid|gid === wg\.id/.test(html), 'a pending feedback timer belongs to its own game (a game id), so it can never act on the next game');
check(/function engCanSpeak\(\)/.test(html) && /engCanSpeak\(\)/.test(body('wgHub')), 'the Listen tile is switched off on a phone without a voice (checked inside the English block)');
check(/function engHush\(\)/.test(html) && /engHush\(\)/.test(body('wgStop')), 'leaving or moving on stops a phrase that is still being spoken');
check(!/wgState\(\)/.test(body('wgHub')), 'drawing the tiles creates nothing in her saved data');
check(/wgStart\(/.test(body('wgSpeedNext') + body('wgStart')) && /!wg\.q/.test(body('wgStart')), 'a game that cannot build its first question says so instead of freezing');
check(/e\.key === 'Enter'[\s\S]{0,300}wg-next/.test(html), 'Enter moves on after a checked answer');
check(/bad\[(first\.side === 'l' \? first\.id : id)\]/.test(html) || /wg\.bad\[left\]/.test(html), 'a wrong match marks only the phrase, not the meaning she tapped by mistake');
check(/wgGrade\(/.test(html) && /state\.words\[/.test(body('wgGradeWord')) , 'answers are written back to her saved words');
check(/state\.wq\.games|wqState\(\)\.games/.test(html) && !/state\.wq = \{/.test(body('wgState')), 'game records live in state.wq.games, created lazily, the daily test data is untouched');
check(/engSpeak\(/.test(body('renderWordGame') + html.slice(html.indexOf("act==='wg-play'"), html.indexOf("act==='wg-play'") + 300)), 'the listening game speaks through the existing English voice');
const ui = /\/\* eng:ui \*\/([\s\S]*?)\/\* eng:end \*\//.exec(html);
check(!!ui && !/speechSynthesis/.test(html.replace(ui[0], '')), 'the phone still speaks only inside the English block');
check(/wg-start|wg-hub/.test(body('wqTodayCard')) && /data-act="wg-hub"/.test(body('wqTodayCard')), 'the Today word-test card points to the games');
check(/Word games|word games/.test(readme) && /Speed round/.test(readme) && /Match pairs/.test(readme), 'the README describes the games');
check(!/localStorage/.test(body('renderWordGame')), 'games save through the normal save(), not their own storage');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the word games');

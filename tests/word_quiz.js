// The daily word test: built from her own saved words only.
// Run:  osascript -l JavaScript tests/word_quiz.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(cond, msg){ if(!cond) fails.push(msg); }

// the mood card is gone from Today
check(html.indexOf('How are you today?') < 0, 'the "How are you today?" check-in card is still in the app');

const m = /\/\* wq:pure \*\/([\s\S]*?)\/\* wq:end \*\//.exec(html);
check(!!m, 'no pure word-test logic found between /* wq:pure */ and /* wq:end */');
if(m){
  const api = new Function(m[1] + '; return {wqMeaning:wqMeaning, wqUsable:wqUsable, wqBlank:wqBlank, wqBuild:wqBuild, wqGrade:wqGrade, wqBest:wqBest, WQ_MIN:WQ_MIN};')();
  let seed = 7; const rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const W = function(term, ru, ctx, box, last, mean){ return {id:'w'+term, term:term, ru:ru, mean:mean || '', ctx:ctx || '', box:box || 0, seen:0, right:0, last:last || ''}; };
  const words = [
    W('spill the tea', 'выдать сплетню', 'Come on, spill the tea about the party!'),
    W('to ghost someone', 'пропасть без объяснений', 'He ghosted me after two dates.'),
    W('hangry', 'злой от голода', 'Feed me, I am hangry.'),
    W('flex', 'хвастаться', 'He always flexes about his car.'),
    W('lowkey', 'втайне, слегка', 'I lowkey love this song.'),
    W('no cap', 'без вранья', 'That was the best pizza, no cap.'),
    W('bail', 'слинять', 'I had to bail on the meeting.'),
    W('vibe', '—', 'Great vibe here.'),            // no usable meaning
    W('empty', '', 'Nothing here.')                // no meaning at all
  ];
  check(api.WQ_MIN >= 4, 'a test needs at least 4 usable words');
  check(api.wqUsable(words).length === 7, 'words without a meaning (or with "—") must be skipped, got ' + api.wqUsable(words).length);
  check(api.wqMeaning(W('x', '—', '', 0, '', 'plain meaning')) === 'plain meaning', 'falls back to the English meaning when the Russian one is "—"');

  check(api.wqBuild(words.slice(0, 3), 5, '2026-10-02', rnd).length === 0, 'fewer than 4 usable words must give no questions');

  const qs = api.wqBuild(words, 5, '2026-10-02', rnd);
  check(qs.length === 5, 'expected 5 questions, got ' + qs.length);
  const seenWords = {};
  qs.forEach(function(q, i){
    const ok = q.options.filter(function(o){ return o.ok; });
    check(ok.length === 1, 'question ' + i + ' must have exactly one right option');
    check(q.options.length >= 3 && q.options.length <= 4, 'question ' + i + ' has ' + q.options.length + ' options');
    check(new Set(q.options.map(function(o){ return o.t; })).size === q.options.length, 'question ' + i + ' has repeated options');
    check(!seenWords[q.wid], 'word ' + q.wid + ' is asked twice in one test'); seenWords[q.wid] = true;
    const w = words.filter(function(x){ return x.id === q.wid; })[0];
    check(!!w, 'question ' + i + ' points at an unknown word');
    if(w && q.kind === 'blank') check(q.prompt.toLowerCase().indexOf(w.term.toLowerCase()) < 0 && q.prompt.indexOf('____') >= 0, 'a blank question must hide the word: ' + q.prompt);
    if(w && q.kind === 'mean') check(ok[0].t === api.wqMeaning(w), 'the right option of a meaning question must be the word’s meaning');
  });

  // the weakest words come first; one already asked today waits
  const known = [W('a1', 'один', '', 4, '2026-09-20'), W('a2', 'два', '', 4, '2026-09-20'), W('a3', 'три', '', 4, '2026-09-20'),
                 W('a4', 'четыре', '', 0, '2026-09-20'), W('a5', 'пять', '', 0, '2026-10-02'), W('a6', 'шесть', '', 1, '2026-09-30')];
  const ids = api.wqBuild(known, 3, '2026-10-02', rnd).map(function(q){ return q.wid; });
  check(ids.indexOf('wa4') >= 0 && ids.indexOf('wa6') >= 0, 'the two weakest words (a4, a6) must be asked; got ' + ids.join(','));
  check(ids.indexOf('wa5') < 0, 'a word already asked today (a5) must wait; got ' + ids.join(','));

  check(api.wqBlank('He ghosted me after two dates.', 'ghost') === 'He ____ me after two dates.', 'wqBlank should hide an inflected single word');
  check(api.wqBlank('Come on, spill the tea about the party!', 'spill the tea') === 'Come on, ____ about the party!', 'wqBlank should hide a whole phrase');
  check(api.wqBlank('Nothing about it here.', 'lowkey') === null, 'wqBlank returns null when the word is not in the sentence');
  // found in review: short words match whole words only, every occurrence is hidden, articles stay in the phrase
  check(api.wqBlank('An interesting day in town', 'in') === 'An interesting day ____ town', 'a short word must not match inside another word (in / interesting)');
  check(api.wqBlank('She said item one, then it broke.', 'it') === 'She said item one, then ____ broke.', '"it" must not blank "item"');
  check(api.wqBlank('He flexes. I do not flex.', 'flex') === 'He ____. I do not ____.', 'every occurrence of the word is hidden, not only the first');
  check(api.wqBlank('Well, that is a lot of work.', 'a lot') === 'Well, that is ____ of work.', 'a phrase that starts with an article is hidden as a whole');
  check(api.wqBlank("I don't know.", 'don’t') === 'I ____ know.', 'a curly apostrophe in the saved word still finds the straight one');
  // a second round never lowers the score already earned today
  check(api.wqBest({n:5, right:5}, 2, 5).right === 5, 'another round must not overwrite a better score');
  check(api.wqBest({n:5, right:2}, 4, 5).right === 4, 'a better second round replaces the score');
  check(api.wqBest(null, 3, 5).right === 3 && api.wqBest(null, 3, 5).n === 5, 'the first round sets the score');

  const g1 = api.wqGrade(W('r', 'р', '', 2), true, '2026-10-02');
  check(g1.box === 3 && g1.last === '2026-10-02' && g1.seen === 1 && g1.right === 1, 'a right answer moves the word up one box');
  check(api.wqGrade(W('r', 'р', '', 4), true, '2026-10-02').box === 4, 'box never goes above 4');
  const g2 = api.wqGrade(W('r', 'р', '', 3), false, '2026-10-02');
  check(g2.box === 0 && g2.seen === 1 && g2.right === 0, 'a wrong answer sends the word back to box 0');
}
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: word test logic');

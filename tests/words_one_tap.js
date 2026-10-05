// "Learn 7 new words" is a single tick, and the days already logged keep their meaning.
// Run:  osascript -l JavaScript tests/words_one_tap.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
check(/\{id:'h2', title:'Learn 7 new words',\s+emoji:'🔤', perDay:1,/.test(html), 'a fresh install must start with the words habit as one tick (perDay:1)');
check(/\{t:'Learn 7 new words', e:'🔤', p:1,/.test(html), 'the habit library must offer the words habit as one tick');
check(/function seed\(\)\{[\s\S]*?cleanWords:true/.test(html), 'a fresh install and a reset must carry cleanWords:true');
check(/if\(!state\.cleanWords\)\{[^}]*wordsOneTap\(/.test(html), 'the migration runs once at load, behind the cleanWords flag');
const imp = /act==='import-data'\)\{[\s\S]*?\n  \}\n/.exec(html);
check(!!imp && /wordsOneTap\(/.test(imp[0]) && /cleanWords/.test(imp[0]), 'restoring an old backup must run the words migration once');
const m = /\/\* words:pure \*\/([\s\S]*?)\/\* words:end \*\//.exec(html);
check(!!m, 'no pure words migration found between /* words:pure */ and /* words:end */');
if(m){
  const api = new Function(m[1] + '; return {isWordsHabit:isWordsHabit, wordsOneTap:wordsOneTap};')();
  check(api.isWordsHabit({title:'Learn 7 new words'}) && api.isWordsHabit({id:'h2', title:'Vocabulary'}) && api.isWordsHabit({title:'Выучить 10 слов'}), 'the words habit is recognised, even renamed (id h2) or in Russian');
  check(!api.isWordsHabit({title:'Review new words'}) && !api.isWordsHabit({title:'Speak new words aloud'}) && !api.isWordsHabit({title:'Learn new grammar'}), 'a habit that merely mentions "new words" is not touched');
  check(api.isWordsHabit({title:'Learn 10 words'}) && api.isWordsHabit({title:'Learn 7 new words'}), 'Learn N (new) words is recognised');
  check(!api.isWordsHabit({title:'Yoga'}) && !api.isWordsHabit({title:'Speaking spin'}) && !api.isWordsHabit({title:'20 pages of a book'}) && !api.isWordsHabit({title:'Face massage'}), 'other habits are not touched');
  const habits = [{id:'h2', title:'Learn 7 new words', perDay:7}, {id:'h5', title:'Yoga', perDay:1}, {id:'w', title:'Eight glasses of water', perDay:1}];
  const log = {h2:{'2026-09-30':7, '2026-10-01':3, '2026-10-02':9, '2026-10-03':0}, h5:{'2026-10-03':1}};
  const out = api.wordsOneTap(habits, log);
  check(habits[0].perDay === 1 && out.changed === true, 'the words habit becomes one tick a day');
  check(habits[1].perDay === 1 && habits[2].perDay === 1 && log.h5['2026-10-03'] === 1, 'other habits are untouched');
  check(log.h2['2026-09-30'] === 1 && log.h2['2026-10-02'] === 1, 'a day with all seven (or more) stays done');
  check(!(log.h2['2026-10-01'] >= 1), 'a day with only three words stays NOT done');
  check(api.wordsOneTap(habits, log).changed === false && log.h2['2026-09-30'] === 1 && !(log.h2['2026-10-01'] >= 1), 'running it twice changes nothing');
  const h2 = [{id:'x', title:'Learn 7 new words', perDay:1}], l2 = {x:{'2026-10-01':1}};
  check(api.wordsOneTap(h2, l2).changed === false && l2.x['2026-10-01'] === 1, 'an already-single-tick habit is left alone');
  check(api.wordsOneTap(null, null).changed === false, 'no habits, no crash');
}
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the words habit is one tick');

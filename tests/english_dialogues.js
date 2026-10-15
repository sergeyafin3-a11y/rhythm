// English trainer, stage 2: mini-dialogues.
// Run:  osascript -l JavaScript tests/english_dialogues.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

// 1. the content
let D = null;
try{ D = JSON.parse(read(root + '/english/dialogues.json')); }catch(e){ fails.push('english/dialogues.json is missing or is not valid JSON'); }
if(D){
  const cyr = /[а-яё]/i, ids = {}, replies = {};
  check(D.scenes.length === 16, '16 scenes, got ' + D.scenes.length);
  const groups = {}; D.scenes.forEach(function(s){ const g = s.id.split('-')[0]; groups[g] = (groups[g] || 0) + 1; });
  check(groups.teach === 5 && groups.daily === 5 && groups.work === 3 && groups.social === 2 && groups.travel === 1, 'groups should be teach 5 / daily 5 / work 3 / social 2 / travel 1, got ' + JSON.stringify(groups));
  const lv = {1:0, 2:0, 3:0}; D.scenes.forEach(function(s){ lv[s.lvl]++; });
  check(lv[1] === 5 && lv[2] === 6 && lv[3] === 5, 'levels 5 / 6 / 5, got ' + JSON.stringify(lv));
  let longest = 0, you = 0;
  D.scenes.forEach(function(s){
    check(!ids[s.id], 'duplicate scene id ' + s.id); ids[s.id] = 1;
    check(s.name && s.emoji && s.about && !cyr.test(s.about), 'scene ' + s.id + ' lacks name / emoji / English about');
    check(s.turns.length === 6 && s.turns.map(function(t){ return t.who; }).join() === 'them,you,them,you,them,you', 'scene ' + s.id + ' must go them, you, them, you, them, you');
    s.turns.forEach(function(t, i){
      if(t.who === 'them'){
        check(t.en && t.ru && !cyr.test(t.en) && cyr.test(t.ru) && t.en.length <= 90, s.id + ' turn ' + i + ': their line needs English en (max 90) and Russian ru');
      } else {
        you++;
        check(t.en && t.ru && !cyr.test(t.en) && cyr.test(t.ru) && t.en.length <= 90, s.id + ' turn ' + i + ': her turn needs a Russian instruction and an English reply (max 90)');
        check(t.bad && t.bad.length === 2, s.id + ' turn ' + i + ': exactly two wrong options');
        (t.bad || []).forEach(function(b){ check(b.t && b.why && !cyr.test(b.t) && cyr.test(b.why) && b.why.length <= 80, s.id + ' turn ' + i + ': a wrong option needs English text and a Russian reason (max 80)'); });
        const all = [t.en].concat((t.bad || []).map(function(b){ return b.t; }));
        check(new Set(all.map(function(x){ return x.toLowerCase(); })).size === 3, s.id + ' turn ' + i + ': the three options must differ');
        check(!replies[t.en.toLowerCase()], 'the reply "' + t.en + '" appears in two scenes'); replies[t.en.toLowerCase()] = 1;
        if(t.en.length > Math.max.apply(null, (t.bad || []).map(function(b){ return b.t.length; }))) longest++;
      }
    });
  });
  check(you === 48, '48 replies in all, got ' + you);
  check(longest <= 20, 'the right reply is the longest option in ' + longest + ' of 48 turns (at most 20 — guessing "the longest" should not work)');
}

// 2. the pure logic
const m = /\/\* dlg:pure \*\/([\s\S]*?)\/\* dlg:end \*\//.exec(html);
check(!!m, 'no pure logic between /* dlg:pure */ and /* dlg:end */');
if(m){
  const A = new Function('placeOrder', 'srsShuffle', m[1] + '; return {dlgBuild:dlgBuild, dlgNext:dlgNext, dlgGroup:dlgGroup};');
  const pm = /\/\* srs:pure \*\/([\s\S]*?)\/\* srs:end \*\//.exec(html);
  const S = new Function(pm[1] + '; return {placeOrder:placeOrder, srsShuffle:srsShuffle};')();
  const api = A(S.placeOrder, S.srsShuffle);
  let seed = 5; const rnd = function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const scene = {id:'teach-x', lvl:1, turns:[
    {who:'them', en:'Hi!', ru:'Привет!'},
    {who:'you', ru:'Поздоровайся.', en:'Hello there.', bad:[{t:'Hi you.', why:'Резко.'}, {t:'Greetings.', why:'Слишком формально.'}]},
    {who:'them', en:'How are you?', ru:'Как дела?'},
    {who:'you', ru:'Ответь.', en:"I'm fine, thanks.", bad:[{t:'I am fine thanks you.', why:'Ошибка.'}, {t:'Fine.', why:'Сухо.'}]}]};
  const b = api.dlgBuild(scene, rnd);
  check(b.length === 4 && b[0].who === 'them' && b[0].en === 'Hi!', 'their lines pass through unchanged');
  check(b[1].options.length === 3 && b[1].options.filter(function(o){ return o.ok; }).length === 1 && b[1].options.find(function(o){ return o.ok; }).t === 'Hello there.', 'her turn has three options, exactly one right');
  check(b[1].options.filter(function(o){ return !o.ok; }).every(function(o){ return !!o.why; }) && !b[1].options.find(function(o){ return o.ok; }).why, 'wrong options carry their reason, the right one does not');
  check(b[1].right === 'Hello there.' && b[3].ru === 'Ответь.', 'the right reply and the instruction are kept');
  const pos = {}; for(let i = 0; i < 40; i++){ const x = api.dlgBuild(scene, rnd); pos[x[1].options.findIndex(function(o){ return o.ok; })] = 1; }
  check(Object.keys(pos).length === 3, 'the right option moves around');
  check(scene.turns[1].bad.length === 2 && scene.turns[1].en === 'Hello there.', 'building does not change the source scene');
  const sc = [{id:'teach-a', lvl:1}, {id:'daily-b', lvl:2}, {id:'work-c', lvl:3}, {id:'daily-d', lvl:2}];
  check(api.dlgNext(sc, {}, 'starter').id === 'teach-a' && api.dlgNext(sc, {}, 'stretch').id === 'work-c' && api.dlgNext(sc, {}, 'core').id === 'daily-b', 'the next scene is the one nearest her level');
  check(api.dlgNext(sc, {'teach-a':{}}, 'starter').id === 'daily-b', 'a scene already done is skipped');
  check(api.dlgNext(sc, {'teach-a':1, 'daily-b':1, 'work-c':1, 'daily-d':1}, 'core') === null, 'when every scene is done there is no next one');
  check(api.dlgGroup('teach-first') === 'Your lessons' && api.dlgGroup('daily-cafe') === 'Everyday' && api.dlgGroup('work-call') === 'Work' && api.dlgGroup('social-party') === 'People' && api.dlgGroup('travel-hotel') === 'Travel', 'ids map to the five group names');
}

// 3. wired into the app
check(/english\/dialogues\.json/.test(html), 'the scenes are loaded from english/dialogues.json');
['dlg-open', 'dlg-start', 'dlg-pick', 'dlg-next', 'dlg-ru', 'dlg-save', 'en-speak-t'].forEach(function(a){ check(new RegExp("act==='" + a + "'").test(html), 'handler ' + a + ' is missing'); });
check(/Mini-dialogues/.test(body('renderTrain')) && /dlg-open/.test(body('renderTrain')), 'the Train hub has a Mini-dialogues card');
check(/spTick\(\)/.test(body('dlgFinish')), 'finishing a scene ticks the speaking habit');
const save = body('dlgSave');
check(/state\.words\.push/.test(save) && /toLowerCase/.test(save) && /src:'dialogue'/.test(save), 'saving phrases adds them to her saved words and skips duplicates');
const ui = /\/\* eng:ui \*\/([\s\S]*?)\/\* eng:end \*\//.exec(html);
check(ui && /function renderDlgPlay\(/.test(ui[1]) && /function dlgFinish\(/.test(ui[1]), 'the dialogue screens live inside the trainer block, the only place with voice');
check(!/speechSynthesis/.test(html.replace(ui ? ui[0] : '', '')), 'the phone still speaks nowhere outside the trainer');
check(/dlg-ru/.test(body('renderDlgPlay')) && /Show translation/.test(body('renderDlgPlay')), 'the other person’s line has a Show translation toggle');
check(/en-mic/.test(body('renderDlgPlay')) && /engSpeakBtns\(t\.right\)/.test(body('renderDlgPlay')), 'after a reply she can hear it and record herself');
check(/dialogues\.json/.test(readme) && /Mini-dialogues|mini-dialogues/.test(readme), 'the README mentions the dialogues');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: English trainer, mini-dialogues');

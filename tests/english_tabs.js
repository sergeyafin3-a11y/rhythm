// The English tab keeps three things: Lessons, Speak (the roulette) and Words. The Train section is gone.
// Run:  osascript -l JavaScript tests/english_tabs.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
function exists(p){ return $.NSFileManager.defaultManager.fileExistsAtPath(p); }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

const seg = body('enSeg');
check(/data-v="lessons"/.test(seg) && /data-v="speak"/.test(seg) && /data-v="words"/.test(seg), 'the segments are Lessons, Speak and Words');
check(!/data-v="train"/.test(seg) && (seg.match(/data-act="en-view"/g) || []).length === 3, 'there are exactly three segments and no Train');
const re = body('renderEnglish');
check(/renderCourse\(\)/.test(re) && /renderTalk\(\)/.test(re) && /renderSavedWords\(\)/.test(re) && !/renderTrain/.test(re), 'the English tab draws the lessons, the roulette or the words');
// everything that belonged to Train is gone
['renderTrain', 'renderEnCard', 'renderEnSay', 'renderEnDone', 'renderEnPlace', 'engStart', 'engRate', 'engDeck', 'engPlan', 'phLoad', 'srsPlan', 'srsGrade', 'srsDue', 'srsStats', 'srsMerge', 'placeBuild', 'placeScore', 'placeOrder',
 'renderDlgList', 'renderDlgPlay', 'dlgBuild', 'dlgNext', 'dlLoad', 'renderLisPlay', 'lisCheck', 'lisRound', 'lsLoad', 'lisPlay'].forEach(function(n){
  check(!new RegExp('\\b' + n + '\\b').test(html), n + ' is still in the app');
});
['en-start', 'en-more', 'en-show', 'en-rate', 'en-focus', 'en-place-start', 'en-pick', 'dlg-open', 'dlg-start', 'dlg-pick', 'dlg-save', 'lis-start', 'lis-play', 'lis-pick', 'lis-check', 'lis-speed'].forEach(function(a){
  check(html.indexOf("act==='" + a + "'") < 0, 'the handler ' + a + ' is still there');
});
check(!/Mini-dialogues|15 minutes of English|Level check/.test(html), "the Train wording is gone from the app");
['phrases', 'dialogues', 'listening'].forEach(function(f){ check(!exists(root + '/english/' + f + '.json'), 'english/' + f + '.json is no longer shipped'); });
check(exists(root + '/english/talk.json') && exists(root + '/english/lessons.json'), 'the roulette topics and the lessons stay');
check(!/\*\*Train\*\*|english\/phrases\.json|english\/dialogues\.json|english\/listening\.json|Mini-dialogues/.test(readme), 'the README no longer describes Train, the dialogues or the listening tasks');
// what the lessons still need
['engState', 'engVoice', 'engSpeak', 'engLeave', 'enMicStart', 'enMicStop', 'enMicReset', 'srsShuffle', 'enRender'].forEach(function(n){ check(new RegExp('function ' + n + '\\(').test(html), n + ' must stay: the lessons use it'); });
check(/act==='en-speak-t'/.test(html) && /act==='en-view'/.test(html) && /act==='en-retry'/.test(html), 'the shared handlers stay');
check(/engState\(\)\{ if\(!state\.eng\) state\.eng = \{\}; return state\.eng; \}/.test(html), 'engState no longer creates the old Train fields (existing saved data is left untouched)');
// a user who last stood on the Train segment lands on the lessons
check(!/state\.enView = 'train'/.test(html) && /state\.enView \|\| 'lessons'/.test(re + seg), 'nobody is sent to a Train screen any more');
check(/if\(state\.enView !== 'speak' && state\.enView !== 'words'\) state\.enView = 'lessons';/.test(html), 'a saved "train" (or anything unknown) is turned into Lessons so a segment is always lit');
// the voice rule still holds
const ui = /\/\* eng:ui \*\/([\s\S]*?)\/\* eng:end \*\//.exec(html);
check(!!ui && /speechSynthesis\.speak/.test(ui[1]) && !/speechSynthesis/.test(html.replace(ui[0], '')), 'the phone still speaks only inside the English block');
// the other English parts still work
check(/function renderTalk\(/.test(html) && /function renderSavedWords\(/.test(html) && /function renderCourse\(/.test(html), 'roulette, saved words and lessons are all still drawn');
check(/state\.engCourse/.test(html), 'the one-time move to Lessons stays');
check(!/come back as cards|coming back as cards|card queue/.test(html), "no text promises the removed cards");
check((html.match(/if\(state\.enView !== 'speak' && state\.enView !== 'words'\) state\.enView = 'lessons';/g) || []).length >= 2, "restoring a backup also turns an old Train view into Lessons");
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the English tab has Lessons, Speak and Words');

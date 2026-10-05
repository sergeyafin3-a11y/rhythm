// The calorie counter is gone: no card on Today, no screens, no food database, no handlers — and nothing left dangling.
// Run:  osascript -l JavaScript tests/food_removed.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const gone = ['FOOD_DB', 'FD_BY', 'FD_ACT', 'FD_PACE', 'FD_NUM', 'FD_UNITS', 'fdState', 'fdPlan', 'fdDay', 'fdTotals', 'fdNorm', 'fdMatch', 'fdParse', 'fdParseItem', 'fdAdd', 'fdQty', 'fdTime', 'fdShortDate', 'fdLatestWeight', 'fdTodayCard', 'renderFood', 'sheetFoodSetup', 'sheetFoodEdit', 'sheetWeigh', 'fdEdit'];
gone.forEach(function(name){ check(!new RegExp('\\b' + name + '\\b').test(html), name + ' is still in the app'); });
check(!/data-act="fd-|act==='fd-|id="fdQuick"|'fdQuick'/.test(html), 'food buttons / handlers / the quick-add field are still in the app');
check(!/todayView === 'food'/.test(html), 'the food screen is still wired into Today');
check(html.indexOf('Count calories') < 0 && html.indexOf('kcal') < 0 && html.indexOf('Set my target') < 0, 'calorie texts are still in the app');
check(html.indexOf('Buckwheat') < 0 && html.indexOf('гречк') < 0, 'the food database is still in the file');
// the shared caption style must survive: the word test and the Arc use it
check(/\.fd-sub\{/.test(html), 'the .fd-sub caption style is used by the word test and the Arc and must stay');
['fd-card', 'fd-top', 'fd-nums', 'fd-quick', 'fd-list', 'fd-row', 'fd-week', 'fd-weight', 'fd-opt', 'fd-two'].forEach(function(c){ check(html.indexOf(c) < 0, '.' + c + ' styles are still in the file'); });
check(!/food|calor|kcal/i.test(readme), 'the README still talks about food or calories');
// size: the file was 321 KB with the database; it must have shrunk
check(html.length < 290000, 'index.html is still ' + Math.round(html.length / 1000) + ' KB — the food database should be gone');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the calorie counter is gone (' + Math.round(html.length / 1000) + ' KB)');

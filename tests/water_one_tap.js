// "Eight glasses of water" is a single tick now, and the days already logged keep their meaning.
// Run:  osascript -l JavaScript tests/water_one_tap.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
check(/\{id:'h7', title:'Eight glasses of water',\s+emoji:'💧', perDay:1,/.test(html), 'a fresh install must start with the water habit as one tick (perDay:1)');
check(/\{t:'Eight glasses of water', e:'💧', p:1,/.test(html), 'the habit library must offer the water habit as one tick');
const m = /\/\* water:pure \*\/([\s\S]*?)\/\* water:end \*\//.exec(html);
check(!!m, 'no pure water migration found between /* water:pure */ and /* water:end */');
if(m){
  const api = new Function(m[1] + '; return {isWaterHabit:isWaterHabit, waterOneTap:waterOneTap};')();
  check(api.isWaterHabit({title:'Eight glasses of water'}) && !api.isWaterHabit({title:'Yoga'}) && !api.isWaterHabit({title:'Face massage'}), 'isWaterHabit recognises only the water habit');
  const habits = [{id:'h7', title:'Eight glasses of water', perDay:8}, {id:'h5', title:'Yoga', perDay:1}];
  const log = {h7:{'2026-09-30':8, '2026-10-01':3, '2026-10-02':9, '2026-10-03':0}, h5:{'2026-10-03':1}};
  const out = api.waterOneTap(habits, log);
  check(habits[0].perDay === 1, 'the water habit becomes one tick a day');
  check(habits[1].perDay === 1 && log.h5['2026-10-03'] === 1, 'other habits are untouched');
  check(log.h7['2026-09-30'] === 1, 'a day with all 8 glasses stays done');
  check(log.h7['2026-10-02'] === 1, 'a day with more than 8 stays done');
  check(!(log.h7['2026-10-01'] >= 1), 'a day with only 3 glasses stays NOT done');
  check(out.changed === true, 'reports that it changed something');
  const again = api.waterOneTap(habits, log);
  check(again.changed === false && log.h7['2026-09-30'] === 1 && !(log.h7['2026-10-01'] >= 1), 'running it twice changes nothing');
  const h2 = [{id:'x', title:'Eight glasses of water', perDay:1}], l2 = {x:{'2026-10-01':1}};
  check(api.waterOneTap(h2, l2).changed === false && l2.x['2026-10-01'] === 1, 'an already-single-tick habit is left alone');
  // found in review: a renamed water habit, a habit that merely mentions a glass, wiring for restore and reset
  const hr = [{id:'h7', title:'Drink 8 glasses', perDay:8}, {id:'z', title:'Стакан сока утром', perDay:3}, {id:'y', title:'A glass of water on waking', perDay:1}], lr = {h7:{'2026-10-01':8}, z:{'2026-10-01':3}};
  api.waterOneTap(hr, lr);
  check(hr[0].perDay === 1 && lr.h7['2026-10-01'] === 1, 'the seed habit h7 is migrated even after she renamed it');
  check(hr[1].perDay === 3 && lr.z['2026-10-01'] === 3, 'a habit that only mentions a glass of juice is not touched');
  check(api.isWaterHabit({title:'Вода — 8 стаканов'}) && api.isWaterHabit({title:'Выпить 8 стаканов воды'}), 'Russian titles for the water habit are recognised');
}
check(/function seed\(\)\{[\s\S]*?cleanWater:true/.test(html), 'a fresh install and a reset must carry cleanWater:true so the migration never runs on them');
const imp = /act==='import-data'\)\{[\s\S]*?\n  \}\n/.exec(html);
check(!!imp && /waterOneTap\(/.test(imp[0]) && /cleanWater/.test(imp[0]), 'restoring an old backup must run the water migration once');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: water is one tick');

// "Core & strength": a pool of follow-along videos, abs first, five at a time, new ones after each tick.
// Run:  osascript -l JavaScript tests/core_strength.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }

const dm = /const STRENGTH_VIDEOS = (\[[\s\S]*?\n\]);/.exec(html);
check(!!dm, 'STRENGTH_VIDEOS not found');
const list = dm ? new Function('return ' + dm[1])() : [];
check(list.length >= 20, 'need at least 20 videos so the batches of five do not repeat quickly, got ' + list.length);
const ids = {}, vs = {};
list.forEach(function(x){
  check(['abs', 'back', 'arms', 'legs'].indexOf(x.focus) >= 0, x.id + ': focus must be abs/back/arms/legs, got ' + x.focus);
  check(x.min >= 8 && x.min <= 15, x.id + ' lasts ' + x.min + ' min, must be 8–15');
  check(x.lang === 'ru' || x.lang === 'en', x.id + ': lang');
  check(x.t && x.by && x.v && x.desc && x.desc.length >= 20 && x.desc.length <= 150, x.id + ': title, channel, id and a 20–150 character description are required');
  check(!/[Ѐ-ӿ]/.test(x.t + x.desc), x.id + ': title and description must be English');
  check(!ids[x.id] && !vs[x.v], x.id + ': duplicate id or video');
  ids[x.id] = vs[x.v] = true;
  check(!/убира|убрать|похуд|fat loss|belly fat|lose weight/i.test(x.t + ' ' + x.desc), x.id + ': no promises of losing fat in one place');
});
check(list.filter(function(x){ return x.focus === 'abs'; }).length >= list.length * 0.4, 'abs must be at least 40% of the pool — it is what she wants most');
['back', 'arms', 'legs'].forEach(function(f){ check(list.some(function(x){ return x.focus === f; }), 'no ' + f + ' video in the pool'); });
check(list.filter(function(x){ return x.lang === 'ru'; }).length >= 8, 'at least 8 videos in Russian');
const per = {}; list.forEach(function(x){ per[x.by] = (per[x.by] || 0) + 1; });
Object.keys(per).forEach(function(k){ check(per[k] <= 4, k + ' has ' + per[k] + ' videos, at most 4 per channel'); });

const m = /\/\* sc:pure \*\/([\s\S]*?)\/\* sc:end \*\//.exec(html);
check(!!m, 'no pure ordering logic between /* sc:pure */ and /* sc:end */');
if(m && list.length){
  const api = new Function(m[1] + '; return {scOrder:scOrder};')();
  const hash = function(s){ let x = 7; for(let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 1000003; return x; };
  const o = api.scOrder(list, hash), o2 = api.scOrder(list, hash);
  check(o.length === list.length && new Set(o.map(function(x){ return x.id; })).size === list.length, 'the order contains every video exactly once');
  check(o.map(function(x){ return x.id; }).join() === o2.map(function(x){ return x.id; }).join(), 'the order is stable');
  for(let i = 0; i + 5 <= Math.min(10, o.length); i++){
    const abs = o.slice(i, i + 5).filter(function(x){ return x.focus === 'abs'; }).length;
    check(abs >= 2, 'five in a row from position ' + i + ' hold only ' + abs + ' abs videos (need 2)');
  }
  check(['back', 'arms', 'legs'].every(function(f){ return o.slice(0, 7).some(function(x){ return x.focus === f; }); }), 'the first seven include back, arms and legs too');
}
check(/\{match:\/core[^,]*?\/i, hint:scHint, panel:scPanel\}/.test(html), 'the Core & strength habit must open the video panel (HABIT_PANELS)');
check(/ygHabitChanged\(h\); fcHabitChanged\(h\); scHabitChanged\(h\);/.test(html), 'ticking a habit must move the strength videos on (scHabitChanged in toggleHabit)');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: ' + list.length + ' strength videos, abs first');

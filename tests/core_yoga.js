// Yoga with a strength focus: more core / back / arms / legs classes, spread evenly through every band.
// Run:  osascript -l JavaScript tests/core_yoga.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const dm = /const YOGA = (\[[\s\S]*?\n\]);/.exec(html);
check(!!dm, 'YOGA not found');
const YOGA = dm ? new Function('return ' + dm[1])() : [];
const strong = YOGA.filter(function(x){ return x.strong; });
check(strong.length >= 15, 'need at least 15 strength-focused classes, got ' + strong.length);
check(!YOGA.some(function(x){ return x.v === 'qcoeyxva4bQ' || x.v === '-vSaYAidfI4'; }), 'dropped after review: one is called “intensive” and partly on the floor, the other promises a flat belly in its title');
const band = function(x){ return x.min >= 15 && x.min <= 25 ? 'low' : x.min >= 26 && x.min <= 35 ? 'mid' : x.min >= 36 && x.min <= 45 ? 'full' : 'out'; };
const ids = {}, vs = {};
YOGA.forEach(function(x){ check(!ids[x.id] && !vs[x.v], x.id + ': duplicate id or video'); ids[x.id] = vs[x.v] = true; });
strong.forEach(function(x){
  check(band(x) !== 'out', x.id + ' lasts ' + x.min + ' min, outside 15–45');
  check(x.intensity === 'medium' || x.intensity === 'hard', x.id + ': a strength class is never "soft"');
  check(!/beginner|basics|для начина/i.test(x.t + ' ' + x.desc), x.id + ': no beginner classes');
  check(!/yin|restor|nidra|fat|burn|lose/i.test(x.t + ' ' + x.desc), x.id + ': no yin/restorative and no fat-loss promises');
  check(x.lang === 'ru' || x.lang === 'en', x.id + ': lang');
  check(!/[Ѐ-ӿ]/.test(x.t + x.desc), x.id + ': English title and description');
});
['low', 'mid', 'full'].forEach(function(b, i){ check(strong.filter(function(x){ return band(x) === b; }).length >= [3, 5, 3][i], 'too few strength classes in the ' + b + ' band'); });
check(strong.filter(function(x){ return x.lang === 'ru'; }).length >= 6, 'at least 6 strength classes in Russian');

const m = /\/\* yg:pure \*\/([\s\S]*?)\/\* yg:end \*\//.exec(html);
check(!!m, 'no pure mixing logic between /* yg:pure */ and /* yg:end */');
if(m){
  const api = new Function(m[1] + '; return {ygMix:ygMix, ygDoneSet:ygDoneSet, ygPickUnseen:ygPickUnseen};')();
  const hash = function(s){ let x = 7; for(let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 1000003; return x; };
  // the three bands exactly as the app builds them
  const bands = {low:[15, 25], mid:[26, 35], full:[36, 45]};
  Object.keys(bands).forEach(function(k){
    const fits = YOGA.filter(function(w){ return w.min >= bands[k][0] && w.min <= bands[k][1]; });
    const kind = fits.filter(function(w){ return k === 'full' ? w.intensity !== 'soft' : w.intensity !== 'hard'; });
    const pool = kind.length >= 4 ? kind : fits;
    const mixed = api.ygMix(pool, hash);
    check(mixed.length === pool.length && new Set(mixed.map(function(x){ return x.id; })).size === pool.length, k + ': the mix keeps every video exactly once');
    // the strength classes are spread evenly through the whole cycle — not all at the start
    const idx = []; mixed.forEach(function(x, i){ if(x.strong) idx.push(i); });
    check(idx.length >= 3, k + ': at least three strength classes');
    check(idx[0] <= 3, k + ': the first strength class comes within the first four picks, got position ' + idx[0]);
    const limit = Math.ceil(mixed.length / idx.length) + 1;
    for(let j = 0; j < idx.length; j++){
      const gap = (idx[(j + 1) % idx.length] - idx[j] + mixed.length) % mixed.length || mixed.length;
      check(gap <= limit, k + ': a gap of ' + gap + ' picks without a strength class (at most ' + limit + ')');
    }
  });
  check(api.ygMix([], hash).length === 0, 'an empty list stays empty');
  const only = [{v:'a', strong:true}, {v:'b', strong:true}];
  check(api.ygMix(only, hash).length === 2, 'a list with only strength classes works');
  const none = [{v:'a'}, {v:'b'}, {v:'c'}];
  check(api.ygMix(none, hash).length === 3, 'a list without strength classes works');
}
const body = function(name){ const mm = new RegExp('function ' + name + '\\(.*?\\)\\{[\\s\\S]*?\\n\\}\\n').exec(html); return mm ? mm[0] : ''; };
check(/ygMix\(/.test(body('ygPool')), 'ygPool must build each band through ygMix');
check(/ygPickUnseen\(/.test(body('ygPick')) && /ygDoneSet\(/.test(body('ygPick')), 'ygPick must skip videos she has already done');
// found in review: a pool that is re-mixed must not hand her videos she has already done
if(m){
  const api3 = new Function(m[1] + '; return {ygDoneSet:ygDoneSet, ygPickUnseen:ygPickUnseen};')();
  const done = api3.ygDoneSet({'2026-10-01':{log:[{k:'mid', v:'A'}, {k:'low', v:'B'}]}, '2026-10-02':{doneId:'C'}, '2026-10-03':{doneId:'pool', log:[{k:'pool'}]}, '2026-10-04':null});
  check(done.A && done.B && done.C && Object.keys(done).length === 3, 'the done set holds exactly the videos from every logged day (no "pool", no empty days)');
  const pool = [{v:'A'}, {v:'B'}, {v:'C'}, {v:'D'}, {v:'E'}];
  check(api3.ygPickUnseen(pool, 0, done).v === 'D', 'from index 0 it skips A, B, C and offers D');
  check(api3.ygPickUnseen(pool, 3, done).v === 'D' && api3.ygPickUnseen(pool, 4, done).v === 'E', 'an unseen video at the index is offered as it is');
  check(api3.ygPickUnseen(pool, 5, done).v === 'D', 'the index wraps round the pool');
  check(api3.ygPickUnseen(pool, 0, {A:1, B:1, C:1, D:1, E:1}).v === 'A', 'once she has done them all it simply offers the one at the index');
  check(api3.ygPickUnseen([], 0, {}) === null, 'an empty pool offers nothing');
  check(api3.ygPickUnseen(pool, undefined, {}).v === 'A' && api3.ygPickUnseen(pool, NaN, {}).v === 'A', 'a missing or broken index starts from the beginning instead of crashing');
}
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: ' + strong.length + ' strength-focused yoga classes mixed into the three bands');

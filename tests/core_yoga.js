// Yoga with a strength focus: more core / back / arms / legs classes, mixed in with every other pick.
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
check(strong.length >= 16, 'need at least 16 strength-focused classes, got ' + strong.length);
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
  const api = new Function(m[1] + '; return {ygMix:ygMix};')();
  const hash = function(s){ let x = 7; for(let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 1000003; return x; };
  // the three bands exactly as the app builds them
  const bands = {low:[15, 25], mid:[26, 35], full:[36, 45]};
  Object.keys(bands).forEach(function(k){
    const fits = YOGA.filter(function(w){ return w.min >= bands[k][0] && w.min <= bands[k][1]; });
    const kind = fits.filter(function(w){ return k === 'full' ? w.intensity !== 'soft' : w.intensity !== 'hard'; });
    const pool = kind.length >= 4 ? kind : fits;
    const mixed = api.ygMix(pool, hash);
    check(mixed.length === pool.length && new Set(mixed.map(function(x){ return x.id; })).size === pool.length, k + ': the mix keeps every video exactly once');
    const head = mixed.slice(0, 6), s = head.filter(function(x){ return x.strong; }).length, total = pool.filter(function(x){ return x.strong; }).length;
    check(s >= Math.min(3, total), k + ': the first six picks hold only ' + s + ' strength classes (need 3)');
    for(let i = 0; i + 1 < Math.min(8, mixed.length); i += 2){
      if(pool.filter(function(x){ return x.strong; }).length >= 4 && pool.filter(function(x){ return !x.strong; }).length >= 4)
        check(!!mixed[i].strong !== !!mixed[i + 1].strong || (mixed[i].strong && mixed[i + 1].strong), k + ': picks ' + i + ' and ' + (i + 1) + ' should alternate strong / other');
    }
  });
  check(api.ygMix([], hash).length === 0, 'an empty list stays empty');
  const only = [{v:'a', strong:true}, {v:'b', strong:true}];
  check(api.ygMix(only, hash).length === 2, 'a list with only strength classes works');
  const none = [{v:'a'}, {v:'b'}, {v:'c'}];
  check(api.ygMix(none, hash).length === 3, 'a list without strength classes works');
}
check(/ygPools\[b\.k\] = ygMix\(/.test(html), 'ygPool must build each band through ygMix');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: ' + strong.length + ' strength-focused yoga classes mixed into the three bands');

// The two winter themes (Frost, Aurora) are complete and readable.
// Run:  osascript -l JavaScript tests/winter_themes.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }

function lum(hex){
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function(v){ v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b){ const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function vars(id){
  const m = new RegExp('\\[data-skin="' + id + '"\\]\\{([\\s\\S]*?)\\n\\}').exec(html);
  if(!m) return null;
  const out = {}; m[1].replace(/--([a-z0-9-]+):\s*([^;]+);/g, function(_, k, v){ out[k] = v.trim(); return ''; });
  return out;
}
const skinsM = /const SKINS = (\[[\s\S]*?\n\]);/.exec(html);
check(!!skinsM, 'SKINS not found');
const SKINS = skinsM ? new Function('return ' + skinsM[1])() : [];
const themeColor = /const THEME_COLOR = (\{[^}]*\});/.exec(html);
const TC = themeColor ? new Function('return ' + themeColor[1])() : {};
const decorM = /const DECOR = \{([\s\S]*?)\n\};/.exec(html);

['frost', 'aurora'].forEach(function(id){
  const s = SKINS.filter(function(x){ return x.id === id; })[0];
  check(!!s, id + ' is missing from SKINS');
  const v = vars(id);
  check(!!v, id + ' has no [data-skin="' + id + '"] CSS block');
  check(!!TC[id], id + ' has no entry in THEME_COLOR');
  check(!!decorM && new RegExp('\\b' + id + ':\\s*\\n?\\s*\'<svg').test(decorM[1]), id + ' has no DECOR drawing');
  if(!v) return;
  ['ground', 'surface', 'surface-2', 'line', 'ink', 'ink-soft', 'ink-mute', 'accent', 'accent-ink', 'accent-soft', 'gold', 'font-display', 'font-body', 'shadow', 'radius', 'radius-lg'].forEach(function(k){ check(v[k] !== undefined, id + ' lacks --' + k); });
  if(v.ink && v.ground){
    check(ratio(v.ink, v.ground) >= 7, id + ': ink on ground ' + ratio(v.ink, v.ground).toFixed(1) + ' (need 7)');
    check(ratio(v.ink, v.surface) >= 7, id + ': ink on surface ' + ratio(v.ink, v.surface).toFixed(1) + ' (need 7)');
    check(ratio(v['ink-soft'], v.surface) >= 4.5, id + ': ink-soft on surface ' + ratio(v['ink-soft'], v.surface).toFixed(1) + ' (need 4.5)');
    check(ratio(v['ink-soft'], v.ground) >= 4.5, id + ': ink-soft on ground ' + ratio(v['ink-soft'], v.ground).toFixed(1) + ' (need 4.5)');
    check(ratio(v['ink-mute'], v.surface) >= 3, id + ': ink-mute on surface ' + ratio(v['ink-mute'], v.surface).toFixed(1) + ' (need 3)');
    check(ratio(v.accent, v.surface) >= 4.5, id + ': accent on surface ' + ratio(v.accent, v.surface).toFixed(1) + ' (need 4.5, it is used for text)');
    check(ratio(v.accent, v.ground) >= 3, id + ': accent on ground ' + ratio(v.accent, v.ground).toFixed(1) + ' (need 3)');
    check(ratio(v['accent-ink'], v.accent) >= 4.5, id + ': button text on accent ' + ratio(v['accent-ink'], v.accent).toFixed(1) + ' (need 4.5)');
    check(ratio(v.accent, v['accent-soft']) >= 3, id + ': accent on accent-soft ' + ratio(v.accent, v['accent-soft']).toFixed(1) + ' (need 3)');
    check(ratio(v.line, v.ground) >= 1.2, id + ': lines vanish on the ground');
  }
  if(s && v.ground) check(s.ground.toLowerCase() === v.ground.toLowerCase() && s.accent.toLowerCase() === v.accent.toLowerCase() && s.surface.toLowerCase() === v.surface.toLowerCase(), id + ': the picker card colours differ from the CSS');
  check(new RegExp('\\[data-skin="' + id + '"\\]\\{\\s*color-scheme:\\s*(light|dark);').test(html), id + ' lacks color-scheme');
});
const ids = SKINS.map(function(s){ return s.id; });
check(new Set(ids).size === ids.length, 'duplicate theme ids');
ids.forEach(function(id){ check(!!TC[id], id + ' lacks THEME_COLOR'); });
check(/\[data-skin="aurora"\] \.tab\[aria-selected="true"\]/.test(html), 'the dark Aurora theme needs the same selected-tab colour rule as the other dark themes');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: ' + ids.length + ' themes, Frost and Aurora complete and readable');

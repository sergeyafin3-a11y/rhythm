// The Doodle theme: hand-drawn lettering, stripes and checks, bright pastel stickers — and it touches no other theme.
// Run:  osascript -l JavaScript tests/doodle_theme.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
function lum(hex){
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function(v){ v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b){ const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

// 1. registered everywhere a theme must be
const skinsM = /const SKINS = (\[[\s\S]*?\n\]);/.exec(html), SKINS = skinsM ? new Function('return ' + skinsM[1])() : [];
const s = SKINS.filter(function(x){ return x.id === 'doodle'; })[0];
check(!!s, 'doodle is missing from SKINS');
check(SKINS.length === 9, 'the eight existing themes stay and Doodle makes nine, got ' + SKINS.length);
const tc = /const THEME_COLOR = (\{[^}]*\});/.exec(html), TC = tc ? new Function('return ' + tc[1])() : {};
check(!!TC.doodle, 'doodle has no THEME_COLOR');
const decor = /const DECOR = \{([\s\S]*?)\n\};/.exec(html);
const dm = decor && /\bdoodle:\s*([\s\S]*?<\/svg>')/.exec(decor[1]);
check(!!dm, 'doodle has no DECOR drawing');
if(dm){
  check((dm[1].match(/<path/g) || []).length >= 6, 'the header drawing has hearts, stars and squiggles (at least six paths)');
  check(/stroke="var\(--ink\)"/.test(dm[1]) && /fill="var\(--accent\)"|fill="var\(--accent-soft\)"/.test(dm[1]), 'the drawing is outlined in the ink colour and filled with the theme’s pinks');
}
const blockM = /\[data-skin="doodle"\]\{([\s\S]*?)\n\}/.exec(html);
check(!!blockM, 'no [data-skin="doodle"] variable block');
const v = {};
if(blockM) blockM[1].replace(/--([a-z0-9-]+):\s*([^;]+);/g, function(_, k, val){ v[k] = val.trim(); return ''; });
['ground', 'surface', 'surface-2', 'line', 'ink', 'ink-soft', 'ink-mute', 'accent', 'accent-ink', 'accent-soft', 'gold', 'ok', 'bad', 'stripe-a', 'stripe-b', 'font-display', 'font-body', 'shadow', 'radius', 'radius-lg', 'border-w'].forEach(function(k){ check(v[k] !== undefined, 'doodle lacks --' + k); });
check(/color-scheme:\s*light/.test(blockM ? blockM[1] : ''), 'doodle is a light theme');
if(s && v.ground) check(s.ground.toLowerCase() === v.ground.toLowerCase() && s.surface.toLowerCase() === v.surface.toLowerCase() && s.accent.toLowerCase() === v.accent.toLowerCase(), 'the picker card colours differ from the CSS');

// 2. readable on the stripes AND on the cards
if(v.ink && v['stripe-a'] && v['stripe-b']){
  const bgs = {'stripe A': v['stripe-a'], 'stripe B': v['stripe-b'], 'card': v.surface, 'soft card': v['surface-2'], 'pink': v['accent-soft']};
  Object.keys(bgs).forEach(function(n){
    check(ratio(v.ink, bgs[n]) >= 7, 'ink on ' + n + ' ' + ratio(v.ink, bgs[n]).toFixed(1) + ' (need 7)');
    ['ink-soft', 'ink-mute', 'accent', 'gold', 'ok', 'bad'].forEach(function(k){ check(ratio(v[k], bgs[n]) >= 4.5, k + ' on ' + n + ' ' + ratio(v[k], bgs[n]).toFixed(2) + ' (need 4.5)'); });
  });
  check(ratio(v['accent-ink'], v.accent) >= 4.5, 'button text on the accent ' + ratio(v['accent-ink'], v.accent).toFixed(2) + ' (need 4.5)');
  check(v.ground.toLowerCase() === v['stripe-a'].toLowerCase(), '--ground is the stripe colour, so the overscroll area matches');
}

// 3. hand-written lettering, with a fallback and no fake bold
check(/Pangolin/.test(v['font-body'] || '') && /cursive/.test(v['font-body'] || ''), 'the body font is the handwritten Pangolin (with a cursive fallback)');
check(/Caveat/.test(v['font-display'] || '') && /cursive/.test(v['font-display'] || ''), 'the display font is the handwritten Caveat (with a cursive fallback)');
const link = /fonts\.googleapis\.com\/css2\?[^"]*/.exec(html);
check(!!link && /family=Pangolin/.test(link[0]) && /family=Caveat/.test(link[0]), 'the Google Fonts link loads Pangolin and Caveat (both have Cyrillic)');
check(/html\[data-skin="doodle"\]\{[^}]*font-synthesis:\s*none/.test(html), 'no synthetic bold (Pangolin has one weight)');

// 4. stripes, checks and stickers
const cssM = /\/\* doodle:css \*\/([\s\S]*?)\/\* doodle:end \*\//.exec(html);
check(!!cssM, 'the doodle styles are not fenced by /* doodle:css */ … /* doodle:end */');
if(cssM){
  const css = cssM[1];
  check(/repeating-linear-gradient\(0deg,\s*var\(--stripe-a\)[^;]*var\(--stripe-b\)/.test(css), 'the page background is horizontal stripes in the two stripe colours');
  check(/\.arc-card\{[^}]*linear-gradient\([^}]*linear-gradient\(/.test(css), 'the Winter Arc card has a gingham check');
  check(/\.habit\.done[^{]*\{[^}]*\}/.test(css) && /line-through/.test(css), 'a done habit is crossed out with a wavy line');
  check(/\.btn:not\(\.btn-danger\)\{[^}]*box-shadow:[^}]*0 \dpx 0/.test(css), 'the primary button is a sticker with a hard shadow');
  check(/\.eyebrow\{[^}]*text-transform:\s*none/.test(css), 'small caps captions become friendly handwriting');
  // 5. it touches no other theme: every selector starts with the doodle skin
  const bad = [];
  css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').forEach(function(rule){
    const sel = rule.split('{')[0].trim();
    if(!sel || sel.charAt(0) === '@') return;
    sel.split(',').forEach(function(one){ if(!/^(html)?\[data-skin="doodle"\]/.test(one.trim())) bad.push(one.trim().slice(0, 50)); });
  });
  check(bad.length === 0, 'rules that would also change the other themes: ' + bad.slice(0, 4).join(' | '));
  check((css.match(/\[data-skin="doodle"\]/g) || []).length >= 15, 'at least fifteen doodle touches');
}

// 6. she gets it once, and a fresh install is left to choose
check(/if\(!state\.cleanDoodle\)\{\s*if\(state\.skin\) state\.skin = 'doodle';\s*state\.cleanDoodle = true;\s*\}/.test(html), 'the theme is switched on once for the app she already has (and she can change it afterwards)');
check(/function seed\(\)\{[\s\S]*?cleanDoodle:true/.test(html), 'a fresh install keeps the choice of the first screen');
check(/Doodle/.test(readme), 'the README mentions the Doodle theme');
// 7. review fixes
// a. restoring an old backup must not flip her theme on the next launch
const imp = /act==='import-data'\)\{([\s\S]*?)\n  else if\(act==='reset'\)/.exec(html);
check(!!imp && /cleanDoodle\s*=\s*true/.test(imp[1]), 'restoring a backup made before the theme existed must not switch the theme on the next launch');
// b. the doodle rules must not beat the state classes of existing components
if(cssM){
  const css = cssM[1].replace(/\/\*[\s\S]*?\*\//g, '');
  check(!/\[data-skin="doodle"\] \.btn\{[^}]*font-size/.test(css) && /\.btn:not\(\.btn-sm\)\{[^}]*font-size/.test(css), 'small buttons keep their small size (the .btn rule must not apply to .btn-sm)');
  check(!/\[data-skin="doodle"\] \.btn\{[^}]*border-color/.test(css), 'the red Delete outline must survive (no border-color on every .btn)');
  check(!/\.pd-opt\{[^}]*border-color/.test(css) || /\.pd-opt:not\(\.picked\):not\(\.right\):not\(\.wrong\)\{[^}]*border-color/.test(css), 'quiz answers keep their right / wrong / picked outline');
  check(!/\.daybar-mid\{[^}]*border-color/.test(css) && /\.daybar-mid:disabled\{[^}]*border-color/.test(css), 'the accent outline of the enabled day button survives');
  check(/\.btn-danger\{[^}]*border-color:\s*currentColor/.test(css), 'Delete stays outlined in red');
  const h1 = /\.top h1\{[^}]*font-size:\s*(\d+)px/.exec(css);
  check(!!h1 && +h1[1] <= 38, 'the greeting is at most 38px so it does not eat the screen');
  // gingham: text must stay readable where the two pink layers overlap
  const ga = /\.arc-card\{[^}]*rgba\((\d+),\s*(\d+),\s*(\d+),\s*([.\d]+)\)/.exec(css);
  if(ga && v.accent){
    const base = [0xFF, 0xF3, 0xF8], a = +ga[4], col = [+ga[1], +ga[2], +ga[3]];
    const one = base.map(function(b, i){ return b * (1 - a) + col[i] * a; });
    const two = one.map(function(b, i){ return b * (1 - a) + col[i] * a; });
    const hex = two.map(function(x){ return ('0' + Math.round(x).toString(16)).slice(-2); }).join('');
    ['ink-mute', 'ink-soft', 'accent', 'ok', 'gold'].forEach(function(k){ check(ratio(v[k], '#' + hex) >= 4.5, k + ' on the gingham overlap #' + hex + ' ' + ratio(v[k], '#' + hex).toFixed(2) + ' (need 4.5)'); });
  }
}
// c. the header stickers stay inside the narrowest phone (visible x ≈ 72–447) and scroll away with the page
if(dm){
  const xs = [], re = /translate\((\d+)\s+(\d+)\)/g; let mm;
  while((mm = re.exec(dm[1]))) xs.push(+mm[1]);
  check(xs.length >= 6 && xs.every(function(x){ return x >= 95 && x <= 425; }), 'every sticker sits at x 95–425, so none is cut off on a 375px phone: ' + xs.join(','));
  check(!/M70 150/.test(dm[1]), 'no squiggle behind the greeting text');
}
check(/\[data-skin="doodle"\] \.decor\{[^}]*position:\s*absolute/.test(html), 'the doodle stickers scroll away with the page instead of floating between the cards');

if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the Doodle theme is complete, readable and isolated');

// The Bloom theme: airbrushed wildflowers, soft gradients and film grain — readable, and it touches no other theme.
// Run:  osascript -l JavaScript tests/bloom_theme.js
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
const s = SKINS.filter(function(x){ return x.id === 'bloom'; })[0];
check(!!s, 'bloom is missing from SKINS');
check(SKINS.length >= 10, 'the nine existing themes stay and Bloom joins them, got ' + SKINS.length);
const tc = /const THEME_COLOR = (\{[^}]*\});/.exec(html), TC = tc ? new Function('return ' + tc[1])() : {};
check(!!TC.bloom, 'bloom has no THEME_COLOR');
const decor = /const DECOR = \{([\s\S]*?)\n\};/.exec(html);
const dm = decor && /\bbloom:\s*([\s\S]*?<\/svg>')/.exec(decor[1]);
check(!!dm, 'bloom has no DECOR drawing');
if(dm){
  check(/feGaussianBlur/.test(dm[1]), 'the header flowers are airbrushed: a blur filter softens them');
  check((dm[1].match(/<ellipse|<circle|<path/g) || []).length >= 14, 'the header drawing has daisy petals, blobs and twigs (at least fourteen shapes)');
}
const blockM = /\[data-skin="bloom"\]\{([\s\S]*?)\n\}/.exec(html);
check(!!blockM, 'no [data-skin="bloom"] variable block');
const v = {};
if(blockM) blockM[1].replace(/--([a-z0-9-]+):\s*([^;]+);/g, function(_, k, val){ v[k] = val.trim(); return ''; });
['ground', 'sky', 'pink', 'peach', 'surface', 'surface-2', 'line', 'ink', 'ink-soft', 'ink-mute', 'accent', 'accent-ink', 'accent-soft', 'gold', 'ok', 'bad', 'blue', 'font-display', 'font-body', 'shadow', 'radius', 'radius-lg', 'border-w'].forEach(function(k){ check(!!v[k], 'bloom lacks --' + k); });
check(/color-scheme:\s*light/.test(blockM ? blockM[1] : ''), 'bloom is a light theme');
if(s && v.ground) check(s.ground.toLowerCase() === v.ground.toLowerCase() && s.surface.toLowerCase() === v.surface.toLowerCase() && s.accent.toLowerCase() === v.accent.toLowerCase() && s.ink.toLowerCase() === v.ink.toLowerCase(), 'the picker card colours differ from the theme');

// 2. readable on the sky, the pink, the peach AND on the cards
if(v.ink && v.sky){
  const stops = {sky: v.sky, pink: v.pink, peach: v.peach}, cards = {card: v.surface, 'soft card': v['surface-2'], 'pink chip': v['accent-soft']};
  Object.keys(stops).concat(Object.keys(cards)).forEach(function(n){
    const bg = stops[n] || cards[n];
    check(ratio(v.ink, bg) >= 7, 'ink on ' + n + ' ' + ratio(v.ink, bg).toFixed(1) + ' (need 7)');
    check(ratio(v['ink-soft'], bg) >= 6, 'ink-soft on ' + n + ' ' + ratio(v['ink-soft'], bg).toFixed(1) + ' (need 6)');
    check(ratio(v['ink-mute'], bg) >= 4.5, 'ink-mute on ' + n + ' ' + ratio(v['ink-mute'], bg).toFixed(2) + ' (need 4.5)');
  });
  Object.keys(cards).forEach(function(n){ ['accent', 'gold', 'ok', 'bad'].forEach(function(k){ check(ratio(v[k], cards[n]) >= 4.5, k + ' on ' + n + ' ' + ratio(v[k], cards[n]).toFixed(2) + ' (need 4.5)'); }); });
  Object.keys(stops).forEach(function(n){ ['gold', 'ok', 'bad'].forEach(function(k){ check(ratio(v[k], stops[n]) >= 4.5, k + ' on the ' + n + ' background ' + ratio(v[k], stops[n]).toFixed(2) + ' (need 4.5)'); }); });
  check(ratio(v['accent-ink'], v.accent) >= 4.5, 'button text on the accent ' + ratio(v['accent-ink'], v.accent).toFixed(2) + ' (need 4.5)');
  check(v.ground.toLowerCase() === v.pink.toLowerCase(), '--ground is the pink of the page, so the overscroll area matches');
}

// 3. soft lettering: a delicate serif for the big words, a round sans for reading
check(/Cormorant/.test(v['font-display'] || '') && /serif/.test(v['font-display'] || ''), 'the display font is Cormorant Garamond (with a serif fallback)');
check(/Nunito/.test(v['font-body'] || ''), 'the body font is the round Nunito');
const link = /fonts\.googleapis\.com\/css2\?[^"]*/.exec(html);
check(!!link && /family=Cormorant\+Garamond/.test(link[0]) && /family=Nunito/.test(link[0]), 'the Google Fonts link loads Cormorant Garamond (it has Cyrillic) and Nunito');

// 4. airbrush, blobs and grain, as quiet as the pictures
const cssM = /\/\* bloom:css \*\/([\s\S]*?)\/\* bloom:end \*\//.exec(html);
check(!!cssM, 'the bloom styles are not fenced by /* bloom:css */ … /* bloom:end */');
if(cssM){
  const css = cssM[1].replace(/\/\*[\s\S]*?\*\//g, '');
  check(/html\[data-skin="bloom"\]::before\{[^}]*position:\s*fixed[^}]*\}/.test(css), 'the sky is a fixed layer behind the page, so it never stretches over long screens');
  const sky = /html\[data-skin="bloom"\]::before\{([^}]*)\}/.exec(css);
  check(!!sky && /linear-gradient\([^)]*var\(--sky\)[^)]*var\(--pink\)/.test(sky[1]) && (sky[1].match(/radial-gradient/g) || []).length >= 4, 'the sky fades from blue to pink with at least four soft blurred blobs');
  check(!!sky && /feTurbulence/.test(css) && /z-index:\s*-1/.test(sky[1]), 'a film grain (noise) sits in the background layer');
  check(/pointer-events:\s*none/.test(sky ? sky[1] : ''), 'the background layer never catches taps');
  check(/\.btn-primary\{[^}]*linear-gradient/.test(css), 'the primary button is a soft gradient');
  check(/\.tabs-inner\{[^}]*backdrop-filter:\s*blur/.test(css), 'the bottom bar is frosted glass');
  check(/\.habit\{[^}]*color-mix\(/.test(css) || /\.habit,\s[^{]*\{[^}]*color-mix\(/.test(css), 'cards are slightly see-through (with a solid colour first, for older phones)');
  check(/\.pbar i\{[^}]*linear-gradient/.test(css) && /\.check\{|\.habit\.done \.check\{/.test(css), 'progress bars and ticks are gradients');
  check(/prefers-reduced-transparency|@supports/.test(css) || /background:\s*var\(--surface\);[^}]*color-mix/.test(css), 'every translucent card has a solid fallback');
  // it touches no other theme: every selector starts with the bloom skin
  const bad = [];
  css.split('}').forEach(function(rule){
    const sel = rule.split('{')[0].trim();
    if(!sel || sel.charAt(0) === '@') return;
    sel.split(',').forEach(function(one){ if(!/^(html)?\[data-skin="bloom"\]/.test(one.trim())) bad.push(one.trim().slice(0, 50)); });
  });
  check(bad.length === 0, 'rules that would also change the other themes: ' + bad.slice(0, 4).join(' | '));
  check((css.match(/\[data-skin="bloom"\]/g) || []).length >= 20, 'at least twenty bloom touches');
  const h1 = /\.top h1\{[^}]*font-size:\s*(\d+)px/.exec(css);
  check(!!h1 && +h1[1] <= 38, 'the greeting is at most 38px so it does not eat the screen');
  check(/\.top h1\{[^}]*overflow-wrap:\s*anywhere/.test(css) && /\.top > div\{[^}]*min-width:\s*0/.test(css), 'a very long name in the greeting wraps instead of pushing the gear off screen');
  check(!/\.btn(-sm)?\{[^}]*border-color/.test(css), 'the red Delete outline and the small buttons keep their own colours and sizes');
  check(/\.pd-opt:not\(\.picked\):not\(\.right\):not\(\.wrong\)\{[^}]*border-color/.test(css) || !/\.pd-opt\{[^}]*border-color/.test(css), 'quiz answers keep their right / wrong / picked outline');
  check(!/animation\s*:/.test(css), 'nothing moves by itself: the theme is calm');
  check(/\.decor\{[^}]*opacity:\s*0?\.([0-9]\d?)/.test(css), 'the header flowers are softened');
}

// 5. she gets it once, and a fresh install is left to choose
check(/if\(!state\.cleanBloom\)\{\s*if\(state\.skin\) state\.skin = 'bloom';\s*state\.cleanBloom = true;\s*\}/.test(html), 'the theme is switched on once for the app she already has (and she can change it in Settings)');
check(/function seed\(\)\{[\s\S]*?cleanBloom:true/.test(html), 'a fresh install keeps the choice of the first screen');
const imp = /act==='import-data'\)\{([\s\S]*?)\n  else if\(act==='reset'\)/.exec(html);
check(!!imp && /cleanBloom\s*=\s*true/.test(imp[1]), 'restoring a backup must not switch the theme on the next launch');
check(/Bloom/.test(readme), 'the README mentions the Bloom theme');
// 6. review round: readable numbers, light on the phone, readable on the blobs
if(cssM){
  const css6 = cssM[1].replace(/\/\*[\s\S]*?\*\//g, '');
  check(/font-variant-numeric:\s*lining-nums/.test(css6) && /\.ring-center b/.test(css6.split('lining-nums')[0].slice(-400)), 'the big numbers use lining figures (Cormorant’s old-style 1 looks like an I)');
  check(/\.tk-timer b/.test(css6) && /lining-nums tabular-nums/.test(css6), 'the clock keeps its even digit width together with lining figures');
  const cardRule = /\.ring-card[^{]*\{([^}]*)\}/.exec(css6);
  check(!!cardRule && !/backdrop-filter/.test(cardRule[1]), 'the cards carry no blur filter of their own (cheaper scrolling); only the bottom bar is frosted');
  check((css6.match(/backdrop-filter/g) || []).length <= 4, 'the frosted glass is used only on the bottom bar and the header buttons');
  const alphas = (css6.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*\.(\d+)\)/g) || []).filter(function(x, i){ return i < 5; }).map(function(x){ return +('0.' + /\.(\d+)\)/.exec(x)[1]); });
  check(alphas.length >= 5 && Math.max.apply(null, alphas) <= 0.3, 'the colour blobs behind the text are faint (at most .3): ' + alphas.join(','));
}
if(dm){
  check((dm[1].match(/filter="url\(#bs\)"/g) || []).length <= 6, 'the daisy petals share a few blur filters instead of one each');
}
check(TC.bloom && TC.bloom.toLowerCase() === (v.sky || '').toLowerCase(), 'the phone’s top bar matches the sky at the top of the page');
if(v['ink-mute'] && v.sky){ ['sky', 'pink', 'peach'].forEach(function(n){ check(ratio(v['ink-mute'], v[n]) >= 5.5, 'ink-mute on the ' + n + ' leaves room for the blobs: ' + ratio(v['ink-mute'], v[n]).toFixed(2) + ' (need 5.5)'); }); }
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the Bloom theme is complete, readable and isolated');

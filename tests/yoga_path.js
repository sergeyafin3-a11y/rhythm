// Yoga path: a staged course that unlocks new poses one step at a time, next to the three daily bands.
// Run:  osascript -l JavaScript tests/yoga_path.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

// ---------- 1. the path itself ----------
const pm = /const YOGA_PATH = (\[[\s\S]*?\n\]);/.exec(html), sm = /const YG_STAGES = (\[[\s\S]*?\n\]);/.exec(html);
check(!!pm && !!sm, 'YOGA_PATH and YG_STAGES are missing');
const PATH = pm ? new Function('return ' + pm[1])() : [], STAGES = sm ? new Function('return ' + sm[1])() : [];
check(PATH.length >= 28 && PATH.length <= 36, 'the path has about 32 sessions, got ' + PATH.length);
check(STAGES.length === 4 && STAGES.every(function(s){ return s.name && s.note && !/[Ѐ-ӿ]/.test(s.name + s.note); }), 'four stages with an English name and a note');
const vs = {};
PATH.forEach(function(w, i){
  const id = 'step ' + (i + 1);
  check(/^[A-Za-z0-9_-]{11}$/.test(w.v) && !vs[w.v], id + ': a real-looking, unique YouTube id');
  vs[w.v] = true;
  check(w.min >= 20 && w.min <= 40, id + ': ' + w.min + ' min is outside 20–40');
  check(w.lang === 'ru', id + ': the path is in Russian');
  check(w.t && w.desc && w.by && w.focus, id + ': title, description, channel and the new thing it works on');
  check(!/[Ѐ-ӿ]/.test(w.t + w.desc + w.focus), id + ': English title, description and focus');
  check(!/beginner|basics|для начина|yin|restor|nidra|fat|burn|lose/i.test(w.t + ' ' + w.desc), id + ': no beginner, yin or restorative classes');
  check(w.s >= 0 && w.s < STAGES.length && (i === 0 || w.s >= PATH[i - 1].s), id + ': stages only go forward');
});
STAGES.forEach(function(s, k){ check(PATH.filter(function(w){ return w.s === k; }).length >= 5, 'stage ' + (k + 1) + ' has at least 5 sessions'); });
check(PATH[0].s === 0 && PATH[PATH.length - 1].s === 3, 'the path starts with the base and ends upside down');

// ---------- 2. pure helpers ----------
const m = /\/\* yg:pure \*\/([\s\S]*?)\/\* yg:end \*\//.exec(html);
if(m){
  const api = new Function(m[1] + '; return {ygPathAt:typeof ygPathAt === "function" ? ygPathAt : null, ygPathGroups:typeof ygPathGroups === "function" ? ygPathGroups : null};')();
  check(!!api.ygPathAt && !!api.ygPathGroups, 'ygPathAt and ygPathGroups live in the pure block');
  if(api.ygPathAt){
    const list = [{v:'a', s:0}, {v:'b', s:0}, {v:'c', s:1}];
    check(api.ygPathAt(list, 0).v === 'a' && api.ygPathAt(list, 2).v === 'c', 'the next session is the one at the position');
    check(api.ygPathAt(list, 3) === null && api.ygPathAt(list, -1).v === 'a' && api.ygPathAt(list, 'x').v === 'a', 'past the end there is nothing; a bad position falls back to the first');
    const g = api.ygPathGroups(list, [{name:'One'}, {name:'Two'}]);
    check(g.length === 2 && g[0].name === 'One' && g[0].items.length === 2 && g[0].items[1].i === 1 && g[1].items[0].i === 2, 'sessions are grouped by stage and keep their step numbers');
    check(api.ygPathGroups([], [{name:'One'}]).length === 0, 'an empty path has no groups');
  }
}

// ---------- 3. the app ----------
const opt = body('ygOptions');
check(/YG_PATH/.test(opt) && /ygPathAt\(/.test(opt), 'the path is offered first among the options');
check(/function ygBand\([^)]*\)\{[^}]*YG_PATH/.test(html) || /YG_PATH/.test(body('ygBand')) || /k === 'path'/.test(html), 'the path has its own band label');
const add = body('ygAdd');
check(/k === 'path'/.test(add) && /st\.p\b/.test(add) && /ygPathAt\(/.test(add), 'finishing a path session logs it and moves the path on');
check(/last\.k === 'path'/.test(body('ygDrop')) && /\.p = last\.i/.test(body('ygDrop')), 'undo puts the path back where it was');
check(/data-b="path"/.test(body('ygPanel')) && /data-act="yg-skip"/.test(body('ygPanel')) && /data-act="yg-pback"/.test(body('ygPathMap')), 'the panel has Done, Skip and Back for the path');
check(/<details/.test(body('ygPathMap')) && /ygPathGroups\(/.test(body('ygPathMap')) && /ygPathMap\(/.test(body('ygPanel')), 'the whole path can be opened as a list');
check(/act==='yg-skip'/.test(html) && /act==='yg-pback'/.test(html), 'Skip and Back have handlers');
check(/st\.p = |\.p = Math/.test(body('ygState')) || /if\(!state\.yoga\.p\)/.test(body('ygState')), 'the path position is created lazily; old saved data is untouched');
check(/finished the path|You finished/i.test(body('ygPathMap')), 'the end of the path says so');
check(/Yoga path|path/i.test(readme) && /Dakira|Yannau|stage/i.test(readme), 'the README describes the yoga path');
// ---------- 4. review round ----------
check(!PATH.some(function(w){ return ['J-ni0OBELCo', 'vtI9ZH6HZtw', 'PXRW6unQR-o'].indexOf(w.v) >= 0; }), 'no lesson whose real title says "from scratch" (с нуля): she asked for no beginner classes');
check(/addEventListener\('toggle'[\s\S]{0,260}yg-map/.test(html) || /ygMapOpen/.test(html), 'the open list stays open after Done, Skip or Back');
check(/ygMapOpen/.test(body('ygPathMap')), 'the map is drawn open when it was open');
check(/ygTap/.test(html) && /act==='yg-done'[\s\S]{0,420}ygTap/.test(html), 'a quick double tap on Done logs one step, not two');
check(/Math\.floor\(Number\(/.test(body('ygState')) && /Math\.max\(0/.test(body('ygState')), 'a bad saved position (negative, text) is repaired');
check(/last step/i.test((html.split("act==='yg-skip'")[1] || '').slice(0, 400)), 'Skip on the last step says so instead of promising a next one');
check(!/slow transitions/.test(html), 'the description of the movement-control class claims only what its title says');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the yoga path');

// Face massage must offer gua sha videos only, 7–12 minutes long.
// Run:  osascript -l JavaScript tests/face_gua_sha.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const m = /const FACE_VIDEOS = (\[[\s\S]*?\n\]);/.exec(html);
if(!m){ console.log('FAIL: FACE_VIDEOS not found'); throw new Error("test failed"); }
const list = new Function('return ' + m[1])();
const bad = [];
if(list.length < 15) bad.push('only ' + list.length + ' videos, need at least 15 so the batches of five do not repeat quickly');
const ids = {};
list.forEach(function(x){
  if(x.focus !== 'guasha') bad.push(x.id + ' is not gua sha (' + x.focus + ')');
  if(!(x.min >= 7 && x.min <= 12)) bad.push(x.id + ' lasts ' + x.min + ' min, must be 7–12');
  if(ids[x.v]) bad.push(x.id + ' is a duplicate of ' + ids[x.v]);
  ids[x.v] = x.id;
});
if(bad.length){ console.log('FAIL:\n  ' + bad.join('\n  ')); throw new Error("test failed"); }
console.log('OK: ' + list.length + ' gua sha videos, all 7–12 min');

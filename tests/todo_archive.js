// Done tasks fall into an archive: gone from Today and from the lists, kept in one quiet place, never deleted.
// Run:  osascript -l JavaScript tests/todo_archive.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const body = function(name){ const i = html.indexOf('function ' + name + '('); if(i < 0) return ''; const j = html.indexOf('\nfunction ', i + 10); return html.slice(i, j < 0 ? undefined : j); };

const m = /\/\* archive:pure \*\/([\s\S]*?)\/\* archive:end \*\//.exec(html);
check(!!m, 'no pure logic between /* archive:pure */ and /* archive:end */');
if(m){
  const A = new Function(m[1] + '; return {tdSplit:tdSplit};')();
  const T = (id, done, doneAt, made) => ({id:id, t:id, date:'2026-10-16', done:done, doneAt:doneAt || '', made:made || 0});
  const r = A.tdSplit([T('a', false), T('b', true, '2026-10-14', 2), T('c', true, '2026-10-16', 3), T('d', false), T('e', true, '2026-10-16', 5), T('f', true, '', 1)]);
  check(r.open.map(x => x.id).join() === 'a,d', 'open tasks stay in order, got ' + r.open.map(x => x.id).join());
  check(r.archive.map(x => x.id).join() === 'e,c,b,f', 'the archive lists the latest finished first, tasks with no finish day last: ' + r.archive.map(x => x.id).join());
  check(A.tdSplit([]).open.length === 0 && A.tdSplit([]).archive.length === 0, 'an empty list gives an empty split');
}
// nothing done is shown on the lists or on Today
const g = body('tdGroups');
check(/tdSplit\(todos\(\)\)\.open/.test(g) && !/t\.done \? g\.today/.test(g), 'the To-do lists no longer show finished tasks');
const plans = body('tdPlansCard');
check(!/row\(t, true\)/.test(plans) && !/doneList\.slice/.test(plans), 'the plans card does not show finished tasks');
check(/if\(!p\.today\.length && !p\.tomorrow\.length\) return '';/.test(plans), 'the plans card disappears when nothing is left to do');
check(!/plans-row\.done/.test(html), 'no leftover styles for finished rows on the card');
// the tick moves the task to the archive and says so
const tg = /act==='td-toggle'\)\{([\s\S]*?)\n  \}/.exec(html);
check(!!tg && /archive/i.test(tg[1]) && /toast\(/.test(tg[1]), 'ticking a task says it moved to the archive');
check(!!tg && /Back on your list/.test(tg[1]), 'unticking from the archive says the task is back on the list');
// the archive: one quiet button at the bottom of the To-do tab, newest first, with a way back
const rt = body('renderTodos');
check(/data-act="td-archive"/.test(rt) && /Archive/.test(rt) && /tdSplit\(todos\(\)\)\.archive/.test(rt), 'the To-do tab has an Archive button that lists finished tasks');
check(/let tdArch = false/.test(html) && /act==='td-archive'\)\{[^}]*tdArch = !tdArch/.test(html), 'the Archive opens and closes');
check(/archive\.slice\(0, 50\)/.test(rt), 'the archive shows the 50 latest');
check(/if\(archive\.length\)|archive\.length \?/.test(rt), 'no Archive button while it is empty');
// she never loses a task: only the Delete button removes one
const drops = (html.match(/state\.todos = todos\(\)\.filter\(/g) || []);
check(drops.length === 1 && /act==='td-del'\)\{[^}]*state\.todos = todos\(\)\.filter/.test(html), 'only the Delete button may drop a task (found ' + drops.length + ' places that filter the list)');
check(/archive/i.test(readme), 'the README mentions the archive');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the to-do archive');

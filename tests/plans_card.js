// The plans card: today's and tomorrow's to-dos at the very top of Today, tickable in place.
// Run:  osascript -l JavaScript tests/plans_card.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html'), readme = read(root + '/README.md');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }

const m = /\/\* plans:pure \*\/([\s\S]*?)\/\* plans:end \*\//.exec(html);
check(!!m, 'no pure logic between /* plans:pure */ and /* plans:end */');
if(m){
  const A = new Function(m[1] + '; return {plansBuild:plansBuild};')();
  const T = (id, date, time, extra) => Object.assign({id:id, t:id, date:date, time:time || '', done:false, made:+id.slice(1)}, extra || {});
  const key = '2026-10-13', tom = '2026-10-14';
  const list = [
    T('a1', key, '16:00'), T('a2', key, ''), T('a3', key, '09:30'),
    T('b1', tom, '10:00'), T('b2', tom, ''),
    T('c1', '2026-10-12', ''),                       // overdue
    T('d1', '2026-10-20', '08:00'),                  // later: not on the card
    T('e1', '', '12:00'),                            // no date: not on the card
    T('f1', key, '07:00', {done:true}),              // done today: not on the card
    T('g1', tom, '07:00', {done:true})
  ];
  const r = A.plansBuild(list, key, tom);
  check(r.today.map(x => x.id).join() === 'c1,a3,a1,a2', 'today: overdue first, then timed in time order, then untimed; got ' + r.today.map(x => x.id).join());
  check(r.tomorrow.map(x => x.id).join() === 'b1,b2', 'tomorrow in time order, got ' + r.tomorrow.map(x => x.id).join());
  check(r.today.every(x => !x.done) && r.tomorrow.every(x => !x.done), 'done tasks stay off the card');
  check(A.plansBuild([], key, tom).today.length === 0 && A.plansBuild([T('x1', '2026-12-01')], key, tom).tomorrow.length === 0, 'nothing planned gives an empty card');
  check(r.overdue === 1 && r.today.find(x => x.id === 'c1').late === true, 'an overdue task is marked late and counted');
  check(A.plansBuild(list, key, tom).doneToday === 1, 'the number done today is counted for the header');
}
// the card sits above everything else on Today, and is hidden on other days
const rt = /function renderToday\(\)\{([\s\S]*?)\n\}/.exec(html);
check(!!rt, 'renderToday not found');
if(rt){
  const body = rt[1];
  const iPlans = body.indexOf('tdPlansCard()'), iBar = body.indexOf('dayBar()'), iArc = body.indexOf('arcTodayCard()'), iWq = body.indexOf('wqTodayCard()');
  check(iPlans >= 0 && iPlans < iBar && iPlans < iArc && iPlans < iWq, 'the plans card comes first on Today, above the day switcher, the Arc and the word test');
  check(/selDay \? '' : tdPlansCard\(\)/.test(body), 'the plans card is only for today, not for a past day she is editing');
}
check(!/function tdTodayCard\(/.test(html) && html.indexOf('tdTodayCard') < 0, 'the old small to-do card is gone');
check(/function tdPlansCard\(\)/.test(html), 'tdPlansCard exists');
const toggle = /act==='td-toggle'\)\{([\s\S]*?)\n  \}/.exec(html);
check(!!toggle && /render\(\)/.test(toggle[1]) && !/renderTodos\(\)/.test(toggle[1]), 'ticking a task redraws whichever tab is open (Today or To-do)');
const plans = /function tdPlansCard\(\)\{([\s\S]*?)\n\}/.exec(html);
check(!!plans && /data-act="td-toggle"/.test(plans[1]) && /data-act="td-edit"/.test(plans[1]) && /data-act="go-todo"/.test(plans[1]), 'the card can tick a task, open one for editing and go to the whole list');
check(!!plans && /Today/.test(plans[1]) && /Tomorrow/.test(plans[1]), 'the card shows a Today and a Tomorrow part');
check(/\.plans\{/.test(html), 'the plans card has its own styles');
check(/To-do|plans/i.test(readme) && /top of Today|plans card|Plans/i.test(readme), 'the README mentions the plans card');
if(fails.length) throw new Error('FAIL:\n  ' + fails.filter(Boolean).join('\n  '));
console.log('OK: the plans card');

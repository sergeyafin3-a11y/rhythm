// The day turns over at 4 a.m., not at midnight: a habit ticked at 1 a.m. belongs to the day before.
// Run:  osascript -l JavaScript tests/day_boundary.js
ObjC.import('Foundation');
function read(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null).js; }
const root = $.NSFileManager.defaultManager.currentDirectoryPath.js;
const html = read(root + '/index.html');
const fails = [];
function check(c, m){ if(!c) fails.push(m); }
const m = /\/\* day:pure \*\/([\s\S]*?)\/\* day:end \*\//.exec(html);
check(!!m, 'no pure day logic found between /* day:pure */ and /* day:end */');
if(m){
  const api = new Function(m[1] + '; return {dayKeyAt:dayKeyAt, DAY_STARTS_AT:DAY_STARTS_AT};')();
  const at = function(h, mi){ return api.dayKeyAt(new Date(2026, 9, 3, h, mi).getTime()); };   // 3 October 2026, local time
  check(api.DAY_STARTS_AT === 4, 'the day should turn over at 4');
  check(at(12, 0) === '2026-10-03', 'noon is the same day');
  check(at(23, 59) === '2026-10-03', '23:59 is the same day');
  check(at(0, 0) === '2026-10-02', 'midnight still belongs to the day before, got ' + at(0, 0));
  check(at(1, 50) === '2026-10-02', '01:50 still belongs to the day before, got ' + at(1, 50));
  check(at(3, 59) === '2026-10-02', '03:59 still belongs to the day before, got ' + at(3, 59));
  check(at(4, 0) === '2026-10-03', '04:00 starts the new day, got ' + at(4, 0));
  check(api.dayKeyAt(new Date(2026, 0, 1, 2, 0).getTime()) === '2025-12-31', 'works across a year boundary');
  // clock-change days: the flip stays at 04:00 local (run it also as  TZ=America/New_York osascript -l JavaScript tests/day_boundary.js)
  const ymd = function(y, mo, d, h, mi){ return api.dayKeyAt(new Date(y, mo, d, h, mi).getTime()); };
  check(ymd(2026, 2, 8, 4, 30) === '2026-03-08', '04:30 on a spring-forward day starts the new day, got ' + ymd(2026, 2, 8, 4, 30));
  check(ymd(2026, 2, 8, 3, 30) === '2026-03-07', '03:30 on a spring-forward day is still the day before, got ' + ymd(2026, 2, 8, 3, 30));
  check(ymd(2026, 10, 1, 3, 30) === '2026-10-31', '03:30 on a fall-back day is still the day before, got ' + ymd(2026, 10, 1, 3, 30));
  check(ymd(2026, 10, 1, 4, 0) === '2026-11-01', '04:00 on a fall-back day starts the new day, got ' + ymd(2026, 10, 1, 4, 0));
}
check(/function today\(\)\{ return dayKeyAt\(\); \}/.test(html), 'today() must use dayKeyAt()');
check(!/function paintHeader\(\)\{\s*const d = new Date\(\);/.test(html), 'the date in the header must show the logical day, not the calendar one');
if(fails.length) throw new Error('FAIL:\n  ' + fails.join('\n  '));
console.log('OK: the day turns over at 4 a.m.');

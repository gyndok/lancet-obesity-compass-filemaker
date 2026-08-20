/* test_loc_session1.js - skeleton state + engine integration */
'use strict';
const assert = require('assert');
let n = 0;
function eq(a, b, m) { assert.deepStrictEqual(a, b, m + ' got ' + JSON.stringify(a)); n++; console.log('  ok -', m); }
function ok(c, m) { assert.ok(c, m); n++; console.log('  ok -', m); }

/* load engine bundle into global, then questions + app */
const fs = require('fs');
(0, eval)(fs.readFileSync(__dirname + '/../build/loc_engine.js', 'utf8'));
global.LOCENGINE = LOCENGINE;
global.LOCQ = require('../src/questions.js');
const A = require('../src/app.js');

console.log('catalog shape');
const allIds = [];
LOCQ.SECTIONS.forEach(s => { (s.items || []).forEach(i => allIds.push(i)); (s.toggles || (s.toggle ? [s.toggle] : [])).forEach(t => LOCQ.TOGGLES[t].ids.forEach(i => allIds.push(i))); });
eq(new Set(allIds).size, allIds.length, 'no duplicate question ids across sections/toggles');
allIds.forEach(id => ok(LOCQ.Q[id], 'definition exists for id ' + id));
eq(allIds.length, 86, 'catalog = 50 default (incl 2 conditional subs) + 36 toggled = 86 items');

console.log('default visibility (pruned interview)');
eq(A.visibleIds().length, 49, '49 visible by default (lab-details sub hidden, toggles closed)');
ok(A.visibleIds().indexOf(39) >= 0, 'counseling checklist always visible');
ok(A.visibleIds().indexOf(40) >= 0, 'common side effects Y/N restored');
ok(A.visibleIds().indexOf(70) < 0, 'PHQ-9 hidden while toggle closed');

console.log('prefill + BMI');
A.S.prefill = { age: 52, sex: 'Female', ethnicity: 'Caucasian', name: 'Demo, Dana' };
A.S.anthro = { ft: 5, inch: 5, wt: 232, waist: 41 };
ok(Math.abs(A.bmiValue() - 38.6) < 0.05, 'BMI 5\'5" 232lb = 38.6');

console.log('select-all counseling');
A.setAnswer(39, LOCQ.Q[39].options.slice());
eq(A.getAnswer(39).length, 11, 'mark-all-discussed sets all 11 warnings');

console.log('gateways');
eq(A.gatewayHints().length, 0, 'no hints before gateway answers');
A.setAnswer(31, 'snores loudly, wife reports pauses');
A.setAnswer(32, 'work stress, tearful some days');
const hints = A.gatewayHints();
eq(hints.length, 2, 'both gateways fire');
ok(hints[0].msg.indexOf('STOP-BANG') >= 0, 'sleep hint names instruments');
A.S.toggles.sb = true;
ok(A.visibleIds().indexOf(95) >= 0, 'opening toggle exposes STOP-BANG items');

console.log('scores through ported engine (auto BANG from prefill)');
[95, 96, 97, 98].forEach(id => A.setAnswer(id, 'Yes'));
A.setAnswer(99, 'No');
let sb = A.activeScores().find(s => s.abbrev === 'STOP-BANG');
/* S=4 yes; BANG: BMI 38.6>35 ->1, age 52>50 ->1, Female ->0 => total 6 of 8 answered 8 */
eq(sb.score, 6, 'STOP-BANG 6 (4 asked + BMI + age, female 0)');
eq(sb.itemsAnswered, 8, 'all 8 items resolved (3 auto)');
eq(sb.severity, 'severe', 'score 6 = high OSA risk');
const sbHint = A.gatewayHints().find(h => h.msg.indexOf('Epworth') >= 0);
ok(sbHint, 'STOP-BANG >=3 suggests Epworth');

console.log('PHQ-9 + safety flag');
A.S.toggles.phq9 = true;
const FOUR = ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'];
[2, 2, 1, 2, 1, 1, 1, 0].forEach((v, i) => A.setAnswer(70 + i, FOUR[v]));
A.setAnswer(78, FOUR[1]);
let phq = A.activeScores().find(s => s.abbrev === 'PHQ-9');
eq(phq.score, 11, 'PHQ-9 sums to 11');
eq(phq.severity, 'moderate', '11 = moderate');
ok(A.safetyFlag(), 'Q9 nonzero fires safety flag');
ok(phq.flags.length === 1, 'flag carried on score object');

console.log('PAVS always-on');
A.setAnswer(108, 3); A.setAnswer(109, 30);
let pavs = A.activeScores().find(s => s.abbrev === 'PAVS');
eq(pavs.score, 90, 'PAVS 3x30 = 90 min/wk');
eq(pavs.severity, 'insufficient', 'below 150 guideline');

console.log('diagnostic engine via checkbox mapping');
A.setAnswer(59, ['Hypertension']);
A.setAnswer(54, ['Mobility Limitations']);
let d = A.evaluate();
eq(d.classification, 'clinical-obesity', 'HTN + ADL + BMI 38.6 = clinical obesity');
ok(d.affectedSystems.indexOf('Cardiovascular') >= 0, 'CV system identified');
ok(d.reasoning.indexOf('organ dysfunction') >= 0, 'reasoning references organ dysfunction');
/* waist 41 >= 35 female: confirmatory support -> not presumed-from-BMI */
ok(d.reasoning.indexOf('presumed from BMI alone') < 0, 'waist confirms adiposity (no BMI-alone caveat)');

console.log('progress + export');
const p = A.progress();
ok(p.total > 60 && p.answered >= 17, 'progress counts visible/answered (' + p.answered + '/' + p.total + ')');
const j = JSON.parse(A.exportJSON());
eq(j.version, 1, 'export versioned');
eq(j.diagnostic.classification, 'clinical-obesity', 'export embeds diagnostic');
ok(j.scores.some(s => s.abbrev === 'STOP-BANG' && s.score === 6), 'export embeds scores');

console.log('save bridge + draft resume');
let performed = null;
global.FileMaker = { PerformScriptWithOption: (name, param, opt) => { performed = { name, param }; } };
ok(A.saveToFileMaker(), 'save bridge fires when FileMaker object present');
eq(performed.name, 'SaveInterview', 'calls SaveInterview script');
const saved = JSON.parse(performed.param);
eq(saved.diagnostic.classification, 'clinical-obesity', 'saved payload carries diagnostic');
delete global.FileMaker;
/* fresh instance resume */
delete require.cache[require.resolve('../src/app.js')];
const A2 = require('../src/app.js');
A2.boot({ demo: { age: 52, sex: 'Female', ethnicity: 'Caucasian', name: 'Demo, Dana' },
  anthro: { ft: 5, inch: 5, wt: 232, waist: 41 },
  toggles: saved.toggles, answers: saved.responses });
eq(A2.getAnswer(78), 'Several days (1)', 'resume restores PHQ-9 Q9 answer');
ok(A2.S.toggles.phq9 && A2.S.toggles.sb, 'resume restores open toggles');
const sb2 = A2.activeScores().find(s => s.abbrev === 'STOP-BANG');
eq(sb2.score, 6, 'resumed state rescores STOP-BANG 6 identically');
ok(A2.safetyFlag(), 'safety flag survives resume');

console.log('\nSESSION-1 GREEN -', n, 'assertions');

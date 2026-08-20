/* LOC-FM questions.js v1.1 (counseling checklist always visible + select-all, q40 restored) - pruned catalog per INTERVIEW_SPEC.md 2026-08-19 */
var LOCQ = (function () {
  var FOUR = ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'];
  var ESSP = ['Would never doze (0)', 'Slight chance (1)', 'Moderate chance (2)', 'High chance (3)'];
  var YN = ['Yes', 'No'];

  /* toggle groups: instrument metadata */
  var TOGGLES = {
    hvs:  { label: 'Hunger Vital Sign', ids: [68, 69] },
    phq9: { label: 'PHQ-9 Depression', ids: [70, 71, 72, 73, 74, 75, 76, 77, 78] },
    gad7: { label: 'GAD-7 Anxiety', ids: [79, 80, 81, 82, 83, 84, 85] },
    scoff:{ label: 'SCOFF Eating Disorder', ids: [86, 87, 88, 89, 90] },
    sb:   { label: 'STOP-BANG OSA', ids: [95, 96, 97, 98, 99] },
    ess:  { label: 'Epworth Sleepiness', ids: [100, 101, 102, 103, 104, 105, 106, 107] }
  };

  var Q = {};
  function q(id, question, type, options, extra) {
    Q[id] = Object.assign({ id: id, question: question, type: type, options: options || null }, extra || {});
  }

  /* Introduction */
  q(3, 'Primary goal for this visit?', 'textarea');
  q(4, 'Does the patient have a primary care provider?', 'radio', YN);
  /* Weight History */
  q(5, 'Tell me the story of your weight', 'textarea', null,
    { description: 'Age of onset, triggers, highest/lowest adult weight, prior attempts and what happened after' });
  q(52, 'What is your personal weight loss goal (lbs)?', 'number');
  q(62, 'Highest adult weight (lbs)?', 'number', null, { prefillField: 'HPIHighestWeight' });
  q(64, 'Lowest adult weight since age 20 (lbs)?', 'number', null, { prefillField: 'HPILowestWeight' });
  /* Hunger VS (toggle) */
  q(68, 'In the past 12 months, we worried whether our food would run out before we got money to buy more.', 'radio', ['Often true', 'Sometimes true', 'Never true']);
  q(69, 'In the past 12 months, the food we bought just didn\'t last and we didn\'t have money to get more.', 'radio', ['Often true', 'Sometimes true', 'Never true']);
  /* Meds & Allergies */
  q(11, 'Current medications?', 'textarea', null, { prefillField: 'MedicationRaw' });
  q(12, 'Allergies?', 'text', null, { prefillField: 'Allergies' });
  q(13, 'Any known weight-promoting medications?', 'radio', ['Yes', 'No', 'Unsure']);
  /* Contraindication Screening */
  q(14, 'History of Medullary Thyroid Carcinoma (MTC)?', 'radio', YN);
  q(15, 'History of MEN2?', 'radio', YN);
  q(16, 'Family history of medullary thyroid cancer or MEN2?', 'radio', YN);
  q(17, 'Any history of pancreatitis, gastroparesis, or gallbladder disease?', 'checkbox', ['Pancreatitis', 'Gastroparesis', 'Gallbladder disease', 'None']);
  q(18, 'Any GI symptoms (reflux, nausea, etc.)?', 'text');
  q(19, 'Current contraception method?', 'text', null, { description: 'Method only - pregnancy intent is asked in Past Medical History' });
  q(20, 'Does the patient have diabetes and use insulin?', 'radio', YN);
  /* Medical History */
  q(21, 'Other medical conditions or surgeries?', 'textarea');
  q(23, 'Family history (obesity, thyroid, metabolic, cancer)?', 'textarea');
  /* PHQ-9 */
  var phq = ['little interest or pleasure in doing things', 'feeling down, depressed, or hopeless',
    'trouble falling or staying asleep, or sleeping too much', 'feeling tired or having little energy',
    'poor appetite or overeating', 'feeling bad about yourself, or that you are a failure or have let yourself or your family down',
    'trouble concentrating on things, such as reading or watching TV',
    'moving or speaking so slowly that others noticed - or the opposite, being fidgety or restless',
    'thoughts that you would be better off dead, or of hurting yourself'];
  phq.forEach(function (t, i) {
    q(70 + i, 'PHQ-9 Q' + (i + 1) + ': Over the last 2 weeks, ' + t + '?', 'radio', FOUR,
      i === 8 ? { safety: true, description: 'Any non-zero response should prompt a direct safety assessment.' } : null);
  });
  /* GAD-7 */
  var gad = ['feeling nervous, anxious, or on edge', 'not being able to stop or control worrying',
    'worrying too much about different things', 'trouble relaxing',
    'being so restless that it\'s hard to sit still', 'becoming easily annoyed or irritable',
    'feeling afraid as if something awful might happen'];
  gad.forEach(function (t, i) { q(79 + i, 'GAD-7 Q' + (i + 1) + ': Over the last 2 weeks, ' + t + '?', 'radio', FOUR); });
  /* SCOFF */
  q(86, 'SCOFF Q1: Do you make yourself Sick because you feel uncomfortably full?', 'radio', YN);
  q(87, 'SCOFF Q2: Do you worry you have lost Control over how much you eat?', 'radio', YN);
  q(88, 'SCOFF Q3: Have you recently lost more than One stone (~14 lbs) in a 3-month period?', 'radio', YN);
  q(89, 'SCOFF Q4: Do you believe yourself to be Fat when others say you are too thin?', 'radio', YN);
  q(90, 'SCOFF Q5: Would you say that Food dominates your life?', 'radio', YN);
  /* Functional / Symptoms */
  q(54, 'Limitations in Activities of Daily Living (ADL)?', 'checkbox', ['Mobility Limitations', 'Bathing Difficulty', 'Dressing Difficulty', 'Toileting Difficulty', 'Continence Issues', 'Eating Difficulty', 'None']);
  q(55, 'Respiratory or exercise-related symptoms?', 'checkbox', ['Breathlessness/Dyspnea', 'Chronic Fatigue', 'None']);
  q(56, 'Physical symptoms?', 'checkbox', ['Chronic Pain', 'Urinary Incontinence', 'Gastroesophageal Reflux (GERD)', 'None']);
  /* Past Medical History */
  q(58, 'Metabolic or endocrine conditions?', 'checkbox', ['Type 2 Diabetes', 'Polycystic Ovary Syndrome (PCOS)', 'None']);
  q(59, 'Cardiovascular conditions?', 'checkbox', ['Hypertension', 'Cardiovascular Disease', 'None']);
  q(60, 'Other conditions?', 'checkbox', ['Sleep Apnea', 'NAFLD/NASH', 'Osteoarthritis', 'None']);
  q(91, 'Personal history of obesity-related cancer?', 'checkbox', ['Breast', 'Ovarian', 'Endometrial/Uterine', 'Esophageal', 'Gastric', 'Pancreatic', 'Colon/Colorectal', 'Other cancer', 'None']);
  q(94, 'Fertility/pregnancy intent within the next 2 years?', 'radio', ['Trying to conceive now', 'Planning within 2 years', 'Not planning', 'Unsure', 'Not applicable'],
    { description: 'Critical for GLP-1 counseling - avoid pregnancy during treatment and ~2 months before discontinuation.' });
  /* STOP-BANG */
  q(95, 'STOP-BANG S: Do you Snore loudly - louder than talking, or heard through closed doors?', 'radio', YN);
  q(96, 'STOP-BANG T: Do you often feel Tired, fatigued, or sleepy during the daytime?', 'radio', YN);
  q(97, 'STOP-BANG O: Has anyone Observed you stop breathing, choking, or gasping during sleep?', 'radio', YN);
  q(98, 'STOP-BANG P: Do you have, or are you being treated for, high blood Pressure?', 'radio', YN);
  q(99, 'STOP-BANG N: Is your Neck circumference greater than 16 inches (40 cm)?', 'radio', YN,
    { description: 'BMI, Age, and sex points auto-derive from the header.' });
  /* Epworth */
  var ess = ['Sitting and reading', 'Watching TV', 'Sitting inactive in a public place (theater, meeting)',
    'As a passenger in a car for an hour without a break', 'Lying down to rest in the afternoon when circumstances permit',
    'Sitting and talking to someone', 'Sitting quietly after a lunch without alcohol',
    'In a car, while stopped for a few minutes in traffic'];
  ess.forEach(function (t, i) { q(100 + i, 'Epworth Q' + (i + 1) + ': ' + t + ' - chance of dozing?', 'radio', ESSP); });
  /* Lifestyle */
  q(24, 'Describe current diet / a typical day of eating.', 'textarea');
  q(108, 'PAVS Q1: Days per week of moderate-to-vigorous physical activity (like a brisk walk)?', 'number');
  q(109, 'PAVS Q2: On those days, minutes of moderate-to-vigorous activity on average?', 'number',
    null, { description: 'Weekly total = days x minutes. Under 150 min/week = inactive.' });
  q(29, 'Strength training sessions per week?', 'number');
  q(30, 'Average sleep hours per night?', 'number', null, { writeBack: 'HoursofSleep' });
  q(31, 'Sleep quality concerns (snoring, daytime sleepiness)?', 'text', null, { gateway: 'sleep' });
  q(32, 'Mood or stress issues to note?', 'text', null, { gateway: 'mood' });
  q(33, 'Alcohol use?', 'text', null, { writeBack: 'Alcohol' });
  q(34, 'Tobacco/vaping/substance use?', 'text', null, { writeBack: 'Smoking' });
  /* Medication Preferences */
  q(35, 'Previously used GLP-1 medications?', 'radio', YN);
  q(36, 'Preferred medication?', 'dropdown', ['Semaglutide', 'Tirzepatide', 'Open to either']);
  q(38, 'Any concern about compounded options?', 'radio', YN);
  /* Education & Counseling */
  q(39, 'GLP-1 warnings and contraindications discussed?', 'checkbox', ['Thyroid C-cell tumor risk (MTC/MEN2)', 'Severe stomach problems', 'Kidney problems/dehydration', 'Gallbladder problems', 'Pancreatitis', 'Serious allergic reactions', 'Hypoglycemia risk', 'Vision changes', 'Tachycardia', 'Depression/suicidal thoughts', 'Birth control interaction'],
    { selectAll: 'Mark all discussed' });
  q(40, 'Common side effects reviewed (nausea, diarrhea, vomiting, constipation, injection site reactions, etc.)?', 'radio', YN);
  q(41, 'Patient questions or concerns about medication risks?', 'textarea');
  q(42, 'Patient verbalized understanding of risks and benefits?', 'radio', ['Yes', 'No', 'Partial understanding - requires follow-up']);
  /* Plan & Follow-Up */
  q(43, 'Selected medication and starting dose?', 'text', null, { writeBack: 'Prescription' });
  q(44, 'Labs ordered?', 'checkbox', ['A1C', 'Comprehensive metabolic panel', 'TSH', 'Lipid panel', 'Patient had done at PCP and will send to me'], { writeBack: 'OrderTests' });
  q(201, 'Lab details (optional)', 'text', null, { subOf: 44 });
  q(46, 'Body composition scan recommended?', 'radio', YN);
  q(47, 'Sleep testing ordered?', 'radio', ['Yes', 'No', 'Suggest PCP order study', 'Not applicable']);
  q(48, 'Dietitian referral needed?', 'radio', ['Yes', 'No', 'Already scheduled']);
  q(50, 'Follow-up interval?', 'text', null, { writeBack: 'returntoclinic' });
  q(51, 'Additional notes or instructions?', 'textarea');

  var SECTIONS = [
    { name: 'Introduction', items: [3, 4] },
    { name: 'Weight History', items: [5, 52, 62, 64] },
    { name: 'Food Security', toggle: 'hvs' },
    { name: 'Medications & Allergies', items: [11, 12, 13] },
    { name: 'Contraindication Screening', items: [14, 15, 16, 17, 18, 19, 20] },
    { name: 'Medical History', items: [21, 23] },
    { name: 'Mood Screens', toggles: ['phq9', 'gad7'] },
    { name: 'Eating Behavior', toggle: 'scoff' },
    { name: 'Functional Limitations', items: [54] },
    { name: 'Current Symptoms', items: [55, 56] },
    { name: 'Past Medical History', items: [58, 59, 60, 91, 94] },
    { name: 'Sleep Screening', toggles: ['sb', 'ess'] },
    { name: 'Lifestyle', items: [24, 108, 109, 29, 30, 31, 32, 33, 34] },
    { name: 'Medication Preferences', items: [35, 36, 38] },
    { name: 'Education & Counseling', items: [39, 40, 41, 42] },
    { name: 'Plan & Follow-Up', items: [43, 44, 201, 46, 47, 48, 50, 51] }
  ];

  return { Q: Q, SECTIONS: SECTIONS, TOGGLES: TOGGLES };
})();
if (typeof module !== 'undefined') { module.exports = LOCQ; }

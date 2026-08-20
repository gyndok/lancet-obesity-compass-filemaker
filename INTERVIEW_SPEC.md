# Lancet Obesity Compass — FileMaker Port: Pruned Interview Spec v1.0
Decided section-by-section with GK, 2026-08-19. This file is the authoritative
build input for the port. Question ids reference initialVisitQuestions.ts in
github.com/gyndok/lancet-obesity-compass-desktop (104 questions, 17 sections).

## Dispositions
- KEEP        asked in the default flow
- TOGGLE      section/instrument collapsed by default; one tap expands; scored only if opened
- PREFILL     auto-populated from the FM patient record; shown read-only in header
- PREFILL-EDIT shown as editable starting value from FM field; new patients see empty field
- CUT         removed entirely
- MACRO       replaced by a one-tap boilerplate writer

## Section-by-section

### 1. Patient Demographics — PREFILL (section removed from rail)
- 1 age            <- PT_DOB (computed)
- 2 sex            <- Gender
- 53 ethnicity     <- Race
Shown in read-only ClinicalDataHeader. Still feed scoring (STOP-BANG auto items,
diagnostic engine) silently.

### 2. Introduction & Verification — KEEP both
- 3 primary goal (textarea)  — anchor for visit summary/HPI
- 4 has PCP (radio)          — used by Plan options (labs at PCP, PCP sleep study)

### 3. Weight History — 8 -> 2 asked + 2 confirmed
- 5  weight story (textarea)                 KEEP (clinical heart)
- 52 personal goal lbs (number)              KEEP
- 62 highest adult weight                    PREFILL-EDIT <-> HPIHighestWeight
- 64 lowest adult weight                     PREFILL-EDIT <-> HPILowestWeight
- 61, 63, 65, 66, 67                         CUT (live inside the story)

### 4. Hunger Vital Sign — TOGGLE (68, 69; scored pair)

### 5. Medications & Allergies — KEEP all 3 as asked (new-patient reality)
- 11 current meds (textarea)   writes MedicationRaw; any existing value shows as
  editable starting text (transfer/prior-chart patients), blank for new
- 12 allergies (text)          writes Allergies; same behavior
- 13 weight-promoting meds Y/N/Unsure  KEEP

### 6. Contraindication Screening — KEEP intact, all 7 (14-20)
Safety-critical + medicolegal. 19 SHARPENED to contraception METHOD only
(pregnancy intent owned by 94). Writes toward ContraIndications calc inputs.

### 7. Medical History — 3 -> 2
- 21 other conditions/surgeries  KEEP
- 22 mental health concerns      CUT (covered by PHQ/GAD toggles, med list, 21)
- 23 family history              KEEP; prompt widened to
  "obesity, thyroid, metabolic, CANCER" (absorbs cut 92)

### 8. PHQ-9 + GAD-7 — TOGGLE each instrument separately
- PHQ-9 (70-78) toggle; Q9 (78) safety flag live whenever opened
- GAD-7 (79-85) toggle
Gateway: question 32 (mood/stress) is the sentry prompting these toggles.

### 9. SCOFF — TOGGLE (86-90; >=2 yes = positive)

### 10. Functional Limitations — KEEP
- 54 ADL checkbox — Lancet engine input (functional impairment leg)

### 11. Current Symptoms — 3 -> 2
- 55 respiratory/exercise sx     KEEP (Lancet engine input)
- 56 physical sx                 KEEP (Lancet engine input)
- 57 sleep/mental checkboxes     CUT (triple duplication)

### 12. Past Medical History — 7 -> 5
- 58 metabolic/endocrine         KEEP (engine + prescribing)
- 59 cardiovascular              KEEP (engine + prescribing)
- 60 other (OSA/NAFLD/OA)        KEEP (engine + prescribing)
- 91 personal ob-related cancer  KEEP
- 92 family ob-related cancer    CUT -> folded into 23 free text
- 93 menstrual/reproductive      CUT (chart owns this: MenstrualCycles,
     Menopause, PregnancyHistory fields)
- 94 fertility/pregnancy intent  KEEP (GLP-1-critical; owns intent; 19 owns method)

### 13. Sleep Screening — TOGGLE both instruments
- STOP-BANG (95-99) toggle; BMI>35/age>50/male auto-derive when opened;
  score writes back to STOPBANG field / ProblemList chips
- Epworth (100-107) toggle
Gateway: question 31 (sleep quality concerns) is the sentry. Optional nudge:
suggest opening Epworth when STOP-BANG >=3.

### 14. Lifestyle — 13 -> 9
- 24 diet narrative              KEEP, absorbs 26 ("typical day of eating")
- 25 sensitivities               CUT
- 26 typical meals               CUT (merged into 24)
- 27 activity dropdown           CUT (PAVS is strictly better)
- 28 exercise barriers           CUT
- 108/109 PAVS days+minutes      KEEP (scored; <150 min/wk = inactive)
- 29 strength sessions/wk        KEEP
- 30 sleep hours                 KEEP -> HoursofSleep
- 31 sleep quality concerns      KEEP — GATEWAY to sleep toggles
- 32 mood/stress                 KEEP — GATEWAY to PHQ/GAD toggles
- 33 alcohol                     KEEP -> Alcohol
- 34 tobacco/vaping/substances   KEEP -> Smoking / Non Medical Drugs

### 15. Medication Preferences — 4 -> 3
- 35 prior GLP-1 use             KEEP
- 36 preferred medication        KEEP
- 37 preference details          CUT
- 38 compounded concern          KEEP (flag: cuts if compounded no longer offered)

### 16. Education & Counseling — 4 items (rev 2026-08-19: checklist stays visible)
- 39 warnings checklist          KEEP, always visible, itemized (11 risks) with a
  one-tap "Mark all discussed" select-all button
- 40 common side effects Y/N     KEEP (restored)
- 41 patient questions/concerns  KEEP (textarea)
- 42 verbalized understanding    KEEP (radio incl. "partial - requires follow-up")

### 17. Plan & Follow-Up — 9 -> 7
- 43 selected med + dose         KEEP -> Prescription
- 44 labs ordered                KEEP -> OrderTests
- 45 lab details                 CUT as question; optional free-text line under 44
- 46 body comp recommended       KEEP
- 47 sleep testing               KEEP
- 48 dietitian referral          KEEP
- 49 target weight goal          CUT (third copy of goal: 52 + TargetWeight calc)
- 50 follow-up interval          KEEP -> Visits::returntoclinic (feeds PanelDash)
- 51 additional notes            KEEP

## Final shape
- Default flow: ~47 questions (many single taps) + 2 narratives
- Behind 6 toggles: 36 questions (HungerVS 2, PHQ-9 9, GAD-7 7, SCOFF 5,
  STOP-BANG 5, Epworth 8) — gateways at 31/32
- Prefilled: 3 (demographics header)
- Cut: 17   (macro concept dropped in favor of visible checklist + select-all)

## Engine integrity check
- STOP-BANG: auto items from prefill; asked items intact when toggled open
- PHQ-9/GAD-7/SCOFF/HungerVS/Epworth/PAVS: instruments intact within toggles
- Lancet diagnostic engine inputs preserved: demographics (prefill), BMI
  (anthropometrics), symptoms 55/56, ADL 54, conditions 58/59/60
- PHQ-9 Q9 safety flag: live whenever PHQ-9 opened

## Write-back map (interview -> FM fields, first pass)
11->MedicationRaw  12->Allergies  30->HoursofSleep  33->Alcohol
34->Smoking + Non Medical Drugs  43->Prescription  44->OrderTests
50->Visits::returntoclinic  62->HPIHighestWeight  64->HPILowestWeight
STOP-BANG score->STOPBANG  full responses JSON->new InterviewJSON field (Visits)
summary narrative->VisitSummary pipeline

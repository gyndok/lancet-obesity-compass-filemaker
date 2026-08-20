# Lancet Obesity Compass — FileMaker Port

A full port of [lancet-obesity-compass-desktop](https://github.com/gyndok/lancet-obesity-compass-desktop)
(Electron/React) into a FileMaker web viewer. The structured obesity intake interview now runs
*inside the patient's chart*: demographics and anthropometrics prefill from the record, clinical
scores compute live, and saving writes structured JSON back into FileMaker and stages a
prompt-ready intake summary for note generation. The Electron app is retired.

## What changed from the desktop app

- **UI**: React/Radix/Tailwind replaced by a single-file vanilla JS app (`src/app.js`) rendered
  in a FileMaker web viewer. Section rail, live score chips, PHQ-9 Q9 safety banner, gateway
  hints, progress counter.
- **Interview pruned** per clinician review: 104 questions → ~50 asked by default, 36 behind six
  optional toggles (Hunger VS, PHQ-9, GAD-7, SCOFF, STOP-BANG, Epworth), 3 prefilled, rest cut.
  Full decision record in `INTERVIEW_SPEC.md`. Two lifestyle questions (sleep concerns,
  mood/stress) act as gateways that suggest opening the relevant instruments; STOP-BANG >= 3
  suggests Epworth.
- **Engine untouched**: `clinicalScoring.ts` and `diagnostic-engine.ts` from the parent repo are
  transpiled byte-faithfully with esbuild into `build/loc_engine.js`. The parent's 76 golden
  vitest cases run against the bundle under a minimal shim (`test/vitest_shim.js`) — all pass, so
  every published cutoff (PHQ-9 5/10/15/20, GAD-7, SCOFF >=2, STOP-BANG 3/5, ESS >=11, PAVS
  150 min/wk, HVS either-item) and every Lancet Commission rule is provably identical.
- **Storage**: SQLite replaced by FileMaker itself. Save calls a FileMaker script via
  `FileMaker.PerformScriptWithOption`; the JSON payload (responses, toggles, scores, diagnostic)
  lands in a text field, which also powers draft resume on reopen.
- **STOP-BANG economics**: BMI, age, and sex points auto-derive from the prefilled header —
  five taps yield the full 8-point instrument.

## Repository layout

```
INTERVIEW_SPEC.md              authoritative pruning decisions + write-back map
src/questions.js               pruned question catalog (sections, toggles, gateways)
src/app.js                     interview app: state, render, save bridge, resume
src/entry_engine.ts            2-line esbuild entry re-exporting the parent engine
build/loc_engine.js            transpiled engine bundle (IIFE, global LOCENGINE)
filemaker/Interview_Full_calc.txt      web-viewer calc (shell + sources + prefill + boot)
filemaker/InterviewSummary_calc.txt    JSON -> readable intake block (feeds note pipeline)
filemaker/code-library/LOC_*.txt       paste-ready Code Library record payloads
test/vitest_shim.js            minimal describe/it/expect for node
test/test_loc_session1.js      123-assertion port harness (state, toggles, scores, resume)
preview/loc_fm_preview.html    self-contained browser preview with a demo patient
```

## FileMaker installation

Target: FileMaker 19+ (built and verified on FileMaker 2025 / v26).

1. **Code Library table** — fields `Name` (Text) and `Source` (Text). Three records, names
   exact: `LOCEngine`, `LOCQuestions`, `LOCApp`, pasting the matching
   `filemaker/code-library/*.txt`. Each payload ends with a `LOC_*_VERSION` constant — confirm
   it survived the paste.
2. **Fields on the patient table** — `InterviewJSON` (Text), then `Interview_Full`
   (Calculation, result Text, unstored) pasting `filemaker/Interview_Full_calc.txt`. The calc
   expects these fields on the patient table: `PT_DOB`, `Gender`, `Race`, `HeightFt`,
   `HeightIn`, `CurrentWeight`, `lnameFname`, `InterviewJSON` — rename to taste for other files.
3. **Script `SaveInterview`**:
   ```
   Set Error Capture [ On ]
   Set Variable [ $json ; Get ( ScriptParameter ) ]
   Set Field [ <patient table>::InterviewJSON ; $json ]
   Commit Records/Requests [ With dialog: Off ]
   ```
   Optional: also stage the readable summary for an LLM note pipeline —
   `Set Field [ ::AI Plan ; ::AI Plan & Char(13) & Char(13) & ::InterviewSummary ]` plus
   navigation steps to land on the staged field.
4. **`InterviewSummary`** (Calculation, Text, unstored) pasting
   `filemaker/InterviewSummary_calc.txt` — renders the saved JSON as a sectioned plain-text
   intake block; unanswered items are omitted.
5. **Layout + web viewer** on the patient table:
   ```
   "data:text/html;base64," & Base64Encode ( <patient table>::Interview_Full )
   ```
   Allow interaction: ON · Automatically encode URL: OFF ·
   **Allow JavaScript to perform FileMaker scripts: ON** (required for Save).

Boot markers `window.__locboot = [1,2,3,4]` bracket the script blocks; a failed load renders an
error page naming the first missing marker.

## Rebuilding / tests

```
npm install esbuild
npx esbuild src/entry_engine.ts --bundle --format=iife --global-name=LOCENGINE \
  --alias:@/types/interview=<parent>/src/renderer/types/interview.ts \
  --alias:@/types/clinical=<parent>/src/renderer/types/clinical.ts \
  --alias:@/lib/clinicalScoring=<parent>/src/renderer/lib/clinicalScoring.ts \
  --outfile=build/loc_engine.js
node test/test_loc_session1.js
```

## Provenance & license

Clinical engine and instrument content derive from lancet-obesity-compass-desktop by the same
author. Diagnostic logic implements the Lancet Commission on clinical obesity framework;
instruments (PHQ-9, GAD-7, SCOFF, STOP-BANG, Epworth, PAVS, Hunger Vital Sign) per their
published scoring. Not a medical device; clinical judgment required. Contains no patient data.

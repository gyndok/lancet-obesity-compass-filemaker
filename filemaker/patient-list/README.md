# PatientList v1.1 — DEPLOYED 2026-09-03

Instant-search patient list that replaces the old main menu + search results layouts. One screen: type-ahead search over all ~1,221 patients (name, account #, DOB in either format, Mochi MR, phone), filter chips, three sorts, color-coded row cards, inline weight-history expanders.

## Components

| Artifact | Where in FM | Notes |
|---|---|---|
| `PLApp_source.txt` | Code Library record `PLApp` | v1.1 — 31 node-harness assertions |
| `PatientList_Full_calc.txt` | Data Visualization::PatientList_Full (unstored Text) | SQL boot: OM demographics + WeighIn + Visits |
| `SetPatientStatus_script.txt` | Script, 16 steps | Active/Inactive toggle write-back |
| `PLNav_script.txt` | Script | routes new/import/data buttons to native scripts/layouts (wired per-file) |

## Wiring

Layout **"Patient List"** on Data Visualization; web viewer object **`plviewer`** = `"data:text/html;base64," & Base64Encode ( Data Visualization::PatientList_Full )`; interaction ON, encode OFF, Allow JS to perform FM scripts ON. Row name links → `GoToPatient` (fmp:// URL). Search box autofocuses on render and select-alls on focus, so the Mochi MR workflow is: land on layout → paste → one patient.

## Behavior notes

- Heights come from stored HeightFt/HeightIn (not the unstored HeightCalculated) for SQL speed; BMI computed in JS.
- Row colors: last-visit days red >122 / amber 91–122 / green; BMI red ≥30 / amber ≥25 / green; %TBWL gold ≥10 / purple ≥20.
- Status toggle is optimistic in the UI; SetPatientStatus's final `Refresh Object [plviewer]` re-renders from the database, self-correcting any failed write.
- Rows render capped at 200 (footer prompts to narrow the search).
- **v1.1 phantom-row guard:** real rows require 14 pipe-fields + numeric account number. Continuation lines from CR-containing text (e.g. pasted med-guide paragraphs in Prescription — found on one record, acct 10149) previously spawned 36 fake rows.
- The JS list displays but does not define a FileMaker found set — export/report workflows stay on native layouts.

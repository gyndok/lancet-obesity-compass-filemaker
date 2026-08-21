# ReturnVisit (FileMaker)

Single-screen return-visit lifecycle for **Obesity Management.fmp12**: carry-forward entry → Save → Doximity prompt → paste AI output → filed note view. Replaces the portal-based visit entry and the old "new portal row" script.

## Deployed versions (source of truth = FileMaker; this folder mirrors the Aug 20, 2026 evening DDR + Aug 21 field export)

| Artifact | Where in FM | Version |
|---|---|---|
| `code-library/RVApp_source.txt` | Code Library record `RVApp` (Name/Source) | v1.8 (exported from FileMaker Aug 21; syntax-checked + node smoke-tested) |
| `ReturnVisit_Full_calc.txt` | Unstored Text calc on Obesity Management, field `ReturnVisit_Full` | v1.7 |
| `VisitSummary_calc.txt` | Calc on Visits — Doximity prompt content | (edited Aug 20: PatientReported preferred over PasteIntakeQ) |
| `scripts/SaveReturnVisit.txt` | Script, 69 steps | find-or-create Visits by acct+date; 21 fields; MDMVisits on new+empty MDM; SECA row; OM::Prescription |
| `scripts/LoadVisit.txt` | Script | rail click → ISO-safe parse → Globals::RVSelectedDate → Refresh Object `rvviewer` |
| `scripts/RVResetDate.txt` | Script, OnRecordLoad on layout "Return Visit" | clears RVSelectedDate between patients |
| `scripts/SaveAIPaste.txt` | Script, 17 steps | stores pasted Doximity output → AI note pane |
| `scripts/MDMVisits.txt` | Script, 12 steps | seeds MDM for new visits |
| `scripts/GoToPatient.txt` | Script | PanelDash row link target |

Script files are DDR step-text exports (human-readable, not importable). To regenerate importable scripts use fmxmlsnippet + FmClipTools.

## Wiring

- Layout **"Return Visit"** (Obesity Management context), web viewer object named **`rvviewer`**, viewer = `"data:text/html;base64," & Base64Encode(ReturnVisit_Full)`; checkboxes: interaction ON, encode OFF, Allow JS to perform FM scripts ON.
- OnRecordLoad trigger → `RVResetDate`.
- Globals: `Globals::RVSelectedDate` (global Date).
- Fields added for this system: `Visits::PatientReported`; `Visits::grip strenth` (misspelling is load-bearing — referenced by SaveReturnVisit; the JS key is `gripStrenth`).
- Join key everywhere: `AccountNumber`. ExecuteSQL returns ISO dates (YYYY-MM-DD) in this file; JS parses both ISO and M/D/YYYY; FM scripts parse ISO via `If(PatternCount(p;"-")>0; Date(Middle(p;6;2);Middle(p;9;2);Left(p;4)); GetAsDate(p))`.

## Hard-won rules baked into this code

1. base64 decode via TextDecoder (`b64u()`), never bare `atob` — UTF-8.
2. `b64u()` sanitizes raw control chars from FM JSONSetElement (Char(11) soft returns → `\n`, other controls → space).
3. FM value-list rows are CR: JS splits on `/[\r\n]+/`.
4. ExecuteSQL multi-field rows break on text containing returns → per-field single-value queries for text fields.
5. `Refresh Object ["rvviewer"]` re-renders the data-URL viewer; Refresh Window does not reliably.
6. Stateless staged UI: stage re-derived from data on every render.

## Known issues / open polish

- MDMVisits output vs raw ProblemList seed mismatch (watch in real use).
- Doximity prompt card content when includePrompt=No.
- SECA panel does not load an existing scan row for editing (create-only).

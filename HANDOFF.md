# HANDOFF.md — Obesity Management FileMaker Development
**Written:** 2026-09-03. Covers the Aug 21 + Sep 2–3 sessions (GitHub backup, MetabolicFlags, LifestyleRx, PatientList). Successor to the Aug 20 handoff; everything that mattered is restated or superseded here.

## Who / What
Geffrey Klein, MD — OB/GYN + obesity medicine (WSOC + Mochi telemedicine). FileMaker 2025 (v26) file **Obesity Management.fmp12** (~1,221 patients, ~841 active). Physician-developer; comfortable with Manage Database, Script Workspace, calc pasting, FmClipTools. Nurse handles patient outreach (that's why OutreachWorklist was shelved).

## GitHub (NEW — full backup as of Sep 3)
Repo: **github.com/gyndok/lancet-obesity-compass-filemaker** (main). Push via the `github` local-dev MCP connector (works from Cowork; gh CLI on Mac also works).
- `filemaker/returnvisit/` — RVApp v1.8 source (recovered via Export Field Contents Aug 21), ReturnVisit_Full calc v1.7, VisitSummary + VisitSummaryCopy calcs, all 6 scripts, README.
- `filemaker/paneldash/` — Head/Body/Body2 **v1.0 as actually deployed** (DDR proved v1.1 was delivered in-chat but never pasted — legend-bottom fix still pending if wanted), HTML_Audit outcomes viewer, README.
- `filemaker/patient-list/` — PLApp v1.1 + calc + SetPatientStatus + PLNav + README (DEPLOYED).
- `filemaker/outreach-worklist/` — OWApp v1.0 + calc + MarkOutreach (BUILT + node-tested, **NOT deployed** — shelved; README has 20-min install if revived).
- `filemaker/` root — MetabolicFlags calc v2.0, LifestyleRx (see below), Interview_Full v1.2, InterviewSummary, MochiRefillMsg v1.1, SaveInterview script.
Interview repo lineage (v1 web / v2 desktop / v3 FM) unchanged.

## Deployed systems (verified in production)
1. **PanelDash v1.0** (Data Visualization; deployed Body/Body2 are v1.0, not v1.1).
2. **MochiRefillMsg v1.1** (OM calc).
3. **Lancet interview** (Code Library LOCEngine 1.0 / LOCQuestions 1.1 / LOCApp 1.2; Interview_Full v1.2).
4. **ReturnVisit** (RVApp v1.8 / ReturnVisit_Full v1.7 / SaveReturnVisit 69 steps).
5. **MetabolicFlags v2.0** (NEW, OM unstored calc) — parses `Labsbefore` free text (lines `YYYY-MM-DD — Name — Value [range]`, newest ISO date wins per analyte, urine-glucose "Negative" skipped) → HOMA-IR (gluc×ins/405) + FIB-4 (age×AST/(PLT×√ALT), age at AST draw, ≥65 cutoff 2.0) with NORMAL/BORDERLINE/INDETERMINATE/ABNORMAL flags. Tiers: HOMA <1/<2/<3/≥3; FIB-4 1.3/2.67. Empty if no data. Uses While() loops — no CF needed.
6. **VisitSummary Copy** (Doximity prompt field) = `ScrubPHI(VisitSummary) & appended "Metabolic Flags:" block` — every Doximity prompt now carries dated HOMA-IR/FIB-4.
7. **LifestyleRx v1.0** (OM unstored calc, delivered Sep 2) — verbatim exercise prescription block + personalized diet rec for nutritionist consult (RMR cascade BIABasalMetabolicRate→Mifflin, RMR−500 with 1200F/1500M floor matching VisitSummary, protein 1.2 g/kg via proteinIntake w/ CurrentWeight fallback). *Confirm it was pasted/verified — delivered but deployment not explicitly confirmed in-chat.*
8. **PatientList v1.1** (NEW, replaces main menu + search screens) — layout "Patient List" on Data Visualization, viewer object `plviewer`, Code Library `PLApp` v1.1, calc `PatientList_Full`. Instant search (name/acct/DOB both formats/Mochi MR/phone; autofocus + select-all → Mochi MR workflow = land, paste, done). Chips All/WSOC/Mochi + Active/Inactive/Everyone + sorts A-Z/Overdue/Top-loss. 200-row render cap. Scripts: SetPatientStatus (optimistic toggle, self-correcting via Refresh Object), PLNav (param new/import/data → wired natively). v1.1 guard: real rows need 14 pipe-fields + numeric acct (kills phantom rows from CR-containing Prescription text). Count verified = native 1221. Old menu/search layouts still exist — retire after ~1 week of trust.

## Hard-won lessons (all Aug 20 lessons still apply, plus)
11. **CR-continuation phantom rows**: any SELECTed text field containing returns spawns fake rows; put risky text fields LAST in the SELECT and guard in JS (field-count + numeric-key test). Bit PatientList (36 phantoms from med-guide text pasted in one patient's Prescription).
12. **FM string escapes `\\` → `\`**: write JS control-char regex in calcs as `\\u0000-\\u001F` (ASCII-safe, replaces embedding raw control chars).
13. **DDR ≠ Code Library**: record data (RVApp etc.) never appears in a DDR — only Export Field Contents recovers it. Clipboard copies of big code can silently become screenshots (RTFD trap); always Export Field Contents → .txt.
14. **While() works great** for text parsing in plain calcs (MetabolicFlags) — no custom function needed.
15. Multiple `<Script>` nodes appear per name in DDR (catalog stubs with 0 steps) — take the longest when extracting.

## Data chores (open)
- **Scroggins, acct 10149**: Prescription contains 36 lines of pasted GLP-1 med-guide text — clear + re-select drug (likely one of PanelDash's "Other" slice). RV app self-heals on next visit save.
- **Blank record acct 10862**: no name/DOB/visits — delete or complete.
- Terzepatide ghost sweep: RAN Aug 21, **zero hits** — closed.

## Open threads (priority order)
1. Retire old main menu + search layouts once PatientList has a week of trust.
2. Confirm LifestyleRx v1.0 deployed; consider surfacing it (VisitSummary Copy append like MetabolicFlags, or AVS).
3. ReturnVisit polish (from Aug 20 list): MDMVisits vs ProblemList seed; Doximity card when includePrompt=No; SECA edit-load; double-Save duplicate summary in AI Plan.
4. PanelDash: decide whether to paste the delivered v1.1 Body/Body2 (legend bottom, single-line breaks) — repo has deployed v1.0.
5. PanelDash sixth card ("on nothing + not losing"); PtDash print script; SaveInterview write-back mapping; Labsbefore→Labs migration question.
6. OutreachWorklist: shelved (nurse covers it); revival = filemaker/outreach-worklist/README.md.

## Working environment for Claude (rebuild in new session)
- DDR: re-upload `Obesity_Management_fmp12.xml` (UTF-16 → iconv to UTF-8). Latest used: Aug 20 evening (post-ReturnVisit; pre-MetabolicFlags/LifestyleRx/PatientList — regenerate for current schema).
- Canonical sources + harnesses lived in `/home/claude/loc-port/`: pl_app.js + test_pl.js (31 asserts), ow_app.js + test_ow.js (36), rvapp/RVApp_source.txt, extract/ (DDR calc+script exports). **This repo is now the canonical backup — regenerate locals from here.**
- obesity-management MCP (patient CRUD via AppleScript) needs FileMaker open on the Mac; no raw-SQL tool — use Data Viewer for ad-hoc queries.
- Iteration protocol unchanged: node harness + FM-eval sim before delivery; app changes = paste Code Library record; verify version tail; one step at a time with screenshots; Export Field Contents (never clipboard) for retrieving big field contents.

## Conventions
- Sand/teal design language: bg #f6f1e7, cards #fff/#e3d8c2 borders, accent #0e5c4a, amber #b45309, red #b91c1c; %TBWL gold ≥10 / purple ≥20; last-visit red >122d / amber 91–122.
- Load-bearing names: scripts `GoToPatient`, `SaveInterview`, `SaveReturnVisit`, `SaveAIPaste`, `LoadVisit`, `RVResetDate`, `MDMVisits`, `SetPatientStatus`, `PLNav`; viewer objects `rvviewer`, `plviewer` (+ `owviewer` if worklist revived); Code Library Name values are SQL keys: LOCEngine/LOCQuestions/LOCApp/RVApp/PLApp (+OWApp).
- All viewers: `"data:text/html;base64," & Base64Encode(calc)`, interaction ON, encode OFF, Allow JS to perform FM scripts ON; boot via JSONSetElement+Base64 with b64u() control-char sanitize.

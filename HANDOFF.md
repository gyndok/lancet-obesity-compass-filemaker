# HANDOFF.md — Obesity Management FileMaker Development
**Written:** 2026-09-03 (updated same day). Covers the Aug 21 + Sep 2–3 sessions (GitHub backup, MetabolicFlags, LifestyleRx, PatientList, and the new Prenatal Record project). Successor to the Aug 20 handoff; everything that mattered is restated or superseded here.

## Who / What
Geffrey Klein, MD — OB/GYN + obesity medicine (WSOC + Mochi telemedicine). FileMaker 2025 (v26) file **Obesity Management.fmp12** (~1,221 patients, ~841 active). Physician-developer; comfortable with Manage Database, Script Workspace, calc pasting, FmClipTools. Nurse handles patient outreach (that's why OutreachWorklist was shelved).

## GitHub (full backup as of Sep 3)
Repo: **github.com/gyndok/lancet-obesity-compass-filemaker** (main). Push via the `github` local-dev MCP connector (works from Cowork; gh CLI on Mac also works).
- `filemaker/returnvisit/` — RVApp v1.8 source (recovered via Export Field Contents Aug 21), ReturnVisit_Full calc v1.7, VisitSummary + VisitSummaryCopy calcs, all 6 scripts, README.
- `filemaker/paneldash/` — Head/Body/Body2 **v1.0 as actually deployed** (DDR proved v1.1 was delivered in-chat but never pasted — legend-bottom fix still pending if wanted), HTML_Audit outcomes viewer, README.
- `filemaker/patient-list/` — PLApp v1.1 + calc + SetPatientStatus + PLNav + README (DEPLOYED).
- `filemaker/outreach-worklist/` — OWApp v1.0 + calc + MarkOutreach (BUILT + node-tested, **NOT deployed** — shelved; README has 20-min install if revived).
- `filemaker/` root — MetabolicFlags calc v2.0, LifestyleRx, Interview_Full v1.2, InterviewSummary, MochiRefillMsg v1.1, SaveInterview script.
Interview repo lineage (v1 web / v2 desktop / v3 FM) unchanged.

## NEW: Prenatal Record file (Sep 3)
Repo: **github.com/gyndok/prenatal-record-filemaker** (private). Same architecture ported to **Prenatal Record.fmp12** (~14,534 records; file already had its own Code Library table w/ ChartJS/Annotation/PNCApp records from the PrenatalChart port).
- **PNList v1.1 DEPLOYED**: instant-search patient list replacing legacy Search Screen + Search Results. Layout "Prenatal List" on **Practice Information**, viewer object `pnviewer`, Code Library record `PNList`, calc `Practice Information::PNList_Full`. Default Active-by-due-next with live GA chips (amber >=37w, red >=40w) from `EDC Selected`; typing a search auto-widens to Everyone. Row buttons Flow/Labs/US/Admit -> script **PNNav** ({rid,dest}); branches replicate legacy search-button destination steps (legacy scripts re-run screen finds — never call them directly). Status port of `activepreg` calc in JS.
- **`pnkey`** stored serial on Prenatal Record (backfilled 1–14,534) is the row key — replaced the unstored `recordid` calc in both SQL and PNNav find for the big performance win. LOAD-BEARING: never renumber.
- Optional next perf step if wanted: cache pattern (PNListCache/PNListCacheTime + RefreshPNList + OnLayoutEnter staleness check) — documented in that repo's README.
- DDR transfer trick for the 44MB XML: gzip on-device via device_bash into the connected folder, stage the .gz (chat upload rejects >~20MB; Downloads folder connected via desktop app).

## Deployed systems in Obesity Management (verified in production)
1. **PanelDash v1.0** (Data Visualization; deployed Body/Body2 are v1.0, not v1.1).
2. **MochiRefillMsg v1.1** (OM calc).
3. **Lancet interview** (Code Library LOCEngine 1.0 / LOCQuestions 1.1 / LOCApp 1.2; Interview_Full v1.2).
4. **ReturnVisit** (RVApp v1.8 / ReturnVisit_Full v1.7 / SaveReturnVisit 69 steps).
5. **MetabolicFlags v2.0** (OM unstored calc) — parses `Labsbefore` free text (newest ISO date wins per analyte) -> HOMA-IR + FIB-4 (age at AST draw, >=65 cutoff 2.0) with flags. Empty if no data. While() loops, no CF.
6. **VisitSummary Copy** = ScrubPHI(VisitSummary) + appended Metabolic Flags block (feeds every Doximity prompt).
7. **LifestyleRx v1.0** (OM unstored calc) — exercise prescription block + diet rec for nutritionist (RMR cascade, RMR-500 with 1200F/1500M floor, protein 1.2 g/kg).
8. **PatientList v1.1** — instant-search list on Data Visualization (`plviewer`, PLApp v1.1, SetPatientStatus, PLNav). Count verified = native 1221. Old menu/search layouts still exist — retire after ~1 week of trust.

## Hard-won lessons (all Aug 20 lessons still apply, plus)
11. **CR-continuation phantom rows**: any SELECTed text field with returns spawns fake rows; put risky text fields LAST in the SELECT and guard in JS (field-count + numeric-key test). Bit PatientList (36 phantoms) and PNList (~125).
12. **FM string escapes `\\` -> `\`**: write JS control-char regex in calcs as `\\u0000-\\u001F` (ASCII-safe).
13. **DDR != Code Library**: record data never appears in a DDR — Export Field Contents recovers it. Clipboard copies of big code can silently become screenshots (RTFD trap).
14. **While() works great** for text parsing in plain calcs (MetabolicFlags).
15. DDR has catalog-stub duplicate <Script> nodes (0 steps) — take the longest when extracting.
16. **Unstored calc keys are slow everywhere**: SQLing or Finding on an unstored calc (e.g. Get(RecordID) recordid) touches every record. Add a stored auto-enter serial, backfill via Replace Field Contents w/ "update Entry Options", and swap it into both the SELECT and the find (PNList v1.1 pattern).
17. Legacy screen-context scripts (that Set Field in Find mode + Perform Find on user-entered criteria) must not be called from viewer nav scripts — replicate only their destination steps.

## Data chores (open)
- OM: **Scroggins, acct 10149** — Prescription holds 36 lines of pasted GLP-1 med-guide text; clear + re-select drug. **Blank record acct 10862** — delete or complete.
- Terzepatide ghost sweep: ran Aug 21, zero hits — closed.

## Open threads (priority order)
1. Retire OM old main menu + search layouts once PatientList has a week of trust; same later for Prenatal legacy Search screens once PNList is trusted.
2. Confirm LifestyleRx v1.0 deployed; consider surfacing it (VisitSummary Copy append, or AVS).
3. ReturnVisit polish (from Aug 20 list): MDMVisits vs ProblemList seed; Doximity card when includePrompt=No; SECA edit-load; double-Save duplicate summary in AI Plan.
4. PanelDash: decide whether to paste the delivered v1.1 Body/Body2 — repo has deployed v1.0.
5. PanelDash sixth card; PtDash print script; SaveInterview write-back mapping; Labsbefore->Labs migration question.
6. OutreachWorklist: shelved (nurse covers it); revival = filemaker/outreach-worklist/README.md.
7. Prenatal: optional PNList cache pattern if layout entry still lags after pnkey fix; more prenatal apps as wanted (the DDR gzip trick makes schema refresh easy).

## Working environment for Claude (rebuild in new session)
- DDRs: OM latest used Aug 20 evening (pre-MetabolicFlags/LifestyleRx/PatientList — regenerate for current schema); Prenatal Sep 3 (44MB, gzip + stage via connected Downloads folder). UTF-16 -> iconv to UTF-8.
- Canonical sources + harnesses: both repos are canonical. Local dirs were /home/claude/loc-port (OM: pl_app/test_pl 31 asserts, ow_app/test_ow 36) and /home/claude/prenatal (pn_app/test_pn 24 asserts).
- obesity-management MCP (patient CRUD) needs FileMaker open on the Mac; no raw-SQL tool — Data Viewer for ad-hoc queries.
- Iteration protocol unchanged: node harness + FM-eval sim before delivery; app changes = paste Code Library record; verify version tail; one step at a time with screenshots; Export Field Contents (never clipboard) for big field retrieval.

## Conventions
- Sand/teal design language across all apps: bg #f6f1e7, cards #fff/#e3d8c2, accent #0e5c4a, amber #b45309, red #b91c1c; %TBWL gold >=10 / purple >=20; last-visit red >122d / amber 91-122; GA amber >=37w / red >=40w.
- Load-bearing names — OM: scripts GoToPatient, SaveInterview, SaveReturnVisit, SaveAIPaste, LoadVisit, RVResetDate, MDMVisits, SetPatientStatus, PLNav; objects rvviewer, plviewer; Code Library keys LOCEngine/LOCQuestions/LOCApp/RVApp/PLApp (+OWApp shelved). Prenatal: script PNNav; object pnviewer; Code Library keys ChartJS/Annotation/PNCApp/PNList; field pnkey.
- All viewers: `"data:text/html;base64," & Base64Encode(calc)`, interaction ON, encode OFF, Allow JS to perform FM scripts ON; boot via JSONSetElement+Base64 with b64u() control-char sanitize.

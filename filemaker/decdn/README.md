# Offline Hardening (de-CDN) — 2026-09-06

## Why
On ~Sep 5 the home internet gateway began half-failing (some connections passed, others
timed out). Every CDN-dependent web viewer in both FileMaker files went blank at once —
obesity patient dashboard, weight-progress chart, outcomes viewer, prenatal weight/BP
chart — while every self-contained viewer (PatientList, PNList, RVApp, PanelDash,
Interview, AVS) kept working. Initial suspicion was FileMaker's WebKit blocking external
fetches from data: URLs; the real cause was the network. A gateway restart fixed the
symptom; this hardening removes the dependency for good.

## What changed (all verified rendering with Wi-Fi off, 2026-09-06)

### Obesity Management.fmp12
| Calc | Change |
|---|---|
| `PtDash_Head` | jsdelivr Chart.js + annotation script tags and Google Fonts link → inlined `Globals::ChartJS_Source` + Code Library `Annotation` (ExecuteSQL); added `<meta charset='utf-8'>`; unchecked "Do not evaluate if all referenced fields are empty" |
| patient dashboard web viewer | address changed to `"data:text/html;base64," & Base64Encode ( PtDash_Head & PtDash_Body & PtDash_Body2 )` |
| `GoogleChart HTML` (weight_progress_calc v3, on 2 layouts) | script tags + font link → inlined `Globals::ChartJS_Source` + `Globals::Annotation_Source` |
| `HTML_Audit` (Data Visualization) | script tag + font link → inlined `Globals::ChartJS_Source` |

New OM Code Library record: `Annotation` (chartjs-plugin-annotation v2.2.1, 34,251 ch —
identical copy of `Globals::Annotation_Source`).

### Prenatal Record.fmp12
`HTMLChartPrenatal2`: jsdelivr script tags + font link → inlined Code Library `ChartJS`
(206,669 ch) + `Annotation` (34,251 ch) via ExecuteSQL. New spare Code Library record
`Highcharts` (v12.6.0, 275,776 ch, from cdn.jsdelivr.net/npm/highcharts@12) — unused by
the live chart (Highcharts appears only in its dead commented-out v1) but banked.

## Library inventory — NEVER DELETE
- OM `Globals::ChartJS_Source` — Chart.js 4.4.9 UMD, 208,521 ch (global storage)
- OM `Globals::Annotation_Source` — chartjs-plugin-annotation 2.2.1, 34,251 ch (global storage)
- OM Code Library `Annotation` — same plugin, 34,251 ch
- PN Code Library `ChartJS` — 206,669 ch; `Annotation` — 34,251 ch; `Highcharts` — 275,776 ch (spare)

## Upgrading a library later
Paste new source into the Globals field / Code Library record (the script
"Load JS Libraries into Persistent Store" can fetch it — that script intentionally
still uses the CDN). Every viewer picks it up at once. Roll back by pasting the old
source back. Fonts: Google Fonts links were removed; CSS `Inter, sans-serif` falls
back to system fonts.

## Not changed (dead code, on no layout)
`GoogleChartHTML` (gstatic loader), `HighChartHTML`, `HighChartHTML2` still contain
CDN references but feed no web viewer.

## Files here
Post-edit calc text reconstructed from the Aug 20 DDR + the exact deployed edits:
- `PtDash_Head_calc.txt`
- `GoogleChartHTML_weight_progress_calc.txt`
- `HTML_Audit_calc.txt`
(Prenatal `HTMLChartPrenatal2_calc.txt` lives in the prenatal-record-filemaker repo.)

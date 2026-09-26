# PtDash — Patient Dashboard (Obesity Management)

Three-part web-viewer dashboard on the patient record. The page is assembled by the
web viewer address:

    "data:text/html;base64," & Base64Encode ( Obesity Management::PtDash_Head & Obesity Management::PtDash_Body & Obesity Management::PtDash_Body2 )

(interaction ON, auto-encode OFF; Base64 + `<meta charset='utf-8'>` since the Sep 6
offline hardening.)

| Segment | File | Role |
|---|---|---|
| `PtDash_Head` v1.9 (de-CDN'd) | `../decdn/PtDash_Head_calc.txt` | CSS + empty HTML shell; inlines Chart.js from `Globals::ChartJS_Source` and the annotation plugin from Code Library `Annotation` |
| `PtDash_Body` v2.3 | `PtDash_Body_calc.txt` | Four per-patient SQL queries + all rendering JS through the vitals card |
| `PtDash_Body2` v2.1 | `PtDash_Body2_calc.txt` | Metabolic card (Labsbefore parser, HOMA-IR/FIB-4 with computed fallbacks) + medications card; pure string, shares Body's JS globals |

The three calcs stay under FileMaker's 30k-per-calculation limit individually
(that limit is why the dashboard is split).

## v2.3 (2026-09-26): HPIHighestWeight — self-reported pre-treatment peak

Mochi transfers often arrive mid-journey; measuring only from `Weightpounds`
(first weight with the practice) understates their progress. When
`Obesity Management::HPIHighestWeight` is filled AND exceeds the starting
weight, four elements appear:

1. Header badge (amber): `peak 285 lbs self-reported`
2. Total-body-wt-loss tile gains a second detail line: `from high of 285: −63.6 lb (22.3%)` — only when the peak also exceeds the CURRENT weight
3. A 5th hero tile "Peak weight" (JS widens the stats grid to 5 columns, so peak-less patients keep the 4-column layout)
4. A dashed orange annotation line on the Weight Trajectory chart at the peak; the y-axis max extends to include it

Blank field, zero/garbage value, or peak ≤ starting weight: every element hides
and the dashboard renders identically to v2.2. Gate: JS `const PEAK` right after
the `PT` object.

Node-tested (26 assertions): peak present / blank / peak≤start / no baseline.

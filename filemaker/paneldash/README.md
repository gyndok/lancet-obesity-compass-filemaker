# PanelDash (FileMaker)

Panel triage dashboard for **Obesity Management.fmp12** (~841 active patients). Three unstored calcs on the **Data Visualization** table (1 record required); viewer = `"data:text/html;base64," & Base64Encode(PanelDash_Head & PanelDash_Body & PanelDash_Body2)`.

| File | FM field | Version in this folder |
|---|---|---|
| `PanelDash_Head_calc.txt` | Data Visualization::PanelDash_Head | v1.0 (CSS + offline Chart.js + DOM shells) |
| `PanelDash_Body_calc.txt` | Data Visualization::PanelDash_Body | v1.0 (panel SQL + compute) |
| `PanelDash_Body2_calc.txt` | Data Visualization::PanelDash_Body2 | v1.0 (render + charts + filter) |
| `HTML_Audit_calc.txt` | Data Visualization::HTML_Audit | weight-loss outcomes viewer (v2) |

**Note:** these mirror the Aug 20, 2026 evening DDR — i.e. what is actually deployed. A v1.1 of Body/Body2 was delivered in-chat but per the DDR was never pasted into FileMaker.

Triage cards: LTFU >122d (red) / amber 91–122d / plateau (on AOM, <2%/8wk ±21d ref, >5% above target) / muscle outliers (<75% fat fraction of tissue loss, ≥5 lb, ≥2 SECA scans) / labs aging (on-AOM, >365d or never). Panorama: %TBWL histogram + AOM doughnut. Filter chips All/WSOC/Mochi. Row links `fmp://$/Obesity%20Management?script=GoToPatient&param=acct` → `GoToPatient` script (in `../returnvisit/scripts/`).

Dependencies: `Globals::ChartJS_Source` (offline Chart.js bundle) for PanelDash; HTML_Audit loads Chart.js from CDN instead.

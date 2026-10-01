# Labsbefore — Doximity Lab-Formatting Template (v2, 2026-10-01)

Workflow: paste a patient's raw lab list into Doximity with this template; paste the
formatted output into `Obesity Management::Labsbefore`. That field feeds TWO parsers:

- `MetabolicFlags` v2.1 (filemaker/MetabolicFlags_calc.txt) — HOMA-IR + FIB-4
- the patient dashboard's Labs & Metabolic card (filemaker/ptdash/PtDash_Body2_calc.txt)

Both split lines on the em dash (Char 8212) and read the leading number after the
second em dash, so the format rules below are load-bearing, not cosmetic.

v2 changes vs the original template: em-dash requirement made explicit (hyphens break
parsing); one space required between value and units ("55 U/L" not "55U/L" — the glued
form caused the FIB-4=0 bug via GetAsNumber("246x10E9")=246109); canonical short names
expanded (Glucose/Insulin/A1c/TSH/lipids — long LOINC names caused missed analytes);
platelets explicitly in thousands scale (246, never 246000).

---

## PROMPT (paste into Doximity as the template)

Create a laboratory report summary that includes abnormal and normal test results. Follow these rules exactly.

LINE FORMAT (every result, one per line, no bullets, no numbering):
<YYYY-MM-DD> — <test_name> — <value> <units> [<normal_range>] (<interpretation>)

- The separator between date, test name, and result must be the em dash character (—), with a space on each side. Never use a hyphen (-) as the separator.
- Begin every line with the collection date in YYYY-MM-DD format, with no other text before it. All tests from the same draw share the same date. If no date is found, leave the date blank but keep both em dashes.
- Put ONE SPACE between the numeric value and its units (write "55 U/L", not "55U/L"; "246 x10E9/L", not "246x10E9/L"). The value must be the first character(s) after the second em dash.
- The (<interpretation>) tag — (High), (Low), (Abnormal) — appears only on abnormal results. Normal results end after the [<normal_range>].

TEST NAMES — use these exact short names instead of the long laboratory names:
- "platelets" for platelet count (report the x10E9/L or x10^3/uL value, e.g. 246 — never the absolute count like 246000)
- "AST" for aspartate aminotransferase / AST (SGOT)
- "ALT" for alanine aminotransferase / ALT (SGPT)
- "Glucose" for serum or plasma glucose (urine glucose must instead be named "Urine Glucose")
- "Insulin" for fasting serum insulin
- "A1c" for hemoglobin A1c
- "TSH" for thyroid stimulating hormone
- "Total Cholesterol", "LDL", "HDL", "Triglycerides" for the lipid panel
- All other tests: use the test name as it appears in the source text.
- Never include the specimen or method description in the test name (no "[Mass/volume] in Serum or Plasma", no "by Automated count").

STRUCTURE:
- First the line "Abnormal results:" followed by each abnormal result on its own line, newest date first. If none, write "None".
- Then the line "Normal results:" followed by each normal result on its own line, newest date first. If none, write "None".
- No additional commentary, explanations, headers, or blank lines.

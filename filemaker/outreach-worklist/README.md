# OutreachWorklist v1.0 — BUILT, NOT DEPLOYED

**Status (2026-08-21):** shelved before installation — outreach is handled well by clinic nurse. Code is complete and node-tested (36 harness assertions + end-to-end boot transport test). Nothing from this folder exists in the FileMaker file. Archived so it's a ~20-minute install if ever wanted.

## What it is

A worklist app (PanelDash architecture) that turns the triage cards into actionable queues: LTFU >122d, Amber 91–122d, Labs aging. Each row expands to phone/email + a pre-composed warm outreach message (Mochi reply-with-a-weight + video-visit variant, WSOC call-the-office variant, labs-reminder variant; age≥60 muscle line), with Copy and Mark-contacted buttons. Contacted patients drop out and never auto-reflag — they reappear only when a new weigh-in/visit resets the comparison. Names link to charts via GoToPatient.

## Install steps (if revived)

1. **Fields on Obesity Management:** `LastOutreach` (Date), `OutreachLog` (Text).
2. **Code Library record:** Name = `OWApp`, Source = contents of `OWApp_source.txt` (verify tail: `var OW_APP_VERSION="1.0";`).
3. **Calc field on Data Visualization:** `OutreachWorklist_Full`, Text, unstored = contents of `OutreachWorklist_Full_calc.txt`. (After step 1.)
4. **Script `MarkOutreach`:** steps in `MarkOutreach_script.txt`.
5. **Layout "Outreach"** on Data Visualization; web viewer object named `owviewer`; address `"data:text/html;base64," & Base64Encode ( Data Visualization::OutreachWorklist_Full )`; interaction ON, encode OFF, Allow JS to perform FM scripts ON.

Undo a mistaken mark-contacted by clearing `OM::LastOutreach` on the patient.

## Design notes

- Boot: JSONSetElement + Base64, b64u() with control-char sanitize (house rules).
- q1 puts Prescription LAST in the row so multi-line checkbox values can only truncate the tail; JS tail-joins.
- Labs queue uses the Labs table only (matches deployed PanelDash v1.0; the Labsbefore ISO-scan merge was a v1.1 feature that was never deployed).
- Future lighter variant if nurse workflow wants it: a printable call-list report from the same queues, no app.

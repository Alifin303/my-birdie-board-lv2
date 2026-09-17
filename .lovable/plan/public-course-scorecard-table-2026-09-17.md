# Public course scorecard table

## Goal
Replace the per-hole card grid on course pages with the same front-nine/back-nine table structure used in the app, without changing course-page content or behavior.

## Changes
- Reuse the in-app scorecard table visual language: section labels, borders, spacing, and par badges.
- For complete hole-par data, render Hole, Par, and editable Score rows with a Total column for each nine.
- Keep the live overall score and score-to-par summary above the table.
- Keep the existing simple score-entry fallback when complete per-hole pars are unavailable.
- Do not add Stableford points.

## Verification
- Check 18-hole and 9-hole layouts at desktop and mobile widths.
- Confirm section totals and overall totals update as scores are entered.
- Confirm courses missing complete hole pars still use the simple layout.

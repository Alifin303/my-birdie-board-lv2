# Mobile handicap calculation dialog

## Goal
Make “Show Handicap Calculation” easy to read and use on phones without changing its desktop information or calculation logic.

## Changes
- Present the dialog as a near-full-screen mobile sheet with a fixed-height scroll area, safe spacing around the close control, and left-aligned headings.
- Keep the existing table on tablet and desktop.
- Replace the horizontally scrolling table on phones with compact round cards showing date, course, tee, score, rating/slope, differential, and counting status.
- Stack the summary and legend cleanly on narrow screens while retaining the existing theme and dark-mode support.

## Validation
- Check the dialog at a phone viewport and desktop viewport.
- Confirm all calculation details remain visible and the dialog closes and scrolls correctly.

# Interactive course pages, cleaner directory, and display names

## Change 1 — Interactive scorecard on every course page

- Keep the existing course name, location, holes, par, aggregate-stat threshold, explanatory copy, and sign-up section unchanged.
- Add a scorecard beneath the course facts for courses with a known hole count.
- Render every hole label and score input in the page’s initial pre-rendered HTML, using the stored course hole count and displaying the stored course par alongside the scorecard.
- Update the total immediately as scores are entered.
- Keep the scorecard anonymous and browser-only; entered scores will not be saved or transferred during sign-up.
- Reveal a “Want to save this round and track your progress? Sign up free” link to `/get-started` only after at least one valid score is entered.
- If a course has no known hole count, retain its existing facts and content without inventing a scorecard layout.

## Change 2 — Improve the `/courses` directory

- Remove the “X rounds played” line from every directory card.
- Keep every course card linked to its individual page in the initial HTML so the directory remains live, indexable, and useful for discovery.
- Add a positive line near the introduction: “Don’t see your course? Add it in seconds when you log your first round,” linking to `/get-started`.
- Refresh the directory description so it no longer promises exposed historical scores or player statistics.

## Change 3 — Clean course display names conservatively

Apply one shared display-name helper to course headings, metadata, structured data, calls to action, breadcrumbs, and directory listings. Database values and IDs remain untouched.

Rules:
1. Remove numeric source IDs in parentheses.
2. Remove the text after a dash only when it repeats the full club/course name or is a shortened location/name already contained in the main name.
3. Preserve suffixes that distinguish a specific layout, course, routing, or edition.

Proposed examples:

- `Basildon Golf Club (1001028) - Basildon` → `Basildon Golf Club`
- `Augusta Ranch Golf Club - Augusta Ranch Golf Club` → `Augusta Ranch Golf Club`
- `Bentley Golf Club (1001419) - Bentley` → `Bentley Golf Club`
- `The Rayleigh Club (1010498) - East Course` → `The Rayleigh Club - East Course`
- `The Rayleigh Club (1010498) - The South Course` → `The Rayleigh Club - The South Course`
- `Belton Woods Hotel (1005124) - The Lakes` → `Belton Woods Hotel - The Lakes`
- `Branston Golf & Country Club (1002373) - Eagle/Academy Course` → `Branston Golf & Country Club - Eagle/Academy Course`
- `Torrey Pines Municipal Golf Course - North` → unchanged

Potentially ambiguous names will keep their suffix by default rather than risk merging distinct courses.

## Validation

- Confirm the course facts and scorecard labels exist before JavaScript runs.
- Confirm score entry updates the running total and reveals the sign-up prompt only after engagement.
- Confirm the directory contains no round-count labels and still links to every course.
- Confirm clean names appear consistently in visible content and metadata without changing source data.
- Check desktop and mobile layouts and resolve the current course-page hydration mismatch without weakening pre-rendering.

# Fix bucket-list course popup

## Changes

- Keep the dashboard map beneath dialogs by isolating its stacking layer, so Leaflet tiles and controls cannot cover the “Add a course” popup.
- Build each API search result’s display name from both the club and course names when they differ (for example, “Hidden Creek Golf Club - Links”), rather than displaying only the matched course-name fragment.
- Carry that same complete name into the bucket-list save path so the search result, confirmation, and saved entry stay consistent.

## Verification

- Check a desktop dashboard with the map visible and confirm the popup remains fully above the map.
- Search for “links” and confirm distinct full course names appear rather than every result displaying only “Links”.
- Confirm the project compiles cleanly after the changes.

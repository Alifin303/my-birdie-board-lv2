# Golf Bucket List + prominent course map

## 1. Bucket list data

New private table `bucket_list` (user_id, course_id, added_at) with a unique pair so a course can only be added once. Access rules: each person can view, add and remove only their own entries. No public access, no shared page.

Because the course search returns courses that may not yet exist in the database (API results), adding to the bucket list first creates/looks up the course record using the same helper the round logger uses, then stores the bucket-list row.

## 2. Bucket list on the dashboard

A new "Bucket List" section under "Your Courses":

- "Add a course" opens the existing course search (same component used when logging a round) in a dialog, with a single "Add to Bucket List" action per result.
- Lists saved courses with clean display names and location, each with a remove option.
- Played courses never show here; bucket-list courses never show in "Your Courses".

## 3. Auto cross-off when played

After a round saves successfully, if that course was on the bucket list it is deleted from it automatically and a celebratory dialog appears: "Crossed off your bucket list: [Course Name]!" This reuses the existing milestone share card — the same dialog and image generator, given a bucket-list milestone object — so there is no second sharing mechanism. Sharing stays entirely user-initiated.

## 4. Map: pin colours, legend, placement

- Blue pins = courses played (existing behaviour, colour applied).
- Red pins = bucket-list courses not yet played.
- A course moves red → blue automatically once played; it is the same single pin, never duplicated, because played courses are excluded from the bucket-list set.
- A small legend sits directly under the map.
- Coordinates for bucket-list courses are resolved the same way as played ones (stored location first, then the existing lookup service).

## 5. Map prominence

The map moves out of the small "View Map" button and becomes its own full-width panel on the dashboard, placed after the leaderboard section and above "Your Courses", with a heading and the legend. The button next to "Your Courses" is removed.

## Technical notes

- Migration: `public.bucket_list` with grants for `authenticated`/`service_role`, RLS scoped to `auth.uid()`, unique `(user_id, course_id)`, FK to `public.courses`.
- `CoursesPlayedMap.tsx` refactored into an inline `CoursesMapPanel` (dashboard-embedded, lazy-loaded, client-only) taking played + bucket courses; coloured `L.divIcon` markers.
- New `src/hooks/use-bucket-list.tsx` (react-query: list, add, remove) and `src/components/dashboard/BucketList.tsx` + `AddToBucketListDialog.tsx`.
- Cross-off hook runs in `saveRoundHandler` after insert; `ShareMilestoneDialog` accepts a synthesised `Milestone` of a new `bucket_list` type (icon + label added to `milestonesCalculator`).
- Existing course-name cleanup (`courseDisplayName`) used on every surface.

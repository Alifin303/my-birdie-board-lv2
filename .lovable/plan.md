## Goal
Add a "View Map" button on the dashboard that opens a map with a pin on every course the user has played a round at.

## Answers to your questions

**1. Free map API?** Yes — **Leaflet + OpenStreetMap tiles** is the standard free option: no API key, no billing, no quota for normal app usage, MIT licensed. It's what we should use. (Google Maps / Mapbox would need an account + key and start charging at volume — overkill here.)

**2. Does the Golf Course API give us coordinates?** Yes — better than a postcode. Every course detail response includes `location.latitude` and `location.longitude` (plus `address`, `city`, `state`, `country`). So for any API-sourced course we can store exact lat/lng directly and skip geocoding entirely.

**3. User-added courses?** We do need a way to locate them. Rather than a postcode field (which would still require geocoding), the cleanest UX is: on the manual course form, let the user **search an address / drop a pin on a small map** and we store `latitude` + `longitude` directly. Postcode alone is fine as a fallback but less accurate (especially in the US where ZIPs cover wide areas) and forces us to run a geocoder.

## Plan

### 1. Database
Add `latitude` and `longitude` (numeric, nullable) to `public.courses`. Migration only — no data movement.

### 2. Backfill existing courses
- Extend the `golf-course-api` edge function (or a small one-off script) so when we fetch a course we persist `latitude`/`longitude` into `courses`.
- For the ~existing courses already in the DB without coords, run a one-off backfill that re-fetches each by `api_course_id` and writes the coords. Anything that can't be resolved stays null and just won't appear on the map.

### 3. Capture coords on new courses
- **API-sourced courses:** when saved, write `latitude`/`longitude` from the API response (already in `CourseDataService`).
- **User-added courses:** add an address search box + draggable pin to `ManualCourseForm` (Leaflet + Nominatim search, both free). Store the resulting lat/lng. No postcode field needed.

### 4. Map UI
- New component `src/components/dashboard/CoursesPlayedMap.tsx` using `react-leaflet` + `leaflet`.
- Trigger: a "View Map" button next to the "Your Courses" heading on the dashboard.
- Opens a Dialog containing the map: one marker per distinct course the user has played, popup shows course name, club, city, and rounds played, click → existing course detail flow.
- Auto-fit bounds to the user's pins; empty state if no coords resolved.

### 5. SSR / perf
Leaflet touches `window`, so the map component is dynamically imported and rendered client-side only (consistent with our existing SSR guards). Dialog is lazy-loaded so the dashboard bundle is unaffected for users who never open it.

## Technical notes
- Packages: `leaflet`, `react-leaflet`, `@types/leaflet`. Tiles from `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` with the required OSM attribution string.
- Nominatim usage policy: include a descriptive `User-Agent`/`Referer`, debounce input (≥1 req/sec), cache results — fine for our scale.
- Coords are non-sensitive public data; no RLS changes needed beyond existing `courses` policies.

## Out of scope (for now)
- Heatmaps / clustering (can add `leaflet.markercluster` later if a user has 50+ courses).
- Showing other users' courses on the map.
- A public "all courses" map.

Want me to proceed with this, or would you prefer a postcode field on manual courses instead of the pin-drop UX?
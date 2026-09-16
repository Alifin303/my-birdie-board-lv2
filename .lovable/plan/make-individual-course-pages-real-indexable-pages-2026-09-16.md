# Make individual course pages real, indexable pages

Today each `/courses/40`-style page is built as an empty shell: the course name and location only appear after the browser runs JavaScript, the page tells Google it is a copy of the homepage, and (oddly) real visitors are bounced back to the homepage after a moment. This fixes all of that.

## What changes for visitors

Each course page will show, straight away:

- Course name as the page heading, with city/region underneath
- Number of holes and par, when we hold that data for the course
- A "Log a round at [Course Name]" button that goes to sign-up
- An average-score block, but only once a course has 15 or more logged rounds

No individual golfer's name, score, or scorecard appears on these pages — course facts only.

Visitors will no longer be redirected away from a course page to the homepage.

## What changes for search engines

- Each page gets its own title: "[Course Name] — Scorecard & Golf Stats | MyBirdieBoard"
- Its own description: "Track your rounds at [Course Name]. See course details and log your scores with MyBirdieBoard's free golf tracker."
- Its own canonical address pointing at itself, replacing the current homepage canonical
- Course facts baked into the page's HTML before any JavaScript runs
- All 98 course pages added to the sitemap (regenerating automatically as courses are added)

The `/courses` index already links to every course page, so navigation discovery is already in place — I'll confirm it after the change.

## Technical approach

The site is pre-rendered at build time (vite-react-ssg), so course data must exist at build time.

1. **Build-time snapshot** — new `src/data/generate-courses-data.ts` script + `src/data/courses-static.json`. The script queries Supabase for every course (id, name, city, state), its tees (par, hole count via `course_holes`), and its round count, and writes the JSON. Run as part of the build so it stays current.
2. **Dynamic prerender routes** — `vite.config.ts` reads the snapshot and appends `/courses/<id>` for every course to `prerenderRoutes`, so each gets its own static HTML file. The sitemap plugin already derives from that list, so course URLs flow through automatically (priority 0.5, changefreq weekly).
3. **Per-course meta** — `src/lib/route-seo-map.ts` gains a fallback that recognises `/courses/<id>` and generates title, description, canonical and OG tags from the snapshot. This is the same injection hook that already fixes meta for other routes, so the wrong homepage canonical disappears.
4. **Course page rewrite** — `src/pages/Course.tsx` renders from the snapshot synchronously on first paint (so the HTML contains real content), then refreshes live data from Supabase on the client. The bot-sniffing redirect and the `<Navigate to="/" />` behaviour are removed. Adds GolfCourse JSON-LD with name, address and geo.
5. **Aggregate stat** — average gross score is computed in the snapshot (and live on the client) but only rendered when `roundsCount >= 15`.
6. **Edge-function sitemap** — `supabase/functions/sitemap/index.ts` also lists course URLs, fetched live from the database, so it matches the static one.

Note: the snapshot is refreshed at each build/publish, so a course added today appears in pre-rendered HTML after the next publish; before then it still renders correctly client-side.

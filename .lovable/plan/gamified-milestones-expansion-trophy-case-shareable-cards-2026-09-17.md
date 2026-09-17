# Gamified Milestones: Expansion, Trophy Case & Shareable Cards

All of this runs off data already in your account (rounds, hole scores, putts, penalties, greens in regulation, Stableford points, handicap history). No new data collection, no new services.

## What already exists today

Milestones already awarded: birdies (1, 5, 10 … 500), eagles, hole-in-ones, rounds played (1, 5, 10, 25, 50, 100, 250, 500), courses played (1, 5, 10, 25, 50, 100), breaking 120/110/100/90/80/70, new personal-best round score, Stableford totals (20, 25, 30, 32, 34, 36, 38, 40), first handicap, and each handicap improvement.

So "played 5 / 10 / 25 / 50 courses" and "first handicap" are already covered — I'll keep those and not duplicate them.

## 1. New milestones to add (please review this list)

**Course / passport**
- Course conquered — beat your own previous best score at a course you've played before (fires each time it happens, named per course)
- Home course — played the same course 5 times
- Home course regular — played the same course 10 / 25 times

**Handicap**
- Single digits — handicap drops below 10
- Milestone handicaps — first time under 20, under 15, under 10, under 5
- Five strokes better — handicap improved by 5+ since your first calculated handicap (also 10+)
- Lowest ever handicap — new personal best, each time it happens (replaces the current noisier "any improvement" entry, which fires on every small drop)

**Stats**
- Putting machine — first round under 30 putts, then under 28, 26, 24
- Clean card — first round with zero penalty strokes
- Greens in regulation — personal best GIR count in a round (each time it improves)
- Stableford best — personal best points total in a round (each time it improves)

**Small correction:** the current "Broke 90" style milestones only count 18-hole rounds; I'll keep that rule so 9-hole rounds don't trigger them falsely.

## 2. Round-4 progress nudge

On the dashboard, when a free user has exactly 4 rounds logged, show an achievement-style card instead of a plain limit warning:

> **One more round to unlock your official handicap** — Log round 5 and MyBirdieBoard calculates your WHS handicap index automatically. Start your 30-day free Pro trial to keep going.

With a progress bar (4 of 5) and a button to the Pro trial, matching how the pricing page explains the 5-round rule. Hidden for Pro/complimentary users and for anyone with 5+ rounds.

## 3. Trophy case page

New page at `/milestones`, linked from the dashboard (the existing "View Milestones" button will point here; the quick dialog stays for a fast peek).

- Header with counts: "23 of 74 unlocked"
- Filter tabs by category (same categories as today, plus the new ones)
- **Unlocked** cards: icon, title, description, date achieved, and a "Share" button
- **Locked** cards: greyed silhouette icon, title, and a progress hint — "Play 3 more courses to unlock", "2 more birdies", "Get your handicap under 10" — with a small progress bar where a count applies
- Locked milestones are computed from the same definitions, so the next target is always the nearest unreached tier

## 4. Shareable milestone card

A "Share" button on any unlocked milestone opens a preview of a square card — milestone icon, title, the value ("New personal best handicap: 14.2"), date, and MyBirdieBoard branding — rendered to an image in the browser via canvas.

Two actions: **Download image** and, where the device supports it, **Share** (the native share sheet). Nothing is posted anywhere, nothing is made public, no feed, no default sharing — the image only exists when the user presses the button, and it only goes where they send it.

## Technical notes

- `src/utils/milestonesCalculator.ts` is refactored into milestone *definitions* (id, type, title, target, progress function) so both unlocked and locked states come from one source; existing exports (`calculateMilestones`, `getRecentMilestones`, `getMilestonesByType`, icons/labels) keep working for `MilestonesDialog`.
- New: `getMilestoneProgress(rounds, profileHandicap)` returning unlocked + locked-with-progress.
- New files: `src/pages/Milestones.tsx`, `src/components/milestones/MilestoneCard.tsx`, `src/components/milestones/ShareMilestoneDialog.tsx`, `src/components/dashboard/HandicapUnlockNudge.tsx`.
- Route registered in `src/routes.tsx` with `noindex` (private data), so it stays out of the sitemap and prerender list.
- Putts / penalties / GIR are read from `hole_scores` on each round; rounds without that detail simply don't count toward those milestones.
- Canvas rendering is guarded for SSR and drawn at 2x for retina.

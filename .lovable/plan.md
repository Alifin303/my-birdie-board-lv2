# Four page fixes — proposed diffs

## 1. Pricing FAQ only

The pricing page uses the shared Radix accordion, while `/faq` uses native `<details>` elements. Replace only the pricing instance with the proven native pattern, and align its FAQ data to the six questions requested. Because the same `faqs` array feeds JSON-LD, the six full answers remain synchronized between visible page content and FAQ schema.

```diff
--- a/src/pages/Pricing.tsx
+++ b/src/pages/Pricing.tsx
@@
-import {
-  Accordion,
-  AccordionContent,
-  AccordionItem,
-  AccordionTrigger,
-} from "@/components/ui/accordion";
@@
-  const faqs = [ eight entries ... ];
+  const faqs = [
+    { q: "What's the difference between Free and Pro?", a: "Free is a 4-round account ..." },
+    { q: "Why does the free plan cap at 4 rounds?", a: "Four rounds is enough ..." },
+    { q: "Can I cancel any time?", a: "Yes. Pro is a rolling monthly subscription ..." },
+    { q: "Do I need to use my phone on the course?", a: "No. MyBirdieBoard is designed for post-round entry ..." },
+    { q: "What happens to my rounds if I don't upgrade?", a: "Nothing is deleted ..." },
+    { q: "What payment methods do you accept?", a: "We accept all major cards via Stripe ..." },
+  ];
@@
-<Accordion type="single" collapsible className="w-full">
+<div className="w-full">
   {faqs.map((f, i) => (
-    <AccordionItem key={i} value={`item-${i}`}>
-      <AccordionTrigger>{f.q}</AccordionTrigger>
-      <AccordionContent>{f.a}</AccordionContent>
-    </AccordionItem>
+    <details key={f.q} className="group border-b border-border last:border-b-0">
+      <summary className="flex cursor-pointer ...">
+        <span>{f.q}</span><ChevronDown ... />
+      </summary>
+      <div className="pb-6 text-muted-foreground">{f.a}</div>
+    </details>
   ))}
-</Accordion>
+</div>
```

Verification: inspect pre-rendered `/pricing` HTML and browser DOM to confirm all six question and answer strings exist before any click.

## 2. Courses directory display

The requested prompt, absence of round counts, and shared cleanup helper are already present in the current source but are not yet reflected on the published site. Make the directory-specific data mapping explicit so both static and refreshed course records are cleaned before rendering; retain the existing indexable links and prompt.

```diff
--- a/src/pages/Courses.tsx
+++ b/src/pages/Courses.tsx
@@
 interface Course {
   id: number;
-  name: string;
+  displayName: string;
@@
-  name: c.name,
+  displayName: courseDisplayName(c.name),
@@
-  name: c.name,
+  displayName: courseDisplayName(c.name),
@@
-<h2>{courseDisplayName(course.name)}</h2>
+<h2>{course.displayName}</h2>
```

Already present and retained:

```text
Don't see your course? Add it in seconds when you log your first round.
```

No `roundsCount` field or “X rounds played” element remains in this page source. Examples after publish:

```text
Basildon Golf Club (1001028) - Basildon  →  Basildon Golf Club
Cranham Golf Course [User added course]  →  Cranham Golf Course
The Rayleigh Club (1010498) - East Course  →  The Rayleigh Club - East Course
```

## 3. Shared golfer count on homepage and pricing

`/get-started` currently hard-codes “1,000+”; it does not query a live service. Create one shared content constant and use it on all three pages so the approved figure cannot drift between them.

```diff
+++ b/src/lib/site-stats.ts
+export const GOLFER_COUNT_LABEL = "1,000+";

--- a/src/pages/GetStarted.tsx
+++ b/src/pages/GetStarted.tsx
+import { GOLFER_COUNT_LABEL } from "@/lib/site-stats";
-Trusted by 1,000+ golfers
+Trusted by {GOLFER_COUNT_LABEL} golfers
-Join 1,000+ golfers who are tracking ...
+Join {GOLFER_COUNT_LABEL} golfers who are tracking ...

--- a/src/components/MainContent.tsx
+++ b/src/components/MainContent.tsx
+import { GOLFER_COUNT_LABEL } from "@/lib/site-stats";
-Join golfers using MyBirdieBoard as their go-to ...
+Join {GOLFER_COUNT_LABEL} golfers using MyBirdieBoard as their go-to ...

--- a/src/pages/Pricing.tsx
+++ b/src/pages/Pricing.tsx
+import { GOLFER_COUNT_LABEL } from "@/lib/site-stats";
-Join golfers using MyBirdieBoard to log rounds ...
+Join {GOLFER_COUNT_LABEL} golfers using MyBirdieBoard to log rounds ...
```

## 4. Remove stale years from Best Golf Score Apps

The homepage card still contains 2024. The comparison page source is already yearless even though the published title still shows 2025; make its intended yearless title shorter and explicit in both runtime and pre-rendered metadata.

```diff
--- a/src/components/GolfResourcesSection.tsx
+++ b/src/components/GolfResourcesSection.tsx
- description: "Compare the top golf score tracking apps of 2024",
+ description: "Compare the top golf score tracking apps",

--- a/src/pages/compare/BestGolfScoreTrackingApps.tsx
+++ b/src/pages/compare/BestGolfScoreTrackingApps.tsx
- title="Best Golf Score Tracking Apps (And Which One Is Right for You) | MyBirdieBoard"
+ title="Best Golf Score Apps | MyBirdieBoard"

--- a/src/lib/route-seo-map.ts
+++ b/src/lib/route-seo-map.ts
- title: 'Best Golf Score Tracking Apps (And Which One Is Right for You) | MyBirdieBoard',
+ title: 'Best Golf Score Apps | MyBirdieBoard',
```

## Final checks

- Type-check the changed files.
- Confirm `/pricing` initially contains all six full answers and that each accordion opens normally.
- Confirm `/courses` contains clean names, no round-count labels, the `/get-started` prompt, and links to individual courses.
- Confirm homepage and pricing both show “1,000+ golfers”.
- Confirm homepage resource copy and comparison-page title contain no year.
- Publishing is required for the currently stale live pages to update.

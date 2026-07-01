## SEO Improvement Plan

Here's how I'd tackle the review, grouped by what I can build vs. what's off-platform (outreach). I'll focus on the code changes we can ship immediately.

### 1. Fix critical on-page issues

**Homepage H1/H2 duplication**
- In `src/pages/Index.tsx`, keep the H1 as-is and replace the duplicate H2 with a supporting subheadline (e.g. *"Log rounds after you play, track your handicap, and see your game improve — no GPS, no distractions."*).

**Add structured data (schema markup)**
- Add `FAQPage` JSON-LD to the homepage FAQ accordion (mirrors the visible Q&As).
- Add `SoftwareApplication` JSON-LD to the homepage with price (£2.99), category, and — if we're comfortable — an `aggregateRating` block. I'll flag this and ask before adding ratings we can't substantiate.
- The blog posts already use `Article` schema via `GuideLayout`; I'll audit and confirm.

**Refresh stale 2024 references**
- Rename "Best Golf Score Apps 2024" → "Best Golf Score Apps 2026" across title, H1, meta, and body copy in `src/pages/guides/BestGolfScoreApps.tsx` and any internal links / SEO map entries.
- Grep the codebase for other lingering "2024/2025" references in titles and update.

### 2. Quick wins

**New `/pricing` page**
- Create `src/pages/Pricing.tsx` with Free vs Pro (£2.99/mo) comparison, FAQ, and CTAs. Add to `SiteHeader`, `SiteFooter`, `routes.tsx`, `route-seo-map.ts`, and the sitemap generator.

**Expand site navigation**
- Update `src/components/SiteHeader.tsx` to include: Features (anchor to homepage section or new page), Pricing, Blog, Guides, About — plus Log In. Mobile: collapse into a sheet menu.

**Social proof tightening**
- Replace "1,000+ golfers" on the homepage with a more specific, defensible line. I'll propose 2–3 options for you to pick from before shipping (e.g. rounds logged, countries, etc.).
- Testimonials: I can restructure the component to support photo + full name + specific metric fields, but I'll need you to supply real testimonials. In the meantime I'll reduce from 6 generic ones to 2–3 stronger ones, or hide the section until we have real quotes — your call.

**Off-brand blog post**
- Retire `BestGolfClubsBeginners.tsx`: 301 redirect to a replacement post more aligned with tracking (e.g. *"How to Drop 5 Shots Off Your Handicap Using Stats"*) via `_redirects`, and remove from the blog index + sitemap.

### 3. Longer-term traffic growth (code)

**"How to improve your golf handicap" cluster**
- New blog post: *"How to Drop 5 Shots Off Your Handicap in One Season"* with internal links to the handicap calculator and stats guides.
- Follow-up ideas (write later): *"7 Stats That Predict Handicap Improvement"*, *"Handicap Plateau: Why You're Stuck and How to Break Through"*.

**Handicap calculator page**
- Already built at `/tools/handicap-calculator`. I'll double-check it's in the main nav / footer / sitemap and linked prominently from the homepage so it acts as the link magnet the reviewer described.

### 4. Off-platform (no code — for your action)

- Outreach to Golf Insider, Wicked Smart Golf, MyGolfSpy, etc. for inclusion in 2026 roundups.
- Reddit r/golf, Golf Monthly UK contributor pitches, HARO responses.
- Collect real testimonials with photos + specific handicap improvements.

---

### Questions before I build

1. **Testimonials**: reduce to fewer generic ones for now, or hide the section entirely until you supply real quotes?
2. **Social proof number**: got a real metric I can use (total rounds logged, sign-ups, countries), or should I pick something conservative and defensible?
3. **`SoftwareApplication` schema**: OK to include an `aggregateRating` with a plausible early-stage rating, or leave it out until we have real reviews? (Google can penalise fabricated ratings — I'd recommend leaving it out.)
4. **Off-brand blog post**: redirect `BestGolfClubsBeginners` to a new handicap-improvement post, or just remove it?

Once you answer those I'll implement in a single build pass.
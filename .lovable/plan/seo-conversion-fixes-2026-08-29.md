# SEO + conversion fixes

## 1. Accordion answers in the initial DOM (site-wide)

Current state: `/faq` was already converted to native `<details>`/`<summary>`, so its answers are in the HTML. The shared Radix accordion (`src/components/ui/accordion.tsx`) still unmounts closed content, and it is used on **/pricing** (`src/pages/Pricing.tsx`) and the **homepage FAQ section** (`src/components/HomepageSEOSections.tsx`).

Change: rewrite `AccordionContent` to always render its children with `forceMount`, hiding the closed state with CSS (grid-rows/opacity transition) instead of unmounting.

```diff
 const AccordionContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
   <AccordionPrimitive.Content
     ref={ref}
+    forceMount
-    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
+    className="overflow-hidden text-sm grid transition-all duration-200
+               data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0
+               data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100"
   >
-    <div className={cn("pb-4 pt-0", className)}>{children}</div>
+    <div className="min-h-0 overflow-hidden">
+      <div className={cn("pb-4 pt-0", className)}>{children}</div>
+    </div>
   </AccordionPrimitive.Content>
 ))
```

This one edit covers every instance (pricing FAQ, homepage FAQ, and any other accordion). `/faq` already renders in the DOM via `<details>`. I'll verify all three pages with a headless browser check of the server-rendered HTML.

## 2. FAQPage schema on /faq

Already present: `src/pages/FAQ.tsx` builds FAQPage JSON-LD from the same `faqItems` array that renders the visible answers, so the text matches exactly. Once the answer copy in section 3 changes, the schema updates automatically. No structural change needed — I'll re-verify the built HTML contains 11 `Question` entries.

## 3. Honest free / trial / paywall messaging

The model to describe everywhere:
- Free account, no card. 4 rounds or fewer: always viewable, forever.
- Adding a 5th round means an active Pro subscription (£2.99/mo) is required to view **any** rounds — including the original 4.
- 30-day free Pro trial lets you add round 5+ and see your handicap with no charge during the trial.

Files and edits:
- **`src/pages/Pricing.tsx`** — rewrite feature lists, add a prominent callout box under the plan cards ("What happens when you add a 5th round"), and rewrite the pricing FAQ answers (trial length, what happens if you don't upgrade, what happens if you cancel). Product/FAQ JSON-LD on the page is generated from the same copy, so it stays in sync.
- **`src/components/add-round/AddRoundModal.tsx`** — add an unmissable notice shown *before* the 5th round is saved: a warning panel on the limit dialog stating that with 5+ rounds an active subscription is required to view all round history, including the first 4. Copy also updated to reference the 30-day trial.
- **`src/pages/Checkout.tsx`** — add the same one-line disclosure above the trial CTA.
- **`src/pages/FAQ.tsx`** — rewrite Q5 ("How much does MyBirdieBoard cost?") and Q9 ("Can I cancel my subscription?"), and add nothing new, so the 11-item schema stays at 11 items with accurate text.
- **`src/pages/GetStarted.tsx`** — align the free/upgrade copy with the same wording.

### Decision needed: testimonials

`src/components/UserReviews.tsx` holds 6 quotes (James R., Sarah L., Tom B., Mark T., Rachel D., Chris M.). They read as placeholder marketing copy with generic initials and round-number dates — I have no record in the codebase of them coming from real users, and they also power `Review`/`aggregateRating` schema.

Options for Rachel D.:
- (a) Change "7-day free trial" to "30-day free trial" — smallest edit.
- (b) Replace the quote with one that doesn't mention a trial at all.

Tell me which, and confirm whether these are real quotes. If they're placeholders, I'd also recommend removing the review `aggregateRating` schema, since fabricated review markup is a Google policy violation.

## 4. Demo CTA prominence

`src/components/MainContent.tsx` hero: the "See How It Works" button is `variant="outline"` with `bg-white/10` and a `text-right` class that misaligns it. Change to a solid high-contrast secondary button (white background, primary text), matching the primary CTA's size/padding, centred content, full width on mobile. Same treatment for the "Try Demo" button in the lower CTA strip.

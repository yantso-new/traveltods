# UX Updates — 09/03/26

## Critical

- [ ] **Broken mobile navigation** — Wire hamburger menu open/close state in `components/Navbar.tsx`. Currently non-functional; mobile users can't navigate beyond the hero.
- [ ] **Destination data mismatch** — Hero quick-select buttons (Barcelona, Lisbon, Tossa de Mar) don't match actual destination database (Tokyo, Copenhagen, Singapore, etc.). Update `components/Hero.tsx` to reference real destinations.
- [ ] **Search with no feedback** — After selecting a destination in the autocomplete, there's no visible affordance (loading state, navigation indicator) to communicate what happens next. `components/DestinationAutocomplete.tsx`
- [ ] **Dead "About" nav link** — Navbar links to `/about` but no route exists. Remove or create the page. `components/Navbar.tsx`

## High Impact

- [ ] **No filtering on destination grid** — Homepage destination grid has no filter by country, score range, or type. Blog has category tabs; destinations need the same. `app/page.tsx`
- [ ] **Family Score has no explanation** — The 0–10 score and progress bar metrics show no tooltip or explainer. Add "How is this scored?" inline tooltip. `app/destination/[id]/page.tsx`
- [ ] **Radar chart + progress bars are redundant** — Both show the same 7 metrics on the destination detail page. Reframe: radar = overview, bars = detailed breakdown with distinct section headings. `app/destination/[id]/page.tsx`
- [ ] **No back navigation on detail pages** — `/destination/[id]` and `/blog/[slug]` have no breadcrumb or back button. Users arriving via external links are stranded. Add breadcrumb to both.
- [ ] **WaitlistModal value proposition is weak** — No social proof, no concrete member benefit stated, CTA label inconsistency ("Join Pioneers" vs "Join Community"). `components/WaitlistModal.tsx`
- [ ] **Loading states cause layout instability** — Destination detail loads in stages (metadata → score → activities), causing visible layout shifts. Replace with skeleton layout that reserves space. `app/destination/[id]/page.tsx`

## Medium

- [ ] **No empty state on homepage grid** — If Convex returns no destinations, the grid silently shows nothing. Add an empty/error state. `app/page.tsx`
- [ ] **Activities section lacks context** — Viator cards appear without framing. Add a callout like "Hand-picked for under-10s in [Destination]" to increase trust. `app/destination/[id]/page.tsx`
- [ ] **Blog → Destination cross-linking missing** — Blog posts reference destinations but don't link to `/destination/[id]`. Missed conversion path. `app/blog/[slug]/page.tsx`
- [ ] **No save/compare feature** — Users can't shortlist or compare destinations. Implement lightweight local-storage favourites as a first step.

## Accessibility

- [ ] **Hamburger button missing `aria-expanded`** — Screen readers can't announce menu open/close state. `components/Navbar.tsx`
- [ ] **Search icon button has no `aria-label`** — Icon-only interactive element is inaccessible. `components/Navbar.tsx`
- [ ] **`text-sub-light` contrast** — `#636e72` on `#FFFDF9` may fall below WCAG AA. Verify and adjust in `app/globals.css`.
- [ ] **Modal focus trap incomplete** — Tab key cycles to elements behind the WaitlistModal. Implement proper focus trapping. `components/WaitlistModal.tsx`

## Quick Wins

- [ ] Wire hamburger menu — `components/Navbar.tsx` (~30 min)
- [ ] Fix hero quick-select to real destinations — `components/Hero.tsx` (~10 min)
- [ ] Add breadcrumb to detail pages — `app/destination/[id]/page.tsx`, `app/blog/[slug]/page.tsx` (~15 min)
- [ ] Add tooltip to Family Score — `app/destination/[id]/page.tsx` (~20 min)
- [ ] Add social proof count to WaitlistModal — `components/WaitlistModal.tsx` (~15 min)
- [ ] Add `aria-label` to icon-only buttons — `components/Navbar.tsx` (~15 min)

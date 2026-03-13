

# Fix Date Scroll Bugs

## Issues Found
1. **Scroll hint arrow overlaps content** — The arrow (`right-3`) sits directly on top of the last visible date card ("Mon 16"), making it hard to tap that card and looking cluttered.
2. **AnimatePresence ref warning** — Console still shows "Function components cannot be given refs" from `AnimatePresence` in `Appointment.tsx`. The sparkle burst at line 325 wraps a `motion.div` that contains child `motion.div`s — this is fine. The likely culprit is the `AnimatePresence` blocks around the scroll hint (line 514) or other conditional renders where the direct child might not have a proper key or is a functional component.
3. **RTL scroll fade init** — `showRightFade` defaults to `true` but the actual overflow state isn't checked until after render, so on very wide screens where there's no overflow the arrow still briefly appears.

## Plan — Single File: `src/pages/Appointment.tsx`

### 1. Move scroll hint outside the scroll area
- Move the `AnimatePresence` + hint block (lines 513-566) **outside** the `relative -mx-8 px-8` wrapper (line 503), placing it as a sibling **after** the scroll container `div`.
- Position it with `absolute` relative to the **card** (the `bg-card/60` parent), not the scroll wrapper. This prevents it from overlapping the date cards.
- Change position from `right-3` to `right-1` (or `left-1` for RTL) so it sits flush against the card edge, outside the scrollable content area.

### 2. Add right padding to scroll container for arrow clearance
- Add a larger trailing spacer (increase the existing `w-6` spacer at line 656 to `w-14`) so the last card can scroll fully into view past the arrow's position.

### 3. Fix AnimatePresence ref warning
- Audit all `AnimatePresence` blocks. The warning points to a function component child that doesn't use `forwardRef`. The scroll hint's `motion.div` children are fine, but the **sparkle burst** (line 325) has `motion.div` children rendered via `.map()` without individual `AnimatePresence` — this is OK. The real issue: check if any `AnimatePresence` wraps a non-`motion` component. Most likely the issue is that framer-motion's `AnimatePresence` tries to pass a ref to its direct child and some `motion.div` with a conditional render creates a fragment. Fix by ensuring every `AnimatePresence` has exactly one `motion.*` element as its direct child with a unique `key`.

### 4. Initialize scroll state accurately
- In the scroll `useEffect` (line 192), wrap the initial `handleScroll()` call in `requestAnimationFrame` to ensure the DOM has laid out before measuring overflow. This prevents the arrow from flashing on screens where there's no overflow.


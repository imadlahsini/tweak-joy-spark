

# Fix Scroll Arrow Bugs & Improve Design

## Issues
1. **AnimatePresence ref warning** — `AnimatePresence` wrapping `motion.div` children in several places triggers the "Function components cannot be given refs" console error. The hint arrow itself no longer uses `AnimatePresence`, but other `AnimatePresence` blocks in `Appointment.tsx` (lines 597, 619, 638, 705, 758, 803, 823, 896) wrapping `motion.div` conditionals are the source.
2. **Hint visibility logic for RTL is fragile** — the condition `isRTL ? showLeftFade || !showRightFade : showRightFade` is overly complex and can fail on initial render when fades haven't been computed yet.
3. **Arrow design is small and plain** — `p-1.5` with `w-4 h-4` icon is easy to miss on mobile.

## Plan

### File: `src/pages/Appointment.tsx`

**1. Fix AnimatePresence ref warnings**
- Wrap each `motion.div` child inside `AnimatePresence` with `forwardRef` where needed, OR simpler: add explicit `key` props to all `AnimatePresence` children (they already have `key` implicitly via conditionals — the real fix is ensuring `motion.div` is the direct child, not a plain `div` or fragment). Audit each `AnimatePresence` block and ensure the direct child is always a single `motion.*` element with a `key` prop.

**2. Simplify hint visibility**
- Replace the complex condition with: `!hasScrolled && showTrailingFade` where `showTrailingFade = isRTL ? showLeftFade : showRightFade`
- Initialize `showRightFade` based on actual overflow check in the effect (already done), but also run it once on mount with a small `requestAnimationFrame` delay to ensure accurate initial values.

**3. Improve arrow design**
- Increase size: `p-2.5` with `w-5 h-5` icon
- Add a pulsing glow ring: `shadow-[0_0_12px_hsl(var(--primary)/0.5)]` with `animate-pulse-glow`
- Add a subtle semi-transparent pill background behind it with a gradient matching the card edge fade
- Position it slightly inward (`right-3` / `left-3`) so it doesn't overlap the fade gradient
- Add a small label below like "Scroll" (localized) on first appearance that fades after 2s

**4. Smoother dismiss**
- Instead of instant disappear, animate out with `opacity: 0, scale: 0.5` over 300ms when `hasScrolled` becomes true (use a local state with timeout or `AnimatePresence` on a single `motion.div` with proper key).

### Technical details
- All changes in `src/pages/Appointment.tsx`
- The `AnimatePresence` ref warning comes from framer-motion v10+ requiring `forwardRef` on custom components used as children — but since all children here are `motion.div` (not custom components), the actual cause is likely a `motion.div` inside a fragment or extra wrapper. Will audit and flatten.


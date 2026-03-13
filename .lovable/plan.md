
Goal: Make the bouncing chevron hint reliably visible on load and hide only after real user scroll, while removing the current React ref warning.

Plan

1) Fix hint visibility logic in `src/pages/Appointment.tsx`
- Current condition uses `showRightFade` for all languages; in RTL this can hide the hint incorrectly.
- Add a derived flag:
  - `const showTrailingHint = isRTL ? showLeftFade : showRightFade;`
- Render hint with `!hasScrolled && showTrailingHint`.

2) Make “hasScrolled” user-driven (not mount-driven)
- Replace the current `isInitialCall` pattern with scroll-distance detection:
  - Capture initial `scrollLeft` when effect runs.
  - In `handleScroll`, only set `hasScrolled(true)` if absolute delta from initial position is above a small threshold (e.g. 4–8px).
- This prevents auto-measure/layout scroll events from instantly hiding the arrow.

3) Remove the AnimatePresence ref warning source for the hint
- Replace the hint’s `AnimatePresence` wrapper with a direct `motion.div` conditional (or a single mounted `motion.div` with animated opacity/scale).
- Keep the same bounce motion and RTL/LTR icon direction.
- This avoids `AnimatePresence` trying to attach refs in this branch and should clear the console warning tied to `Appointment`.

4) Preserve UX behavior
- Keep current bounce animation (`x` oscillation).
- Keep placement at trailing edge (`right` in LTR, `left` in RTL).
- Ensure hint stays hidden after first real scroll.

Technical details
- File: `src/pages/Appointment.tsx`
- State/refs:
  - keep `hasScrolled` state
  - add `initialScrollLeftRef` (number | null)
- Effect update:
  - initialize `initialScrollLeftRef.current = slider.scrollLeft`
  - compute fades as today
  - set `hasScrolled` only when user-caused scroll distance exceeds threshold
- Hint render condition:
  - `const shouldShowScrollHint = !hasScrolled && showTrailingHint`

Validation checklist (mobile 390x844)
- On first load, hint appears.
- Swiping date slider once makes hint disappear.
- LTR and RTL both show hint on correct side.
- Console no longer shows “Function components cannot be given refs” from `Appointment`.

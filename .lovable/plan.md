

## Add Scroll Hint Animation to Date Slider

The horizontal date slider has no visual cue that it's scrollable. Users may not realize there are more dates beyond the visible ones.

### Approach
Add a one-time "nudge" animation that auto-scrolls the date slider ~60px to the right and back when it first renders. This is a well-known pattern (used by Netflix, iOS App Store) that instantly communicates horizontal scrollability.

### Changes in `src/pages/Appointment.tsx`

**1. Add a useEffect for the nudge animation (after the existing scroll fade useEffect)**

When the component mounts (or when `sliderRef` is available), after a short delay (~800ms to let the entrance animations finish):
- Programmatically scroll the slider 80px in the scroll direction
- After 400ms, scroll it back to 0
- Use `scrollTo({ behavior: "smooth" })` for a fluid feel
- Only run once — guard with a `useRef<boolean>` flag (`hasNudged`)
- RTL-aware: scroll in the opposite direction for Arabic

**2. No new UI elements needed**

The existing fade indicators on left/right already handle the visual edge cues. The nudge just teaches the user that the row moves.

### Implementation Detail

```
const hasNudged = useRef(false);

useEffect(() => {
  const slider = sliderRef.current;
  if (!slider || hasNudged.current) return;
  hasNudged.current = true;
  
  const nudgeDistance = isRTL ? -80 : 80;
  const timer1 = setTimeout(() => {
    slider.scrollTo({ left: nudgeDistance, behavior: "smooth" });
  }, 800);
  const timer2 = setTimeout(() => {
    slider.scrollTo({ left: 0, behavior: "smooth" });
  }, 1200);
  
  return () => { clearTimeout(timer1); clearTimeout(timer2); };
}, [isRTL]);
```

Three lines of state + one useEffect. No UI changes, no risk of layout bugs.


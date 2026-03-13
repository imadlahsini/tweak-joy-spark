

## Fix: Bouncing Scroll Arrow Not Appearing

### Bug
The bouncing chevron arrow never shows because `handleScroll()` is called immediately on mount (line 162) to measure fade indicators, which sets `hasScrolled = true` before the user ever interacts with the slider.

### Fix in `src/pages/Appointment.tsx`

**Line 151-152** — Only set `hasScrolled` on actual user scroll events, not the initial measurement call:

Replace:
```ts
const handleScroll = () => {
  setHasScrolled(true);
```

With:
```ts
let isInitialCall = true;
const handleScroll = () => {
  if (isInitialCall) {
    isInitialCall = false;
  } else {
    setHasScrolled(true);
  }
```

This ensures the initial `handleScroll()` call on line 162 measures fades without marking as scrolled, while subsequent user-triggered scroll events will properly dismiss the arrow.


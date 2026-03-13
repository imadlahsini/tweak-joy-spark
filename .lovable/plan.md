

## Fix: Date Buttons Look Cut Off When Selected

### Root Cause
The scroll container (`overflow-x-auto` on line 411) clips child elements that extend beyond their bounds. Three elements overflow:
1. **Pulsing glow ring** — `absolute -inset-[2px]` extends 2px outside each button
2. **Check badge** — `absolute -top-1 -right-1` extends above and right of the button
3. **Glow shadow** — `shadow-[0_0_30px_...]` gets clipped on top and sides

The container only has `pb-3` padding, and no top/horizontal padding inside the scroll area.

### Fix in `src/pages/Appointment.tsx`

1. **Add padding inside the scroll container** — change from `pb-3` to `p-3 pt-3` so there's breathing room on all sides for the glow ring, check badge, and shadow to render without clipping
2. **Adjust the negative margin** on the parent wrapper from `-mx-5 px-5` to account for the extra internal padding so the visual alignment stays the same
3. **Add `overflow-y-visible`** style alongside the scroll settings so vertical overflow (check badge, glow) isn't clipped — only horizontal axis scrolls

These are small CSS tweaks on ~3 lines in the existing file.


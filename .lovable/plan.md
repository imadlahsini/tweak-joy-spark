

# RTL Issues in Appointment & Confirmation Pages

After analyzing both files, here are the RTL problems found:

## Appointment Page (`src/pages/Appointment.tsx`)

### 1. Back arrow in CTA button doesn't flip direction
**Line 950**: `<ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />` — The arrow uses CSS rotation which works, but the `animate={{ x: [0, 4, 0] }}` animation on line 947 still moves it to the right in RTL. Should animate `x: [0, -4, 0]` in RTL.

### 2. Hardcoded `left-4 right-4` on accent lines
**Lines 496, 666, 733**: `className="absolute top-0 left-4 right-4 h-[2px]..."` — These are symmetric so no issue. ✅

### 3. Summary card rows use `flex` without RTL-awareness
**Lines 868, 880, 891, 902**: The `flex items-center gap-3` rows in the summary card rely on the parent `dir="rtl"` set on the container (line 264), so flexbox should auto-reverse. ✅

### 4. `tracking-wider` / `tracking-[0.12em]` on Arabic text
**Lines 873, 885, 896, 907**: Letter-spacing (`tracking-wider`) on Arabic text looks unnatural — Arabic letters should be connected, extra tracking breaks ligatures. Should be `tracking-normal` for RTL.

### 5. Date format is LTR-only
**Line 646, 886**: `formatDate(selectedDate, "EEEE, MMM d, yyyy")` — The comma-separated Western date pattern doesn't suit Arabic. The `date-fns` locale helps with day/month names but the pattern structure stays LTR.

## Confirmation Page (`src/pages/AppointmentConfirmation.tsx`)

### 6. No `dir` attribute on root
**Line 130**: Uses `className="... rtl"` but doesn't set `dir="rtl"`. The `rtl` CSS class alone doesn't tell the browser to reverse flex/text direction. Needs `dir={isRTL ? "rtl" : "ltr"}`.

### 7. `tracking-[0.15em]` and `tracking-[0.12em]` on Arabic
**Lines 219, 242**: Same letter-spacing issue — wide tracking on Arabic text breaks character connections.

### 8. `uppercase` on Arabic text
**Lines 219, 242**: `uppercase` has no effect on Arabic script but is harmless. Fine to keep.

### 9. Home button icon position
**Line 284**: `<Home />` icon is always before text. In RTL, flexbox with `dir="rtl"` would auto-reverse, but the button doesn't inherit `dir` since the parent only has a CSS class `rtl`, not the `dir` attribute (see issue #6).

### 10. Shimmer animation direction
**Line 280**: `animate={{ x: ["-150%", "150%"] }}` always sweeps left-to-right. Should reverse for RTL.

---

## Plan — Fixes

### `src/pages/AppointmentConfirmation.tsx`
1. **Add `dir` attribute**: Change line 130 from `className={...}` to also include `dir={isRTL ? "rtl" : "ltr"}`
2. **Remove letter-spacing for Arabic**: Add conditional classes — use `tracking-[0.15em]` only when `!isRTL`, otherwise `tracking-normal`
3. **Reverse shimmer direction for RTL**: Change the shimmer x animation to `["150%", "-150%"]` when `isRTL`

### `src/pages/Appointment.tsx`
4. **Fix CTA arrow animation direction**: Change the arrow's `animate` x values to `[0, -4, 0]` when `isRTL`
5. **Remove letter-spacing on Arabic in summary card**: Conditionally apply `tracking-wider` only when `!isRTL`


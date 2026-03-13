

## UX Bugs Found in Appointment Page

### Bug 1: React ref warning on TimeGroup component
The console shows "Function components cannot be given refs" for `TimeGroup`. Framer Motion's `AnimatePresence` tries to pass refs to `TimeGroup` children, but `TimeGroup` is a plain function component. Fix: wrap `TimeGroup` with `React.forwardRef`.

### Bug 2: `next14Days` is computed at module level (line 10)
`Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))` runs once when the module loads. If the user keeps the tab open past midnight, the dates become stale. Fix: move inside the component or use `useMemo`.

### Bug 3: "Today" badge gets clipped/overlaps card boundary
The "Today" badge is positioned `absolute -bottom-0.5` (lines 426, 431) which bleeds outside the card's `overflow-hidden` container, causing it to be clipped or visually broken depending on the browser.

### Bug 4: Time arrow `→` is hardcoded LTR (line 713)
The arrow character `→ {getEndTime(slot.time)}` doesn't flip for RTL (Arabic). It should use `←` or a mirrored icon when `isRTL` is true.

### Bug 5: "1h • In-person" is hardcoded English (line 593)
The summary card shows `"1h • In-person"` regardless of language. Missing translations for Arabic and French.

### Bug 6: Date format is always English (lines 467, 571)
`format(selectedDate, "EEEE, MMM d, yyyy")` from `date-fns` defaults to English locale. Arabic and French users see English day/month names. Fix: pass the appropriate `date-fns` locale.

### Bug 7: Confirm toast message mixes languages (line 136)
The toast uses `at` between date and time: `` `${t.successDesc} ${format(...)} at ${selectedTime}` ``. The word "at" is hardcoded English.

### Bug 8: Day slider has no scroll indicators
On mobile (390px), the 14-day slider extends well beyond the viewport but there's no visual cue (fade edge, arrow, or dots) indicating more days are available to the right. Users may not realize they can scroll.

### Bug 9: No way to deselect or go back from time to date
Once a date is selected, the time section appears but there's no explicit way to go back to step 1 or change the date without scrolling up. The step indicator is display-only — not clickable.

### Bug 10: Fixed CTA may overlap content on short screens
The confirm button is `fixed bottom-0` with `pb-6`, but the main content has only `pb-28`. On very short viewports or when the summary card is visible, the CTA gradient overlay may obscure the summary card.

---

### Plan — Fix All UX Bugs

**File: `src/pages/Appointment.tsx`**

1. **Wrap `TimeGroup` in `React.forwardRef`** to eliminate the console warning
2. **Move `next14Days` inside the component** with `useMemo` so dates stay fresh
3. **Fix "Today" badge positioning** — move it inside the padded area, use `bottom-1` instead of `-bottom-0.5`
4. **Flip arrow for RTL** — render `←` when `isRTL`, `→` otherwise
5. **Add translations for "1h • In-person"** in all three languages
6. **Add `date-fns` locale imports** (`fr`, `arSA`) and pass to `format()` calls
7. **Translate "at" in toast** — add to translations object
8. **Add scroll fade indicators** — gradient overlays on left/right edges of the day slider to hint at scrollability
9. **Make step indicator tappable** — clicking Step 1 dot scrolls back to date section and resets time
10. **Increase bottom padding** to `pb-36` to prevent CTA overlap with summary card


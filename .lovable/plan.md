

## Plan: Replace Calendar with Horizontal Day Slider

### Problem
The current calendar widget is bulky and not great UX on mobile. A horizontal scrollable day picker is more modern, touch-friendly, and visually appealing.

### New Date Picker Design
Replace the `Calendar` component with a **horizontally scrollable day strip** showing the next 14 days as individual day cards:

**Each day card** (glass-morphism styled):
- Day name abbreviated on top (Mon, Tue, Wed...)
- Day number large and bold in center
- Month abbreviated below
- Selected card gets primary fill + glow + check badge (same style as time slots)
- Today's card has a subtle accent dot indicator

**Interaction:**
- Horizontal scroll with snap behavior (`snap-x snap-mandatory`)
- Each card ~70px wide with `snap-center`
- Touch-friendly swipe on mobile
- Selected card animates with scale + glow

### Changes to `src/pages/Appointment.tsx`

1. **Remove** `Calendar` import and usage
2. **Generate** an array of the next 14 days using `date-fns` (`addDays`, `format`, `isToday`)
3. **Replace** the calendar glass card section with a horizontally scrollable container of day cards
4. Keep the selected date pill below
5. Keep all background layers, time slots, and CTA unchanged

### No other files need changes
The `Calendar` component stays in the project (used elsewhere potentially), we just stop importing it here.


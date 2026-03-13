

## Remove End Time from Time Slot Buttons

Remove the "– 10:00" end-time line from each time slot button, keeping only the start time (e.g., "9:00").

### Changes in `src/pages/Appointment.tsx`

1. **Delete lines 762-765** — remove the `<span>` that shows `{timeArrow} {getEndTime(slot.time)}`
2. **Remove `timeArrow` and `getEndTime` props** from the `TimeGroup` component interface and usage since they're no longer needed in the button UI (keep `getEndTime` if it's still used in the summary card)
3. **Remove the clock icon** (line 760) is optional — can keep or remove depending on preference. Will keep it for now since it pairs nicely with a single time.

Net result: each time button shows just `9:00`, `10:00`, etc. — cleaner and more compact.


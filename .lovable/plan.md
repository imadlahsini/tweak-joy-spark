

## Improve Time Buttons

Current state: Each time button is a tall card with a tiny clock icon + time text, using a 4-column grid. They look sparse and the clock icons add visual noise without value.

### Changes in `src/pages/Appointment.tsx`

1. **Remove the clock icon** — the time text is self-explanatory; the icon adds clutter
2. **Make buttons more compact** — reduce vertical padding from `py-2.5` to `py-2`, making them feel like quick-tap chips rather than tall cards
3. **Simplify the inner container** — remove the `flex-col` + `gap-0.5` layout since there's only one element (the time text) after removing the icon
4. **Increase font weight contrast** — bump time text to `text-base font-bold` so the numbers are more prominent and scannable
5. **Reduce animation noise** — tone down the shimmer hover effect and the pulsing glow ring on selected state; keep the gradient border but remove the `opacity` pulse animation
6. **Round the buttons more** — change from `rounded-xl` to `rounded-2xl` for a softer pill-like feel

Net result: clean, compact, easy-to-scan time chips without unnecessary decorations.


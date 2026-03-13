

## Plan: Elevate Appointment Page to Next Level

### Current Issues
The page works but feels flat — plain text labels, basic grid of time slots, no visual hierarchy or "wow" moments. It needs more depth, polish, and delight.

### Enhancements to `src/pages/Appointment.tsx`

**1. Step Progress Indicator**
- Add a visual step tracker at the top (Step 1: Date / Step 2: Time) with animated connecting line that fills as user progresses
- Glowing active step dot, muted completed/upcoming dots

**2. Enhanced Day Slider Cards**
- Add inner gradient shine effect on selected card
- Pulsing glow ring animation on selected card (not just static ring)
- "Today" badge label instead of just a dot
- Subtle particle/sparkle effect on selection

**3. Glass-morphism Section Cards**
- Wrap the date section and time section each in a glass-morphism card container (`bg-card/60 backdrop-blur-2xl border border-border/30 rounded-3xl p-5`) with a top gradient accent line (like the Welcome language cards)
- Adds visual depth and grouping

**4. Upgraded Time Slots**
- Make time slots taller with a secondary line showing the end time (e.g., "09:00" main, "09:00 - 10:00" subtitle)
- Add a subtle clock icon inside each slot
- Selected slot gets animated gradient background instead of flat primary fill
- Ripple effect on tap

**5. Summary Card Before Confirm**
- When both date and time are selected, show an animated summary card above the CTA with:
  - Calendar icon + formatted date
  - Clock icon + formatted time
  - Doctor/clinic icon + "Consultation" label
  - Glass-morphism styling with gradient border

**6. Micro-interactions & Polish**
- Confetti/sparkle burst animation when both selections are made
- Smooth auto-scroll to time section after date selection
- Haptic-style scale bounce on selection
- Animated gradient divider between morning/afternoon sections

**7. Enhanced CTA Button**
- Add a shimmer sweep animation across the button
- Pulse animation when ready to confirm
- Arrow icon that slides on hover

### Files Changed
Only `src/pages/Appointment.tsx` — full rewrite of the component with all enhancements above. No new files needed; all changes are self-contained.


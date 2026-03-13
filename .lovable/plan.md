

## Improve Summary Info Card Design

The current card has a rotating gradient border and simple icon rows. Here's the upgrade for a more polished, premium feel on mobile.

### Changes in `src/pages/Appointment.tsx` (lines 598-658)

**1. Card structure — segmented rows with dividers**
- Add a thin `border-b border-border/30` separator between each info row (date, time, consultation) for visual clarity
- Increase row padding to `py-3` for better breathing room

**2. Icon containers — gradient fills instead of flat tints**
- Date icon: `bg-gradient-to-br from-primary/15 to-primary/5` with a subtle `shadow-sm`
- Time icon: `bg-gradient-to-br from-accent/15 to-accent/5`
- Consultation icon: `bg-gradient-to-br from-primary/10 to-accent/10`
- Make icons slightly larger: `w-11 h-11 rounded-2xl`

**3. Typography refinement**
- Labels: `text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70` — smaller, letterspaced for a premium subtitle feel
- Values: `text-[15px] font-bold text-foreground` — slightly larger and bolder

**4. Header upgrade**
- Replace the simple Sparkles + text header with a pill badge: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold`
- This makes the title "Your Appointment" stand out as a status badge

**5. Animated gradient border — keep but soften**
- Reduce border thickness from 2px to 1.5px (change `m-[2px]` to `m-[1.5px]`)
- Slow down animation from 4s to 6s for a more subtle, premium feel

**6. Add a subtle inner glow**
- Add `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]` to the inner card for a glass highlight effect

### Summary
All changes within the existing summary card block. No new components needed. The card gets segmented rows, gradient icon backgrounds, refined typography, a badge-style header, and a softer animated border.


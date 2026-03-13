

# Improve Scroll Arrow Design

## Current State
The arrow is a simple solid-color circle with a chevron icon and a glow shadow — functional but visually flat compared to the rest of the glass-morphism UI.

## Design Upgrade

### File: `src/pages/Appointment.tsx` (lines 524-530)

Replace the single circle with a **layered, animated pill-shaped indicator**:

1. **Outer glow ring** — A `motion.div` with a gradient border (`from-primary via-accent to-primary`) that pulses opacity, matching the selected-date glow ring style already used in the page.

2. **Glass pill body** — Replace the solid `bg-primary` circle with a glass-morphism pill: `bg-card/70 backdrop-blur-xl border border-primary/30 rounded-full`. This aligns with the premium glass-card identity.

3. **Double chevron** — Use two stacked chevrons (or a `ChevronsRight` icon from lucide) instead of a single one, with a staggered bounce animation where the second chevron trails the first by ~100ms.

4. **Animated trail dots** — Add 2-3 small dots trailing behind the arrow that fade out sequentially, creating a motion trail effect. Each dot is a tiny `motion.div` circle with decreasing opacity and size.

5. **Subtle "swipe" text** — A tiny localized label ("Swipe" / "Glisser" / "اسحب") below the arrow in `text-[10px] text-muted-foreground` that fades out after 2 seconds using a delayed animation.

### Animation Details
- Main chevrons: bounce `x: [0, 8, 0]` (or `[-8, 0]` for RTL) at 1.2s loop
- Trail dots: same bounce but with `delay: 0.1` and `delay: 0.2` offsets
- Outer glow: `opacity: [0.4, 0.8, 0.4]` pulsing at 2s
- Text label: `opacity` animates from 1 to 0 with a 2s delay


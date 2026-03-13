

## Make Time Buttons Look Amazing

The current time buttons are plain rectangular chips with just text. Here's the plan to make them visually stunning while keeping them functional.

### Design Direction
Glass-morphism chips with gradient accents, subtle icons, and rich micro-interactions.

### Changes in `src/pages/Appointment.tsx` — TimeGroup component (lines 714-768)

**1. Richer unselected state**
- Add a subtle inner gradient shimmer on hover (a pseudo-element that slides across)
- Use `bg-gradient-to-br from-card via-card to-secondary/30` for depth instead of flat `bg-card/80`
- Add a faint colored left-border accent (`border-l-2 border-l-primary/20`) for visual rhythm
- Increase padding: `py-3 px-1` for a more generous tap target

**2. Stunning selected state**
- Animated gradient background using `background-size: 200%` with a slow shifting animation
- Stronger glow shadow: `shadow-[0_0_24px_hsl(var(--primary)/0.35),0_0_48px_hsl(var(--accent)/0.15)]`
- Inner shine overlay with a diagonal gradient from white/25 to transparent
- Slight scale bump on selection (`scale: 1.02`)

**3. Enhanced hover/tap micro-interactions**
- `whileHover`: scale 1.06, y: -3, add a box-shadow glow
- `whileTap`: scale 0.9 with a quick spring
- Add a ripple-like ring effect on tap via a brief `ring-2 ring-primary/30` animation

**4. Typography upgrade**
- Selected: `text-lg font-extrabold` with a subtle text-shadow
- Unselected: `text-base font-semibold` with muted-foreground color that transitions to foreground on hover

**5. Layout tweak**
- Change grid from `grid-cols-4 gap-2` to `grid-cols-3 gap-3` — gives each button more breathing room and a larger touch target on mobile (390px viewport)
- Slightly taller buttons with the extra padding

**6. Selected check badge upgrade**
- Increase badge size from `w-5 h-5` to `w-6 h-6`
- Add a gradient background matching the button gradient instead of flat `bg-accent`
- Add a subtle pulsing glow ring around the badge

### Summary
All changes are within the TimeGroup component (~50 lines). The grid becomes 3-column for better proportions, buttons get glass-morphism styling with gradient accents, and micro-interactions are elevated with springs and glows.


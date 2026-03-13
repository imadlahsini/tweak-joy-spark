

## Redo Time Buttons for Mobile — Premium Design

The current buttons are plain outlined rectangles in a 3-column grid. They lack visual impact and feel generic. Here's the redesign:

### Design Direction
Compact, touch-friendly **gradient-bordered pill chips** with bold typography and satisfying tap feedback. Optimized for 390px width.

### Changes in `src/pages/Appointment.tsx` — TimeGroup component

**1. Layout: 4-column grid**
- Switch back to `grid-cols-4 gap-2.5` — on 390px this gives ~80px per button which is perfect for 5-char time strings ("09:00"). The current 3-col makes them feel too wide and wastes space.

**2. Unselected state — minimal elegance**
- Remove the `border-l-2` accent, the shimmer pseudo-element, and the gradient border hover overlay — too many layers for a simple time chip
- Clean style: `bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl py-2.5 px-2`
- Text: `text-sm font-semibold text-foreground/70` — slightly muted but readable
- Hover: gentle `border-primary/40` transition

**3. Selected state — bold and clear**
- Solid `bg-gradient-to-r from-primary to-accent` fill with white text
- `text-sm font-bold text-white`
- Subtle glow: `shadow-[0_4px_16px_hsl(var(--primary)/0.3)]`
- Remove the animated gradient border wrapper (the rotating backgroundPosition div) — it's over-engineered for a time chip
- Remove the diagonal shine overlay

**4. Interactions — snappy, not floaty**
- Remove `whileHover` scale/y transforms (irrelevant on mobile touch)
- `whileTap`: `scale: 0.95` with a quick spring — satisfying press feel
- Remove the complex box-shadow hover animation

**5. Check badge — simplify**
- Remove the check badge entirely. The filled gradient background already clearly communicates selection. The badge adds clutter on small buttons.

**6. Remove unnecessary elements**
- Delete: animated gradient border div, hover border div, shimmer div, shine overlay div, check badge AnimatePresence block
- Result: ~20 lines of clean code instead of ~65 lines of layered effects

### Net Result
Clean, iOS-style time chips that feel native on mobile. Bold gradient fill for selected, subtle outline for unselected, snappy tap animation.




# Remove Arrow Glow, Add Left-Side Card Glow

## Changes — `src/pages/Appointment.tsx`

### 1. Remove glow from scroll hint arrow (lines 589-594, 611)
- Remove the outer pulsing glow ring div (the `motion.div` with `blur-sm` and gradient at lines 590-594)
- Remove `shadow-[0_0_20px_hsl(var(--primary)/0.4)]` from the main pill (line 611)
- Keep the chevron animation and trail dots — just strip the glow effects

### 2. Add a glow emanating from the left side of the date card (line 488)
- Inside the date card container (`relative bg-card/60 ...`), add a new absolute-positioned div on the left edge:
  - `absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-primary/15 to-transparent blur-2xl pointer-events-none`
  - This creates a soft ambient glow bleeding from the left side of the card
  - For RTL: flip to right side (`right-0`, `bg-gradient-to-l`)


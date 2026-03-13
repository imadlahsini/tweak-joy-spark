

## Plan: Remove Text Elements & Next-Level Logo Redesign

### Remove these elements from `src/pages/Welcome.tsx`:
- **"Choose Your Experience" badge** (lines 147-157)
- **"مرحباً · Welcome · Bienvenue" heading + "Choose your language" subtitle** (lines 177-200)

### Next-Level Logo Redesign (mobile-first, 390px viewport)

Replace the current simple icon+text logo (lines 159-175) with a dramatic, layered logo composition:

**Layered icon with animated rings:**
- Outer animated ring: rotating dashed border (`w-28 h-28`) with gradient stroke, slowly spinning
- Middle pulsing glow ring: `w-24 h-24` with `animate-pulse` and `blur-xl` primary glow
- Inner glass-morphism container: `w-20 h-20 rounded-3xl` with `backdrop-blur-xl`, gradient border, and inner radial gradient background
- Brain icon at `w-10 h-10` centered inside

**Orbital dots:**
- 3 small dots (`w-2 h-2`) orbiting the icon at different speeds using CSS `rotate` keyframes, each a different color (primary, accent, foreground)

**Text below icon (stacked vertically on mobile):**
- "Junior" in `text-5xl font-bold` with standard foreground color
- "AI" in `text-5xl font-bold` with animated gradient text (`from-primary via-accent to-primary`, `bg-[length:200%] animate-gradient`)
- Thin accent line below (`w-12 h-[2px]`) with gradient from primary to accent

**New keyframes in the component** (inline via framer-motion):
- Slow spin for outer ring (40s linear infinite)
- Orbital animation for dots (8s, 12s, 16s)
- Gentle floating for the whole logo block

### File to modify
- `src/pages/Welcome.tsx` — remove badge + heading/subtitle, replace logo section with layered animated logo


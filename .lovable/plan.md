

## Plan: Create Appointment Booking Page

### Overview
After language selection, users navigate to `/appointment` — a premium appointment booking page matching the main site's design system (animated gradient mesh, floating orbs, geometric shapes, glass-morphism cards, noise overlay, bottom hero image).

### Files to Create

**`src/pages/Appointment.tsx`**
Full-page appointment booking with the same visual DNA as Welcome/Hero pages:

**Background layer** (identical to Welcome page):
- Animated gradient mesh (3 radial gradients with scale/rotate animations)
- Dot grid overlay at 40% opacity
- Floating geometric shapes (triangle, circle, square, ring) with rotation/bounce animations
- Parallax floating orbs reacting to mouse movement
- Noise overlay
- Bottom faded hero image (same as Welcome page)

**Content — two-step flow:**

*Step 1: Date Selection*
- Animated section heading with gradient text ("Book Your Appointment" / localized AR/EN/FR)
- Subtitle text in muted foreground
- Inline `Calendar` component inside a glass-morphism card (`bg-card/70 backdrop-blur-xl border border-border/40`) with shimmer sweep on hover, glowing border, top gradient accent line — same card style as Welcome language cards
- `pointer-events-auto` on Calendar for interactivity
- Past dates disabled, today highlighted
- Selected date displays as an animated pill/badge below

*Step 2: Time Slot Selection (revealed with AnimatePresence after date pick)*
- Two groups with labels: "Morning" (09:00–12:00) and "Afternoon" (13:00–16:00)
- 8 slots: `["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]`
- Each slot is a glass-morphism button matching the language card style — shimmer sweep, hover glow (`shadow-[0_0_40px_hsl(var(--primary)/0.2)]`), gradient border on hover
- Selected slot gets primary fill + scale animation
- Staggered entrance via Framer Motion (delay per slot)

*Confirm CTA:*
- Fixed bottom button matching Hero CTA style — gradient border glow, `bg-foreground text-background`, Sparkles icon
- Shows success toast via sonner on click, then navigates to `/home`

**Internationalization:**
- All headings/labels translated for AR/EN/FR using `useLanguage()`
- `dir="rtl"` wrapper when Arabic selected

### Files to Modify

**`src/App.tsx`** — Add `/appointment` route with lazy import

**`src/pages/Welcome.tsx`** — Change lines 37 and 43: navigate to `/appointment` instead of `/home`


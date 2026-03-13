

# Redesign Floating Action Bar — Glass Bar Style

## Problem
The floating action bar on the confirmation page is too tall, uses basic styling, and doesn't match the premium glass-morphism navbar used elsewhere. The icons are generic and the overall feel is plain.

## Changes — `src/pages/AppointmentConfirmation.tsx`

### 1. Compact glass bar with gradient border
Replace the current bar with a slimmer, horizontal layout matching the Navbar's glass style:
- `bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-elevated`
- Add a subtle gradient overlay inside (`bg-gradient-to-r from-primary/10 via-transparent to-accent/10`)
- Reduce vertical padding — make the bar compact (`py-2 px-4`) instead of the current tall layout with large icon circles

### 2. Horizontal inline layout (not stacked)
Switch from vertical icon+label stacks to a **horizontal row** of compact pill-shaped buttons:
- Each button: icon + label side by side in a single row
- Smaller icon size (`w-4 h-4`), no wrapping circle backgrounds
- Use `gap-2` between icon and text, `gap-1` between buttons
- Thin vertical separators between items

### 3. Better icons
- WhatsApp: Keep `MessageCircle` but could use a brand-appropriate style
- Call: Switch from `Phone` to `PhoneCall` (more dynamic)
- Directions: Switch from `MapPin` to `Navigation` (more action-oriented)

### 4. Slim bar height
- Remove the large `w-10 h-10` icon circles
- Use inline icons with text labels in a single horizontal row
- Target height ~48px vs the current ~80px+
- Keep safe-area bottom padding


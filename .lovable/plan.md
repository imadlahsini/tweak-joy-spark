

# Bug: Slow Page Load with Random Elements Flashing

## Root Causes Found

### 1. Navbar references deleted `/checkout` route (lines 185 and 330)
The Navbar "Get Started" button navigates to `/checkout` which was deleted. This causes a flash of the NotFound page. Both desktop and mobile CTA buttons have this broken link.

### 2. Heavy external image blocking render
Both Welcome and Appointment pages load a large external image from `ophtalmologueagadir.com`. This blocks rendering and causes layout shifts as the image loads.

### 3. Excessive staggered animations cause "random elements" appearance
Nearly every element on both Welcome and Appointment pages has individual `initial={{ opacity: 0 }}` with different delays (0.2s, 0.5s, 0.7s, etc.). During load, elements pop in one-by-one at different positions, looking like random elements appearing.

### 4. Console error: Function components cannot be given refs
In Appointment.tsx, a function component inside `AnimatePresence` is being given a ref it can't accept, causing React warnings and potential rendering issues.

## Fix Plan

### `src/components/landing/Navbar.tsx`
- Change `navigate("/checkout")` to `navigate("/appointment")` on both desktop (line 185) and mobile (line 330) CTA buttons

### `src/pages/Welcome.tsx`
- Add `loading="lazy"` and `fetchPriority="low"` to the background image
- Reduce animation delays across language cards (currently 0.7 + i*0.12, reduce to 0.2 + i*0.08)

### `src/pages/Appointment.tsx`
- Reduce animation delays across the page (heading, step indicator, date card all have staggered delays adding up to ~0.5s+)
- Add `loading="lazy"` to the background image

These changes will make pages feel snappier and stop the "random elements appearing" effect caused by long staggered animation chains.


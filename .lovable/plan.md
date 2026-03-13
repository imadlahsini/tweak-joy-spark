

# Elevate Confirmation Page to Match Site Design

## Problem
The confirmation page has a flat, minimal background compared to the rich, layered premium backgrounds used on the home and appointment pages. It's missing the navbar, animated gradient mesh, floating geometric shapes, noise overlay, and hero image.

## Changes — `src/pages/AppointmentConfirmation.tsx`

### 1. Add Navbar
Import and render `<Navbar />` at the top. Add `pt-24` to the content container to offset for it.

### 2. Replace flat background with animated gradient mesh
Swap the static `bg-gradient-to-br` with three animated radial gradient blobs (matching Appointment page):
- Top-left: `from-primary/20`, scale+rotate animation, 20s loop
- Bottom-right: `from-accent/15`, scale+rotate animation, 25s loop
- Center: `from-primary/10`, scale+x animation, 30s loop

### 3. Add floating geometric shapes
Add the same three animated shapes from the appointment page:
- Rotating triangle (top-right)
- Bobbing circle (top-left)
- Pulsing ring (bottom-right)

### 4. Add noise overlay
Add `<div className="absolute inset-0 noise-overlay pointer-events-none" />`.

### 5. Add faded hero image at bottom
Same blurred background image at 5% opacity used on the appointment page.

### 6. Increase dot grid opacity
Change `opacity-30` to `opacity-40` to match.

### 7. Adjust content padding
Change `py-12` to `pt-24 pb-32` to account for navbar and floating bar.


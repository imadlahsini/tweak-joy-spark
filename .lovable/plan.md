

## Plan: Remove Logo & Surrounding Elements from Header

### Changes to `src/pages/Welcome.tsx`

Remove the entire logo section (lines 147-165) — the `motion.div` wrapper containing the pulsing glow, glass container, gradient overlays, and the logo image. This leaves just the language cards as the centered content.

The content area will only contain the language selection cards, cleanly centered on the page with the animated background effects still intact.

### File to modify
- `src/pages/Welcome.tsx` — delete lines 147-165


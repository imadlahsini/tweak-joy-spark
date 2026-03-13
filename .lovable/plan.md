

## Plan: Match Welcome Page Design to Main Landing Page

The Welcome page currently has a plain light background with simple floating orbs. The main landing page (Hero section) has rich design elements including animated gradient mesh backgrounds, dot grid patterns, floating geometric shapes, noise texture overlays, and parallax mouse-tracking effects.

### Changes to `src/pages/Welcome.tsx`

Add the following design elements from the Hero section:

1. **Animated gradient mesh background** — Large animated radial gradients that scale and rotate (the purple/accent blobs behind the hero)
2. **Dot grid pattern overlay** — The subtle dot-grid texture visible on the main page
3. **Floating geometric shapes** — Rotating triangle, bouncing circle, spinning square, ring, and plus sign scattered around the page
4. **Noise texture overlay** — The `noise-overlay` CSS class for subtle grain
5. **Mouse-tracking parallax** — `useMotionValue`/`useTransform` on the orbs so they respond to mouse movement, matching the Hero's interactivity
6. **Gradient text on the welcome heading** — Apply the same `bg-gradient-to-r from-primary via-accent to-primary` animated gradient to part of the heading text
7. **Language cards with glow hover effect** — Add the `hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]` glow and glass-morphism styling similar to the LogoBar company cards
8. **Sparkle badge** — Add a small animated badge similar to the Hero's "AI-Powered SEO" badge

### Files to modify
- `src/pages/Welcome.tsx` — Add all the background layers, geometric shapes, noise overlay, parallax, and enhanced card styling from the Hero component




## Plan: Add Faded Background Image to Bottom of Welcome Page

### Changes to `src/pages/Welcome.tsx`

Add a new `div` after the noise overlay (line 138) containing the hero image, positioned at the bottom of the screen, faded and blurred:

```jsx
{/* Bottom background image — faded & blurred */}
<div className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
  <img
    src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/hero-image2.webp"
    alt=""
    className="w-full h-full object-cover object-top opacity-20 blur-sm"
  />
</div>
```

- Positioned at the bottom 50% of the viewport
- Gradient overlay fades from solid background at top to transparent, blending seamlessly
- Image at 20% opacity with slight blur for a subtle, atmospheric effect
- `pointer-events-none` so it doesn't interfere with interactions

### File to modify
- `src/pages/Welcome.tsx` — insert after line 138


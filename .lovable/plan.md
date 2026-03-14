

# Replace Navbar Logo with Custom Image

## Change — `src/pages/AppointmentConfirmation.tsx` & `src/components/landing/Navbar.tsx`

### Navbar.tsx (lines 99–126)
Replace the entire logo block (animated brain icon, gradient background, pulse ring) with a single `<img>` tag using the provided URL. Keep the `motion.a` wrapper for hover animation.

```
<motion.a ...>
  <img 
    src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/cropped-sounnyfav.webp" 
    alt="Logo" 
    className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-contain"
  />
</motion.a>
```

Remove the `Brain` import if unused elsewhere in the file.


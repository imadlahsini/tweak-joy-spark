

## Plan: Replace Brain Icon with Logo Image & Redesign Header

### Changes to `src/pages/Welcome.tsx`

**1. Replace Brain icon with logo image**
- Remove `Brain` import from lucide-react
- Replace the Brain icon (line 173) with `<img src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/ddfd.png" alt="Junior AI" />` 
- Size the image `w-14 h-14 sm:w-16 sm:h-16 object-contain` inside the existing glass container
- Keep all the animated rings, pulsing glow, and orbital dots — they frame the logo beautifully

**2. Remove "Junior AI" text block**
- Remove lines 200-218 (the "Junior" + "AI" text and accent line) since the logo image contains the brand identity
- This makes the logo image the sole hero element, cleaner and more impactful

**3. Tighten spacing**
- Reduce gap between logo and language cards (from `gap-5` to `gap-4`) since the text block is gone
- Ensure everything stays centered and balanced on 390px mobile viewport

### What stays unchanged
- All animated rings, orbital dots, glass container, and background effects remain
- Language cards remain exactly as they are

### File to modify
- `src/pages/Welcome.tsx`


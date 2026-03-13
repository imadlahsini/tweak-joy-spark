

## Plan: Premium Mobile-First Language Selector with Flags

### Changes to `src/pages/Welcome.tsx`

**1. Add flag emojis + richer data model**
- Update languages array: `🇸🇦` Arabic, `🇺🇸` English, `🇫🇷` French
- Add a greeting per language ("مرحباً", "Hello", "Bonjour")

**2. Redesign language cards — premium, mobile-first**
Each card becomes a full-width glass card on mobile with:
- Large flag emoji (text-5xl) with a subtle circular glow behind it
- Native language name in bold + subtitle underneath
- Animated gradient border using a pseudo-element or wrapper div
- Shimmer/shine sweep animation on hover/tap
- Right-arrow icon that slides in on hover
- Full width on mobile (`w-full max-w-xs`), row layout on desktop
- Generous touch targets (`py-5 px-6`) with rounded-2xl

**3. Mobile layout overhaul**
- Reduce heading to `text-3xl` on mobile, tighten gaps (`gap-5` instead of `gap-8`)
- Show some geometric shapes on mobile (remove `hidden lg:block` from a couple)
- Show floating orbs on mobile (remove `hidden sm:block`)
- Reduce overall vertical spacing so everything fits on one screen without scrolling
- Cards stack vertically, full-width with `w-full` in a `max-w-sm` container

**4. Add animated gradient border ring on cards**
- Each card gets a subtle animated gradient border (primary → accent) that glows on tap
- Active/pressed state with scale-down and border color change

**5. Staggered entrance animation per card**
- Each card slides up with increasing delay + slight blur-to-clear effect

### File to modify
- `src/pages/Welcome.tsx`




# Fix Mobile Menu Bugs

## Issues Identified
1. **Z-index conflict**: Mobile menu is `z-40` but navbar is `z-50`, so the navbar sits on top of the menu content
2. **Top padding insufficient**: Menu content starts at `pt-24` but the first contact row still clips behind the navbar area
3. **Logo bleeds through**: The navbar logo is visible overlapping the first contact item icon because of the z-index issue

## Changes — `src/components/landing/Navbar.tsx`

### 1. Fix z-index on mobile menu overlay
Change the mobile menu container from `z-40` to `z-50` (same as navbar), and ensure the menu content sits above the navbar bar. Alternatively, bump it to `z-[60]` so it clearly sits above.

### 2. Increase top padding
Bump `pt-24` to `pt-28` on the menu content wrapper so contact items clear the navbar height completely.

### 3. Hide navbar bar when menu is open
Conditionally hide the navbar inner content (logo, hamburger) or set the menu backdrop to fully opaque so nothing bleeds through. The simplest fix: make the backdrop `bg-background` (fully opaque) instead of `bg-background/95`.


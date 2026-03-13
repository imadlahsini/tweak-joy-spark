

## Plan: Simplify Logo — Remove Orbital Elements

### Changes to `src/pages/Welcome.tsx`

Remove the orbital dots and rotating rings, keeping only the pulsing glow, glass container, and logo image:

- **Remove** outer rotating dashed ring (lines 156-161)
- **Remove** second counter-rotating ring (lines 162-167)
- **Remove** all three orbital dots (lines 176-197)
- **Keep** the pulsing glow background and glass container with the logo image
- **Simplify** the container — reduce wrapper size since rings are gone (`w-24 h-24 sm:w-28 sm:h-28`), increase the inner glass container and image slightly for impact

Result: Clean, glowing glass container with the logo image — no spinning elements.


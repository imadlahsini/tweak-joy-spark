

# Switch from Purple to Medical Blue — Optimized Palette

The current palette is still entirely purple (hue 270/280). Here's the carefully chosen medical blue palette and all files that need updating.

## Chosen Color Values

**Primary — Medical Blue (hue 210)**: A trustworthy, professional blue used by top health brands (Mayo Clinic, Zocdoc, One Medical). Not too saturated to avoid looking cheap.

**Accent — Teal (hue 185)**: A calming teal that pairs beautifully with medical blue — evokes cleanliness and care. Better than `195` which would be too close to primary.

| Token | Light Mode | Dark Mode | Rationale |
|-------|-----------|-----------|-----------|
| **Primary** | `210 75% 45%` | `210 75% 58%` | Rich medical blue, not electric — professional and trustworthy |
| **Accent** | `185 65% 45%` | `185 65% 55%` | Calming teal, classic healthcare complement |
| **Foreground** | `210 25% 10%` | `210 15% 95%` | Slightly blue-tinted blacks for cohesion |
| **Secondary** | `210 20% 96%` / `210 20% 15%` | Soft blue tint |
| **Muted-fg** | `210 15% 45%` / `210 15% 60%` | |
| **Border/Input** | `210 15% 88%` / `210 20% 18%` | |
| **Dark bg** | `210 30% 6%` | Deep navy instead of purple-black |
| **Dark card** | `210 25% 10%` | |

## Files to Change

### 1. `src/index.css` — All CSS variables
- Replace every `270` hue → `210`, every `280` hue → `185`
- Dark mode background from `270 30% 6%` → `210 30% 6%` (deep navy)

### 2. `tailwind.config.ts`
- `pulse-glow` keyframe: `hsla(270, 70%, 55%,...)` → `hsla(210, 75%, 45%,...)`
- Rename `purple` color group to `blue` (glow, deep, light)

### 3. `src/components/shared/SectionBadge.tsx`
- `purple-500/15` → `blue-500/15`, `purple-200` → `blue-200`, `purple-400` → `blue-400`

### 4. `src/components/landing/LogoBar.tsx`
- `purple-500/30` → `blue-500/30`
- `purple-600/10` → `blue-600/10`
- `purple-400/30` → `blue-400/30`
- `purple-300` → `blue-300`
- `rgba(139,92,246,0.15)` → `rgba(59,130,246,0.15)` (Tailwind blue-500 hex)

### 5. `src/components/landing/Testimonial.tsx`
- `from-purple-500 to-pink-500` → `from-blue-500 to-cyan-500`


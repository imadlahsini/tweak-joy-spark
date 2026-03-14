

# Redesign Appointment Page Headline for Mobile

## Current State
Plain "Book Your **Appointment**" text with a simple gradient on the accent word and a small subtitle below. Looks generic and basic across all three languages.

## Proposed Design
A more premium, compact headline section with visual flair:

### 1. Add a decorative badge above the title
- Small pill/badge with a sparkle icon and text like "Consultation" / "استشارة" / "Consultation"
- Uses `SectionBadge` component (already exists in the project) or a custom mini-badge with `bg-primary/10 text-primary` styling

### 2. Restructure the title layout
- Stack title and accent word vertically instead of inline, so it reads as two distinct lines
- Title line: lighter weight, smaller size
- Accent line: bold, larger, with a richer gradient and subtle glow/shadow
- This works better across all 3 languages since line lengths vary significantly (Arabic is very short, French is long)

### 3. Enhance subtitle
- Add a thin decorative line or dot separator above/below subtitle
- Slightly increase opacity and add a subtle icon (calendar or stethoscope) inline

### 4. Add ambient visual touch
- A subtle gradient blur circle behind the headline area for depth (similar to the FloatingOrb pattern already used)

## Technical Changes — `src/pages/Appointment.tsx`

**Lines 366-382** — Replace the heading section:
- Add a `SectionBadge` or inline badge component above the h1
- Split h1 into two lines: `t.title` on first line (text-xl, font-medium), `t.titleAccent` on second line (text-4xl, font-bold, enhanced gradient with drop-shadow)
- Wrap subtitle with a small inline icon and slightly refined typography
- Add a decorative gradient blur div behind the heading block
- Ensure RTL (`isRTL`) alignment works by using `text-center` consistently




# Navbar: Mobile Menu Redesign + Hide Nav Links on Desktop

## Changes — `src/components/landing/Navbar.tsx`

### 1. Hide desktop nav links (Services, Process, Pricing)
Remove or hide the desktop navigation links section (lines 116-155). The hamburger menu button stays mobile-only. On desktop, show only logo + "Get Started" CTA button.

### 2. Redesign mobile menu content
Replace the current nav links + social links in the mobile menu with **contact details** and a **Call button**:

- **Phone numbers**: Show `0528333836` and `0528333837` with `Phone` icon, tappable `tel:` links
- **WhatsApp**: Show `0660077768` with WhatsApp SVG icon, tappable link to `https://wa.me/212660077768`
- **Working hours**: Display business hours (need to confirm exact hours — will use a placeholder like "Lun-Ven: 9h-18h")
- **CTA button**: Change from "Get Started" (navigates to /appointment) to **"Appeler"** / **"Call"** with `Phone` icon, linking to `tel:0528333836`

### 3. Remove social links from mobile menu
Replace Twitter/LinkedIn/Mail social links at the bottom with the WhatsApp quick-action button.

### 4. Keep desktop CTA unchanged
The "Get Started" button on desktop remains as-is, navigating to `/appointment`.




# Floating Action Bar on Confirmation Page

## What Changes

### `src/pages/AppointmentConfirmation.tsx`

1. **Remove** the "Back to Home" button block (lines 267-287)

2. **Add a fixed bottom floating bar** styled like the navbar's scrolled state:
   - `fixed bottom-6 left-4 right-4` with `max-w-sm mx-auto`
   - Glass-morphism: `bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-elevated`
   - Subtle gradient border overlay (same as navbar)
   - Contains 3 equally-spaced icon buttons: **WhatsApp**, **Phone**, **Directions**
   - Each button: icon + label below, using `flex flex-col items-center gap-1`
   - WhatsApp: green accent, links to `https://wa.me/212XXXXXXXXX` (placeholder number)
   - Phone: primary color, `tel:+212XXXXXXXXX` link
   - Directions: accent color, Google Maps link (placeholder)
   - Entry animation: slides up from bottom with delay

3. **Add translations** for the 3 button labels (WhatsApp / Téléphone / واتساب etc.)

4. **Import** `MessageCircle`, `Phone`, `MapPin` from lucide-react (remove `Home` import)


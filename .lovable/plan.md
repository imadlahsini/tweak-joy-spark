

# Better Icons for Floating Action Bar

## Current State
The bar uses `MessageCircle`, `PhoneCall`, and `Navigation` from lucide-react — these are generic and don't feel purpose-built for WhatsApp, calling, or maps.

## Changes — `src/pages/AppointmentConfirmation.tsx`

### Swap icons to more recognizable ones:
- **WhatsApp**: `MessageCircle` → **`Send`** (angled paper-plane feel, universally associated with messaging) — or better yet, use a custom inline WhatsApp SVG icon for instant brand recognition
- **Call**: `PhoneCall` → **`Phone`** (cleaner, simpler telephone icon — `PhoneCall` has the extra "ring" lines that add visual noise at small sizes)
- **Directions**: `Navigation` → **`MapPin`** (universally recognized location pin, clearer intent than the arrow-style Navigation icon)

Since this is a medical/ophthalmology site, using a recognizable WhatsApp-style icon matters most. I'll add a small inline SVG for the WhatsApp icon (the speech bubble with phone) and use `Phone` and `MapPin` from lucide-react for the other two.


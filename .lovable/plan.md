

# Appointment Confirmation Page

## Overview
Create a stunning confirmation page at `/appointment/confirmation` that replaces the current toast + redirect. It will match the premium glass-morphism style of the booking page.

## New File: `src/pages/AppointmentConfirmation.tsx`

**Visual Design:**
- Full-screen dark gradient background with FloatingOrbs (matching Appointment page)
- Large animated success checkmark: green circle that scales in, then a check icon draws in with a stroke animation
- "Appointment Confirmed!" heading with TextReveal-style animation
- Premium glass-morphism summary card (reusing the exact same card design from the booking page — gradient animated border, divided rows with icon pills for client info, date, time, consultation)
- A subtle confetti burst of small dots/particles on mount (CSS-only or framer-motion)
- "Back to Home" button styled like the existing CTA (gradient glow, shimmer sweep)
- Full trilingual support (EN/FR/AR) using `useLanguage()`

**Behavior:**
- Receives booking data via `useLocation().state` (clientName, clientPhone, selectedDate, selectedTime)
- Redirects to `/appointment` if no state is present
- RTL support for Arabic

## Changes to `src/pages/Appointment.tsx`
- Update `handleConfirm` to navigate to `/appointment/confirmation` passing state instead of showing a toast

## Changes to `src/App.tsx`
- Add route `<Route path="/appointment/confirmation" element={<AppointmentConfirmation />} />`

## Translations
Each language gets: confirmedTitle, confirmedSubtitle, backHome, date, time, consultation, duration, details labels — matching existing tone.


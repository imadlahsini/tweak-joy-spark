

## Add Navbar to Appointment Page

The existing `Navbar` component from `src/components/landing/Navbar.tsx` will be reused on the Appointment page.

### Changes in `src/pages/Appointment.tsx`

1. **Import Navbar** at the top of the file.
2. **Render `<Navbar />`** inside the return, just before the background layers — above the main content but inside the root `div`. Since Navbar is `fixed` positioned with `z-50`, it will overlay correctly.
3. **Adjust top padding** on the main content container (line 310): change `pt-6` to `pt-24` to account for the fixed navbar height and prevent content overlap.


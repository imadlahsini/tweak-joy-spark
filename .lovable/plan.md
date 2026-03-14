
Goal: Fix the mobile menu UX in `Navbar` so it no longer overlaps/breaks, keeps a visible header, removes the random bottom WhatsApp icon, and upgrades button design quality.

What I found
- Your clarification: main issues are layout overlap, too-basic button design, random WhatsApp icon at the bottom, and missing header in menu view.
- Current mobile menu is a full-screen overlay without an internal header bar.
- There is a standalone WhatsApp quick-action icon at the very bottom (separate from the main contact list), which feels disconnected.
- Contact rows are functional but visually plain and not structured like a polished contact panel.
- Console shows a React ref warning tied to `WhatsAppIcon` in `Navbar` (should be fixed while touching this area).

Implementation plan (single file: `src/components/landing/Navbar.tsx`)
1) Rebuild mobile menu layout into clear sections
- Add a dedicated in-menu header (logo/title + close button) at the top.
- Keep this header visible while menu content scrolls.
- Structure menu as:
  - Top: header
  - Middle: contact cards (scrollable when needed)
  - Bottom: primary CTA button (“Appeler”)

2) Remove the “random” bottom WhatsApp icon
- Delete the separate WhatsApp quick-action icon block at the bottom.
- Keep WhatsApp as one of the main contact cards only.

3) Upgrade mobile contact button/card design
- Replace plain rows with richer cards:
  - Strong icon container
  - Label + value hierarchy (e.g., “Téléphone”, number)
  - Better spacing, borders, hover/tap/active states
- Keep phone + WhatsApp links fully tappable with large touch targets.
- Preserve provided numbers and working hours exactly.

4) Fix overlap and missing-header behavior
- Ensure menu content starts below the in-menu header (no visual overlap).
- Use `overflow-y-auto` for content area to prevent clipped UI on small phones.
- Keep safe-area handling (`safe-top`, `safe-bottom`) but apply it to the right containers.

5) Interaction reliability fixes
- Close menu when a contact link/CTA is tapped (`setIsOpen(false)` before navigation behavior).
- Keep backdrop close behavior.
- Ensure desktop navbar behavior remains unchanged (mobile-only changes).

6) Cleanup/warnings
- Convert `WhatsAppIcon` to `React.forwardRef` to remove ref warning from console.
- Remove now-unused imports/variables in `Navbar` (e.g., unused modal hook/imports) to keep component stable.

Technical details
- Keep existing `md:hidden`/desktop behavior intact; only mobile overlay internals change.
- Prefer sticky top header inside overlay + scrollable middle region:
  - wrapper: `h-[100dvh]`
  - header: fixed/sticky section
  - content: `flex-1 overflow-y-auto`
  - footer CTA: pinned bottom area
- Preserve existing contact data:
  - `tel:0528333836`
  - `tel:0528333837`
  - `https://wa.me/212660077768`
  - `Lun-Ven: 9h-18h`

Acceptance checks
- On mobile (390x844 and smaller), opening menu shows a visible header immediately.
- No overlap between header and first contact card.
- No isolated WhatsApp icon floating at bottom.
- Contact cards look intentionally designed (not basic/plain).
- Tapping phone/WhatsApp/Call works and menu closes cleanly.
- Desktop navbar remains unchanged.



## Plan: Language Selection Splash Screen

### What we'll build
A full-screen splash/welcome page at `/` that shows:
- The brand logo (Brain icon + "Junior AI")
- A welcome message
- Three language buttons: **Arabic**, **English**, **French** (with flag icons or native text)
- Selecting a language saves the choice to `localStorage` and navigates to the main landing page

The current landing page (`Index`) will move to a new route (e.g., `/home`), and the splash screen becomes the new `/` route.

### Technical approach

1. **Create `src/contexts/LanguageContext.tsx`**
   - React context providing `language` and `setLanguage`
   - Reads/writes to `localStorage`
   - Default: none (forces user to pick on first visit)

2. **Create `src/pages/Welcome.tsx`**
   - Full-screen centered layout with the brand's gradient background and floating orbs
   - Brand logo at top
   - "Welcome / Bienvenue / مرحبا" heading
   - Three large, elegant language cards/buttons:
     - **العربية** (Arabic)
     - **English**
     - **Français** (French)
   - On click: saves language to context/localStorage, navigates to `/home`
   - Uses framer-motion for entrance animations consistent with the existing design

3. **Update `src/App.tsx` routing**
   - `/` → `Welcome` (new splash screen)
   - `/home` → `Index` (existing landing page)
   - Wrap app with `LanguageProvider`

4. **Auto-redirect logic**
   - If a language is already saved in `localStorage`, the Welcome page auto-redirects to `/home` so returning visitors skip the selector

### Files to create/modify
- **Create**: `src/contexts/LanguageContext.tsx`
- **Create**: `src/pages/Welcome.tsx`
- **Modify**: `src/App.tsx` (add route, wrap provider)


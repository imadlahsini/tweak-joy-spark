

# Fix: Language Page Not Showing

## Problem
The Welcome page (`/`) checks `localStorage` for a saved language. If one exists, it immediately redirects to `/appointment` and returns `null`. Since you've already picked a language before, you'll never see the language selector again.

## Solution
Remove the auto-redirect from the Welcome page. The language selector should always be shown when the user navigates to `/`. The `useEffect` that redirects (lines 34-39) and the early `return null` (line 46) need to be removed. The language selection will still navigate to `/appointment` on click via `handleSelect`.

### Changes — `src/pages/Welcome.tsx`
- Remove the `useEffect` that auto-redirects when `language` is set
- Remove the `if (language) return null;` guard

This way the Welcome page always renders the language cards, regardless of prior selection.


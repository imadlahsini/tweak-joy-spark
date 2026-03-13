

## Persistent Scroll Hint Animation for Date Slider

Replace the one-time nudge with a continuous animated indicator that disappears once the user scrolls.

### Approach: Bouncing Chevron Arrow

Add a small bouncing arrow icon overlaid on the trailing edge of the date slider (right side in LTR, left in RTL). It pulses/bounces horizontally to signal "swipe to see more." Once the user scrolls the slider, it fades out permanently.

### Changes in `src/pages/Appointment.tsx`

1. **Replace `hasNudged` ref** with `hasScrolled` state: `const [hasScrolled, setHasScrolled] = useState(false);`

2. **Remove the nudge useEffect** (lines 166-179) entirely.

3. **Update the existing scroll handler** (inside the fade indicator useEffect) to set `hasScrolled = true` on the first scroll event.

4. **Add a bouncing arrow overlay** inside the slider container (next to the right fade div):
   - An `AnimatePresence`-wrapped `motion.div` shown when `!hasScrolled && showRightFade`
   - Contains a `ChevronRight` (or `ChevronLeft` for RTL) icon
   - Positioned absolutely on the trailing edge, vertically centered
   - Uses framer-motion `animate={{ x: [0, 8, 0] }}` with `repeat: Infinity` for a continuous horizontal bounce
   - Styled with a semi-transparent primary background pill (`bg-primary/80 text-white rounded-full p-1.5 shadow-lg`)
   - Exits with `opacity: 0` transition

5. **Import** `ChevronRight, ChevronLeft` from lucide-react (ChevronLeft may already be unused — just add ChevronRight if needed).

### Result
A persistent, eye-catching bouncing arrow that clearly communicates scrollability, disappearing the moment the user interacts with the slider.


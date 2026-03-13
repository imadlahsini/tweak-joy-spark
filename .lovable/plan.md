

## Auto-scroll to Summary Card on Time Selection

### What
When the user selects a time slot, auto-scroll the page down so the summary card (with date/time details and confirm button) is visible — mirroring the existing behavior when selecting a date.

### Changes in `src/pages/Appointment.tsx`

1. **Add a ref** for the summary card section: `const summarySectionRef = useRef<HTMLDivElement>(null);`

2. **Add a useEffect** that scrolls to the summary card when `selectedTime` changes (similar to the existing date→time scroll on line 118-125):
   ```
   useEffect(() => {
     if (selectedDate && selectedTime && summarySectionRef.current) {
       setTimeout(() => {
         summarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
       }, 400);
     }
   }, [selectedTime]);
   ```

3. **Attach the ref** to the summary card's `motion.div` wrapper (line ~591): add `ref={summarySectionRef}`.

Three lines of new code total.


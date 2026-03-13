

# Better Phone Field with Morocco Country Code

## Current State
The phone field is a plain text input with a placeholder `+212 6XX XXX XXX`. No country flag, no prefix, no formatting.

## Plan

### Changes to `src/pages/Appointment.tsx`

**Add a styled phone input with Morocco flag and +212 prefix baked in:**

1. Replace the plain `<input>` for phone (around line 800-813) with a composite input that has:
   - A non-editable left section showing the Morocco flag emoji (🇲🇦) and `+212` prefix, styled as part of the input with a subtle right border separator
   - The actual input field for the remaining digits only

2. Update state handling:
   - `clientPhone` stores only the local number (without +212)
   - `onChange` strips non-digit characters and limits to 9 digits (Moroccan mobile format)
   - Auto-format display as `6XX XXX XXX` with spaces

3. Update validation:
   - `isPhoneValid` checks for exactly 9 digits (Moroccan numbers) or at least 6 digits to be lenient
   - Update placeholder to `6XX XXX XXX` (since +212 is shown in prefix)

4. Update the confirmation summary (line 863) to display `+212 ${clientPhone}` so the full number shows

5. Update all three language placeholders (lines 50, 79, 108) from `+212 6XX XXX XXX` to `6XX XXX XXX`




# Add Client Details Step (Name & Phone) to Appointment Page

## What We're Building
A beautiful **Step 3: Your Details** glass card that appears after selecting a time slot, collecting the client's name and phone number before they can confirm the booking. The UI will match the existing glass-card aesthetic with polished micro-interactions.

## Changes — Single File: `src/pages/Appointment.tsx`

### 1. Translations
Add keys for all 3 languages:
- `step3` ("Details" / "Détails" / "البيانات")
- `nameLabel`, `namePlaceholder`, `phoneLabel`, `phonePlaceholder`
- `nameRequired`, `phoneRequired` (validation messages)

### 2. State & Logic
- Add `clientName` and `clientPhone` state strings
- Update `currentStep`: 1 = no date, 2 = no time, 3 = no valid name/phone, 4 = ready to confirm
- Add `isFormValid` derived boolean (name ≥ 2 chars trimmed, phone ≥ 6 digits)
- Auto-scroll to details card on time selection (new ref `detailsSectionRef`)
- Move summary scroll to trigger when form becomes valid

### 3. Progress Indicator
- Add a third step circle with a `User` icon between the existing Time and final checkmark
- Second animated connecting line between step 2 and step 3

### 4. New Glass Card — "Your Details"
Matching the existing card style (`bg-card/60 backdrop-blur-2xl border-border/30 rounded-3xl`):
- **Header**: User icon in gradient box + "Your Details" label (same pattern as date/time headers)
- **Name input**: Rounded-xl, glass background, `User` icon prefix, subtle focus glow with primary color, green checkmark animation when valid
- **Phone input**: Same style, `Phone` icon prefix, `type="tel"`, `dir="ltr"` always (even in Arabic), `inputMode="tel"`
- **Entry animation**: `motion.div` slide-up matching time card animation
- **Validation**: Inline error hints that animate in/out with `AnimatePresence`

### 5. Summary Card Update
- Add a new row showing client name and phone (with `User` and `Phone` icons) in the summary divider list
- Summary + confirm button only appear when form is valid

### 6. Confirm Handler
- Include name and phone in the success toast message

### UX Details
- Inputs get a subtle animated green checkmark when valid (spring animation, like checkout form)
- Phone field always renders LTR regardless of page direction
- Auto-focus name field when details card appears
- Confirm button disabled state until form is valid
- Smooth sequential reveal: Date → Time → Details → Summary → Confirm


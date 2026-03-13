

# Rethink Arrow & Reduce Glow on Welcome Language Cards

## Problems
1. **Arrow**: The mobile arrow (`ArrowRight`) sits as a plain icon — looks generic and disconnected. The desktop arrow is invisible until hover (opacity 0) which is odd.
2. **Glow overkill**: The hover shadow uses `0_0_40px` + `0_0_80px` glow (line 169), the flag has a `scale-150 blur-2xl` glow (line 181), the shimmer sweep adds more visual noise, and the animated gradient border compounds it all.

## Changes — `src/pages/Welcome.tsx`

### Arrow redesign
- **Mobile**: Replace the bare `ArrowRight` icon with a small circular container (`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center`) housing a `ChevronRight` icon. Always visible, subtle, clean. On hover: bg becomes `bg-primary/20` and icon shifts slightly right.
- **Desktop**: Replace invisible arrow with a simple `ChevronRight` that's always visible in muted color, becomes primary on hover.

### Reduce glow
- **Card hover shadow** (line 169): Reduce from `0_0_40px...0_0_80px` to a single subtle `0_0_20px_hsl(var(--primary)/0.1)`.
- **Flag glow** (line 181): Remove the `scale-150 blur-2xl` glow div entirely — the flag emoji doesn't need a glow behind it.
- **Shimmer sweep** (lines 171-173): Keep but reduce `via-primary/10` to `via-primary/5`.
- **Animated gradient border** (line 165): Reduce `from-primary/40 via-accent/30` to `from-primary/20 via-accent/15`.


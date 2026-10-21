/**
 * Quick bouncy "pop" (a little bigger, a tiny squish, then back) used when the cats are clicked.
 * Animates `scale`, so it doesn't fight hover effects that use `transform`.
 * Skipped for people who prefer reduced motion.
 */
export function pop(element: HTMLElement): void {
  const reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof element.animate !== 'function' || reduceMotion) return;
  element.animate(
    [{ scale: '1' }, { scale: '1.08' }, { scale: '0.96' }, { scale: '1.02' }, { scale: '1' }],
    { duration: 480, easing: 'ease-out' },
  );
}

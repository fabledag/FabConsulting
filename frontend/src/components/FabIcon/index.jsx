/**
 * Fab Design icon set (public/icons/fab-design/, 32×32 grid, 1.8 stroke).
 *
 * Decorative only: every place that uses one already has a text label, so
 * the image is hidden from assistive tech. `tone="crema"` loads the variant
 * whose stroke is cream, for purple backgrounds — no CSS filters.
 *
 * Sizes from the set's guide: 24 for supporting icons, 32 for the process,
 * 40–48 for workshop cards. Always square, never stretched.
 */
export default function FabIcon({ name, size = 24, tone, className }) {
  const file = tone === 'crema' ? `${name}-crema` : name;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/fab-design/${file}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      // Explicit box so flex/grid parents can't stretch it (`align-items:
      // stretch` only applies while height is auto).
      style={{ display: 'block', flexShrink: 0, width: size, height: size }}
    />
  );
}

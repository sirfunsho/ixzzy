/**
 * Aspect ratios are listed as complete class strings so Tailwind can see them
 * at build time. Pass `null` to let the parent control the size (hero media).
 */
const RATIOS = {
  "3/4": "aspect-[3/4]",
  "4/5": "aspect-[4/5]",
  "5/4": "aspect-[5/4]",
  "21/9": "aspect-[21/9]",
} as const;

export type MediaRatio = keyof typeof RATIOS;

type MediaPlaceholderProps = {
  ratio?: MediaRatio | null;
  /** Mono caption centred on the surface. */
  label?: string;
  /** Technical detail in the bottom-right corner. Defaults to the ratio. */
  caption?: string;
  /** Corner index, e.g. "01". Turns acid when an ancestor `.group` is hovered. */
  index?: string;
  className?: string;
};

/**
 * Stand-in for real product photography and hero video. A near-black surface
 * with an atmospheric wash, film grain and a camera-style crosshair so it reads
 * as a deliberate placeholder rather than a broken asset.
 *
 * Hover behaviour is inherited from an ancestor with the `group` class.
 */
export function MediaPlaceholder({
  ratio = "4/5",
  label = "IMAGE PLACEHOLDER",
  caption,
  index,
  className,
}: MediaPlaceholderProps) {
  const captionText = caption ?? (ratio ? ratio.replace("/", ":") : undefined);

  return (
    <div
      role="img"
      aria-label={index ? `${label} ${index}` : label}
      className={`relative w-full overflow-hidden bg-[#0a0a0a] text-paper ${
        ratio ? RATIOS[ratio] : ""
      } ${className ?? ""}`}
    >
      <span
        aria-hidden
        className="ix-wash absolute inset-0 block transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
      />
      <span
        aria-hidden
        className="ix-grain absolute inset-0 block opacity-25 mix-blend-overlay"
      />

      {/* Crosshair + caption, centred. */}
      <span
        aria-hidden
        className="ix-rise absolute inset-0 flex flex-col items-center justify-center gap-4"
      >
        <span className="relative block h-3.5 w-3.5">
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-paper/30" />
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-paper/30" />
        </span>
        <span className="font-mono text-[9px] tracking-[0.45em] text-paper/40 uppercase">
          {label}
        </span>
      </span>

      {index ? (
        <span
          aria-hidden
          className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.3em] text-paper/40 transition-colors duration-500 group-hover:text-acid md:top-5 md:left-5"
        >
          {index}
        </span>
      ) : null}

      {captionText ? (
        <span
          aria-hidden
          className="absolute right-4 bottom-4 font-mono text-[9px] tracking-[0.3em] text-paper/25 uppercase md:right-5 md:bottom-5"
        >
          {captionText}
        </span>
      ) : null}

      {/* Single restrained hover: a faint sheet of light lifts from the floor. */}
      <span
        aria-hidden
        className="absolute inset-0 block origin-bottom scale-y-0 bg-paper/5 transition-transform duration-700 ease-out group-hover:scale-y-100"
      />
    </div>
  );
}
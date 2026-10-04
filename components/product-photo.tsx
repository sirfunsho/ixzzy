import Image from "next/image";
import { MediaPlaceholder, type MediaRatio } from "@/components/media-placeholder";

const ASPECT_CLASSES: Record<MediaRatio, string> = {
  "3/4": "aspect-[3/4]",
  "4/5": "aspect-[4/5]",
  "5/4": "aspect-[5/4]",
  "21/9": "aspect-[21/9]",
};

type ProductPhotoProps = {
  src?: string;
  alt: string;
  ratio?: MediaRatio;
  index?: string;
  placeholderLabel?: string;
  sizes?: string;
  priority?: boolean;
  imageClassName?: string;
  className?: string;
};

/** A transparent product frame that inherits its section's background. */
export function ProductPhoto({
  src,
  alt,
  ratio = "4/5",
  index,
  placeholderLabel = "PRODUCT IMAGE",
  sizes = "(min-width: 768px) 33vw, 100vw",
  priority = false,
  imageClassName = "",
  className = "",
}: ProductPhotoProps) {
  return (
    <div className={`group relative w-full overflow-hidden ${ASPECT_CLASSES[ratio]} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02] ${src.toLowerCase().endsWith(".jpg") ? "mix-blend-multiply" : ""} ${imageClassName}`}
        />
      ) : (
        <MediaPlaceholder ratio={null} label={placeholderLabel} className="h-full w-full" />
      )}
      {index ? (
        <span aria-hidden className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.3em] text-label md:top-5 md:left-5">
          {index}
        </span>
      ) : null}
    </div>
  );
}

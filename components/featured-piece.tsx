import { ProductPhoto } from "@/components/product-photo";
import type { CollectionPiece as CollectionPieceData } from "@/lib/catalog";

type FeaturedPieceProps = {
  piece: CollectionPieceData;
  sizes?: string;
};

/**
 * Larger collection tile. Same construction as the product card, scaled up and
 * with the category carried into the caption line.
 *
 */
export function FeaturedPiece({ piece, sizes = "(min-width: 1024px) 50vw, 100vw" }: FeaturedPieceProps) {
  return (
    <article className="group">
      <ProductPhoto
        src={piece.images?.[0]}
        alt={piece.name}
        ratio={piece.ratio}
        index={piece.index}
        placeholderLabel={piece.category}
        sizes={sizes}
        imageClassName={
          piece.slug === "flame-jersey" ? "p-[4%]"
            : "scale-[0.86]"
        }
      />

      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <h3 className="text-xs tracking-[0.2em] text-fg uppercase transition-colors duration-500 group-hover:text-acid md:text-sm">
          {piece.name}
        </h3>
        <p className="font-mono text-[10px] tracking-[0.3em] text-label uppercase">
          {piece.price}
        </p>
      </div>
    </article>
  );
}

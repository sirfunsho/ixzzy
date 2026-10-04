import { Container } from "@/components/container";
import { FeaturedPiece } from "@/components/featured-piece";
import { Section } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { FEATURED } from "@/lib/catalog";

export function FeaturedCollection() {
  const [anchor, ...supportingPieces] = FEATURED;

  return (
    <Section id="collection" tone="dark" className="py-16 md:py-24">
      <Container>
        <SectionHeading label="THE COLLECTION" index="002" title="FEATURED" />

        {anchor ? (
          <div className="mt-12 md:mt-16">
            <FeaturedPiece
              piece={anchor}
              sizes="(min-width: 1280px) 1216px, calc(100vw - 3rem)"
            />
          </div>
        ) : null}

        <div className="mx-auto mt-12 grid w-full max-w-xs grid-cols-1 gap-12 sm:max-w-sm md:mt-16 md:max-w-none md:grid-cols-2 md:gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          {supportingPieces.map((piece, index) => (
            <div
              key={piece.id}
              className={index === 0
                ? "md:col-span-1 lg:col-span-4 lg:col-start-2"
                : "md:col-span-1 lg:col-span-4 lg:col-start-7"}
            >
              <FeaturedPiece
                piece={piece}
                sizes="(min-width: 1280px) 400px, (min-width: 768px) 34vw, 90vw"
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

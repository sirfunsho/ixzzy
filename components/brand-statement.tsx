import { Container } from "@/components/container";
import { Section } from "@/components/section";

/**
 * Black brand band: type only, no imagery. The acid full stop is the one accent
 * in the section — a disruption, not decoration.
 */
export function BrandStatement() {
  return (
    <Section id="brand" tone="dark" className="py-24 md:py-40">
      <Container>
        <h2 className="max-w-[18ch] text-[clamp(2.25rem,8.5vw,7.5rem)] leading-[0.92] font-medium tracking-[-0.04em] text-fg uppercase">
          <span className="block">MADE IN NIGERIA.</span>
          <span className="block">
            MADE FOR NOW<span className="text-accent">.</span>
          </span>
        </h2>
      </Container>
    </Section>
  );
}
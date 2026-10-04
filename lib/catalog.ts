import type { MediaRatio } from "@/components/media-placeholder";

/** The only collection in the catalogue right now. */
export const COLLECTION = "HEAT//01";

/**
 * A catalogue entry. One product, with its colours and sizes held as variants —
 * a colour is never a separate product.
 *
 * This is the Supabase-shaped record: `PRODUCTS` maps 1:1 to a future
 * `products` table, and `colours` / `sizes` map to child tables keyed by
 * product id. Only the products the homepage shows also carry a display index,
 * which is assigned by the section rendering them rather than stored here.
 */
export type CatalogueProduct = {
  id: string;
  /** URL segment for the product route and its image directory. */
  slug: string;
  name: string;
  price: string;
  description: string;
  sizes: readonly string[];
  colours: readonly string[];
  /**
   * Primary photograph, as a path under /public. Optional because not every
   * product has imagery yet — those fall back to the media placeholder.
   */
  images?: readonly string[];
  /** Model/editorial images used only in product galleries and hover transitions. */
  modelImages?: readonly string[];
};

/** A catalogue entry placed in a section, so it may carry a corner index. */
export type Product = CatalogueProduct & {
  /**
   * Corner index printed on placeholder media, e.g. "01". Assigned by the
   * section that places the product; the raw catalogue has no index.
   */
  index?: string;
};

export type CollectionPiece = Product & {
  category: string;
  ratio: MediaRatio;
};

const M = ["M", "L", "XL"] as const;
const ONE_SIZE = ["One Size"] as const;

/**
 * The full HEAT//01 range — the single source of truth.
 *
 * Every entry is one product. Colours and sizes are variants held on that
 * product; no colour gets its own entry. Prices are display strings for now and
 * will become integer naira on the way into Supabase.
 *
 * Colours are stored exactly as supplied — no hex values, since the brand
 * palette does not define every colour named here.
 */
export const PRODUCTS: readonly CatalogueProduct[] = [
  {
    id: "ix-001",
    slug: "heat-tee",
    name: "HEAT TEE",
    price: "₦ 50,000",
    description: "A direct expression of HEAT//01. Clean lines, charged presence, no excess.",
    sizes: M,
    colours: ["White", "Black"],
    images: ["/products/display/heat-tee/front.jpg", "/products/display/heat-tee/back.jpg"],
  },
  {
    id: "ix-002",
    slug: "monster-tee",
    name: "MONSTER TEE",
    price: "₦ 50,000",
    description: "A bold mark from the HEAT//01 collection. Made for a city that never stands still.",
    sizes: M,
    colours: ["White", "Black"],
    images: [
      "/products/display/monster-tee/front.png",
      "/products/display/monster-tee/back.png",
    ],
    modelImages: [
      "/products/monster-tee/model-front.png",
      "/products/monster-tee/model-back.png",
      "/products/monster-tee/model-closeup.png",
    ],
  },
  {
    id: "ix-003",
    slug: "combat-jacket",
    name: "COMBAT JACKET",
    price: "₦ 150,000",
    description: "Utility in a sharp blue signal. A considered layer from HEAT//01.",
    sizes: M,
    colours: ["Blue"],
    images: ["/products/display/combat-jacket/front.png", "/products/display/combat-jacket/back.png"],
    modelImages: ["/products/combat-jacket/model-front.png", "/products/combat-jacket/model-back.png"],
  },
  {
    id: "ix-004",
    slug: "ignition-hoodie",
    name: "IGNITION HOODIE",
    price: "₦ 90,000",
    description: "A flash of ignition in the HEAT//01 line. Colour with intent.",
    sizes: M,
    colours: ["Yellow"],
    images: ["/products/display/ignition-hoodie/front.png", "/products/display/ignition-hoodie/back.png"],
    modelImages: [
      "/products/ignition-hoodie/model-front.png",
      "/products/ignition-hoodie/model-back.png",
      "/products/ignition-hoodie/model-far.png",
    ],
  },
  {
    id: "ix-005",
    slug: "rush-tank",
    name: "RUSH TANK",
    price: "₦ 50,000",
    description: "An unfiltered HEAT//01 statement. Black, direct, ready for the rush.",
    sizes: M,
    colours: ["Black"],
    images: ["/products/display/rush-tank/front.png", "/products/display/rush-tank/back.png"],
    modelImages: [
      "/products/rush-tank/model-front.png",
      "/products/rush-tank/model-back.png",
      "/products/rush-tank/model-closeup.png",
      "/products/rush-tank/model-back-closeup.png",
    ],
  },
  {
    id: "ix-006",
    slug: "tactical-cap",
    name: "TACTICAL CAP",
    price: "₦ 40,000",
    description: "A clean finishing mark from HEAT//01. Kept simple and focused.",
    sizes: ONE_SIZE,
    colours: ["Black"],
    images: [
      "/products/display/tactical-cap/front.png",
      "/products/display/tactical-cap/side.png",
      "/products/display/tactical-cap/back.png",
    ],
    modelImages: ["/products/tactical-cap/model-front.png", "/products/tactical-cap/model-side.png"],
  },
  {
    id: "ix-007",
    slug: "burn-trucker",
    name: "BURN TRUCKER",
    price: "₦ 40,000",
    description: "A spark from the HEAT//01 line. Choose black or yellow and make it yours.",
    sizes: ONE_SIZE,
    colours: ["Black", "Yellow"],
    images: [
      "/products/display/burn-trucker/front-black.jpg",
      "/products/display/burn-trucker/front-yellow.jpg",
    ],
    modelImages: [
      "/products/burn-trucker/model-front.png",
      "/products/burn-trucker/model-closeup.png",
    ],
  },
  {
    id: "ix-008",
    slug: "ignition-beanie",
    name: "IGNITION BEANIE",
    price: "₦ 60,000",
    description: "A low-key signal from HEAT//01. Black, minimal, unmistakably IXZZY.",
    sizes: ONE_SIZE,
    colours: ["Black"],
    images: ["/products/display/ignition-beanie/front.png", "/products/display/ignition-beanie/back.png"],
    modelImages: [
      "/products/ignition-beanie/model-front.png",
      "/products/ignition-beanie/model-closeup.png",
    ],
  },
  {
    id: "ix-009",
    slug: "combat-jort",
    name: "COMBAT JORT",
    price: "₦ 80,000",
    description: "A utilitarian statement in the HEAT//01 collection. Clear, considered, direct.",
    sizes: M,
    colours: ["Black"],
    images: ["/products/display/combat-jort/front.png", "/products/display/combat-jort/back.png"],
    modelImages: ["/products/combat-jort/model-front.png"],
  },
  {
    id: "ix-010",
    slug: "tactical-short",
    name: "TACTICAL SHORT",
    price: "₦ 60,000",
    description: "A focused form from HEAT//01. Nothing extra, all intent.",
    sizes: M,
    colours: ["Black"],
    images: ["/products/display/tactical-short/front.png", "/products/display/tactical-short/back.png"],
    modelImages: ["/products/tactical-short/model-front.png"],
  },
  {
    id: "ix-011",
    slug: "heat-longsleeve",
    name: "HEAT LONGSLEEVE",
    price: "₦ 70,000",
    description: "A long line of HEAT//01. Quiet in form, strong in presence.",
    sizes: M,
    colours: ["Black"],
    images: ["/products/display/heat-longsleeve/front.png", "/products/display/heat-longsleeve/back.png"],
    modelImages: [
      "/products/heat-longsleeve/model-front.png",
      "/products/heat-longsleeve/model-closeup.png",
    ],
  },
  {
    id: "ix-012",
    slug: "steel-jean",
    name: "STEEL JEAN",
    price: "₦ 150,000",
    description: "A steady foundation for HEAT//01. Black with a clear point of view.",
    sizes: M,
    colours: ["Black"],
    images: ["/products/display/steel-jean/front.png", "/products/display/steel-jean/back.png"],
    modelImages: ["/products/steel-jean/model-front.png"],
  },
  {
    id: "ix-013",
    slug: "flame-jersey",
    name: "FLAME JERSEY",
    price: "₦ 90,000",
    description: "A flash of heat from the HEAT//01 collection. The IXZZY signal, turned up.",
    sizes: M,
    colours: ["Black"],
    images: ["/products/display/flame-jersey/front.png", "/products/display/flame-jersey/back.png"],
    modelImages: [
      "/products/flame-jersey/model-front.png",
      "/products/flame-jersey/model-back.png",
      "/products/flame-jersey/model-closeup.png",
    ],
  },
] as const;

function byId(id: string): CatalogueProduct {
  const product = PRODUCTS.find((item) => item.id === id);

  if (!product) {
    throw new Error(`Unknown catalogue id: ${id}`);
  }

  return product;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Places catalogue entries in a section and assigns their corner index. */
function place(ids: readonly string[]): Product[] {
  return ids.map((id, position) => ({ ...byId(id), index: pad(position + 1) }));
}

/** Larger collection tiles carry their position within the section. */
function placeFeatured(
  ids: readonly string[],
  layout: readonly { category: string; ratio: MediaRatio }[],
): CollectionPiece[] {
  return ids.map((id, position) => ({
    ...byId(id),
    index: `${pad(position + 1)} / ${pad(ids.length)}`,
    category: layout[position].category,
    ratio: layout[position].ratio,
  }));
}

/**
 * Homepage — New Arrivals. Deliberately exactly three, shown as one row so the
 * section never becomes a two-row scroll. A selection from PRODUCTS, not a
 * second list of products.
 */
export const NEW_ARRIVALS: Product[] = place(["ix-008", "ix-009", "ix-011", "ix-004"]);

/**
 * Homepage — Featured. Three tiles for the asymmetric editorial grid.
 *
 * `category` is the caption printed on the media surface. It carries the
 * collection name rather than a garment class, because no category data exists
 * for these products and inventing one is not appropriate.
 */
export const FEATURED: CollectionPiece[] = placeFeatured(
  ["ix-013", "ix-010", "ix-003"],
  [
    { category: COLLECTION, ratio: "21/9" },
    { category: COLLECTION, ratio: "4/5" },
    { category: COLLECTION, ratio: "4/5" },
  ],
);

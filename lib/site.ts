export const SITE = {
  name: "IXZZY",
  tagline: "Life is IXZZY",
  city: "LAGOS, NIGERIA",
  year: "2026",
} as const;

export type SiteLink = {
  label: string;
  href: string;
  /** Rendered directly after the label, in acid yellow. */
  accent?: string;
  external?: boolean;
};

/**
 * The cart opens a site-wide drawer. Account and orders remain future destinations.
 */
export const PRIMARY_NAV: SiteLink[] = [
  { label: "SHOP", href: "/shop" },
  { label: "ACCOUNT", href: "/account" },
  { label: "CART", href: "/checkout" },
];

export const FOOTER_NAV: SiteLink[] = [
  { label: "SHOP", href: "/shop" },
  { label: "ABOUT", href: "#brand" },
  { label: "ACCOUNT", href: "/account" },
  { label: "ORDERS", href: "#orders" },
];

export const FOOTER_ELSEWHERE: SiteLink[] = [
  { label: "INSTAGRAM", href: "#instagram" },
];

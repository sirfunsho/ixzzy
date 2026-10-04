export function priceInNaira(price: string) {
  return Number(price.replace(/[^\d]/g, ""));
}

export function formatNaira(amount: number) {
  return `₦ ${amount.toLocaleString("en-NG")}`;
}

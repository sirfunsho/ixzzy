import { redirect } from "next/navigation";

/** The cart now lives in the global drawer; send legacy /cart visits to checkout. */
export default function CartRedirect() {
  redirect("/checkout");
}

import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useRef } from "react";
import { ActivityIndicator, AppState, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "../lib/api";
import { useAuth } from "../providers/auth-provider";
import { CartLine, useCart } from "../providers/cart-provider";
import { BrandHeader, colors, ui } from "../components/ui";

type Product = { slug: string; name: string; price: number; displayPrice: string; images: string[] };
const CART_POLL_INTERVAL_MS = 4_000;

export default function CartScreen() {
  const { user } = useAuth();
  const { lines, loading, saving, error, itemCount, refreshCart, changeQuantity, removeLine } = useCart();
  const [catalog, setCatalog] = React.useState<Product[]>([]);
  const refreshInProgress = useRef(false);
  useFocusEffect(useCallback(() => {
    if (!user) return;

    let isFocused = true;
    const refreshIfIdle = async () => {
      if (!isFocused || refreshInProgress.current) return;
      refreshInProgress.current = true;
      try {
        await refreshCart();
      } finally {
        refreshInProgress.current = false;
      }
    };

    // Load immediately when the cart screen opens.
    void refreshIfIdle();

    // Poll only while this screen is focused and the app is in the foreground.
    const timer = setInterval(() => {
      if (AppState.currentState === "active") void refreshIfIdle();
    }, CART_POLL_INTERVAL_MS);
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void refreshIfIdle();
    });

    return () => {
      isFocused = false;
      clearInterval(timer);
      appStateSubscription.remove();
    };
  }, [refreshCart, user]));

  React.useEffect(() => {
    void fetch(`${API_BASE_URL}/api/products`).then((response) => response.json())
      .then((result: { products?: Product[] }) => setCatalog(result.products ?? []))
      .catch(() => undefined);
  }, []);

  const products = new Map(catalog.map((product) => [product.slug, product]));
  const total = lines.reduce((sum, line) => sum + (products.get(line.slug)?.price ?? 0) * line.quantity, 0);

  return (
    <View style={ui.screen}>
      <BrandHeader count={itemCount} />
      <ScrollView contentContainerStyle={ui.scroll}>
        <Text style={ui.eyebrow}>YOUR SELECTION</Text>
        <Text style={ui.title}>The cart.</Text>
        {!user ? (
          <View style={styles.empty}>
            <Text style={ui.body}>Sign in to see the cart you share with the website.</Text>
            <View style={{ marginTop: 20 }}><Link href="/account" asChild><Pressable style={styles.signIn}><Text style={styles.signInText}>SIGN IN TO YOUR ACCOUNT</Text></Pressable></Link></View>
          </View>
        ) : null}
        {user && loading && lines.length === 0 ? <ActivityIndicator style={{ marginTop: 28 }} color={colors.ink} /> : null}
        {user && error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void refreshCart()}><Text style={styles.retry}>TRY AGAIN</Text></Pressable></View> : null}
        {user && !loading && !error && lines.length === 0 ? (
          <View style={styles.empty}><Text style={ui.body}>Your saved cart is empty.</Text><Link href="/" style={styles.continue}>CONTINUE SHOPPING →</Link></View>
        ) : null}
        {user && lines.map((line) => <CartRow key={`${line.slug}::${line.colour}::${line.size}`} line={line} product={products.get(line.slug)} disabled={saving} onChange={changeQuantity} onRemove={removeLine} />)}
        {user && lines.length > 0 ? (
          <View style={styles.totalBox}>
            <View style={ui.row}><Text style={styles.totalLabel}>SUBTOTAL</Text><Text style={styles.totalPrice}>₦ {total.toLocaleString("en-NG")}</Text></View>
            <Text style={styles.disclaimer}>This is your shared saved cart. Checkout works on both phone and website.</Text>
            <View style={{ marginTop: 16 }}><Link href="/checkout" asChild><Pressable style={styles.checkoutButton}><Text style={styles.continueButtonText}>CHECKOUT →</Text></Pressable></Link></View>
            <View style={{ marginTop: 10 }}><Link href="/" asChild><Pressable style={styles.continueButton}><Text style={styles.continueButtonText}>CONTINUE SHOPPING</Text></Pressable></Link></View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function CartRow({ line, product, disabled, onChange, onRemove }: {
  line: CartLine; product?: Product; disabled: boolean;
  onChange: (line: CartLine, quantity: number) => Promise<void>;
  onRemove: (line: CartLine) => Promise<void>;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.thumb}>
        {product?.images[0] ? <Image source={{ uri: `${API_BASE_URL}${product.images[0]}` }} style={styles.image} resizeMode="cover" alt={product.name} /> : null}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{product?.name ?? line.slug.replaceAll("-", " ").toUpperCase()}</Text>
        <Text style={styles.variant}>{line.colour} · {line.size}</Text>
        <Text style={styles.itemPrice}>{product?.displayPrice ?? ""}</Text>
        <View style={styles.actions}>
          <Pressable disabled={disabled || line.quantity <= 1} onPress={() => void onChange(line, line.quantity - 1)} style={styles.quantity}><Text style={styles.quantityText}>−</Text></Pressable>
          <Text style={styles.quantityNumber}>{line.quantity}</Text>
          <Pressable disabled={disabled || line.quantity >= 99} onPress={() => void onChange(line, line.quantity + 1)} style={styles.quantity}><Text style={styles.quantityText}>+</Text></Pressable>
          <Pressable disabled={disabled} onPress={() => void onRemove(line)}><Text style={styles.remove}>REMOVE</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 18, marginTop: 24 },
  signIn: { minHeight: 48, backgroundColor: colors.ink, justifyContent: "center", alignItems: "center" },
  signInText: { color: colors.card, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  item: { flexDirection: "row", gap: 13, paddingVertical: 17, borderBottomWidth: 1, borderColor: colors.line },
  thumb: { width: 84, height: 108, backgroundColor: "#e7e5dd" },
  image: { width: "100%", height: "100%" },
  itemInfo: { flex: 1, justifyContent: "center" },
  itemName: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  variant: { color: colors.muted, fontSize: 11, marginTop: 5 },
  itemPrice: { color: colors.ink, fontSize: 12, marginTop: 8 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  quantity: { width: 30, height: 30, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  quantityText: { color: colors.ink, fontSize: 17 },
  quantityNumber: { color: colors.ink, fontSize: 12, minWidth: 12, textAlign: "center" },
  remove: { color: colors.muted, fontSize: 9, letterSpacing: 0.9, marginLeft: 4 },
  totalBox: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 17, marginTop: 20 },
  totalLabel: { color: colors.muted, fontSize: 10, letterSpacing: 1.1 },
  totalPrice: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  disclaimer: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 12 },
  continue: { color: colors.ink, fontSize: 10, letterSpacing: 1.1, fontWeight: "800", marginTop: 20 },
  continueButton: { minHeight: 50, backgroundColor: colors.yellow, justifyContent: "center", alignItems: "center" },
  checkoutButton: { minHeight: 50, backgroundColor: colors.ink, justifyContent: "center", alignItems: "center" },
  continueButtonText: { color: colors.ink, fontSize: 12, fontWeight: "800", letterSpacing: 0.4 },
  errorBox: { backgroundColor: "#fff3f1", padding: 14, marginTop: 24 },
  errorText: { color: colors.red, fontSize: 13, lineHeight: 18 },
  retry: { color: colors.ink, fontSize: 10, letterSpacing: 1, fontWeight: "800", marginTop: 12 },
});

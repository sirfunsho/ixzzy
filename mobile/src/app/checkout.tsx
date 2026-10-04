import { Link } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL } from "../lib/api";
import { apiRequest } from "../lib/api";
import { useAuth } from "../providers/auth-provider";
import { useCart } from "../providers/cart-provider";
import { BrandHeader, ErrorMessage, FormInput, PrimaryButton, colors, ui } from "../components/ui";

type Product = { slug: string; name: string; price: number; displayPrice: string };

export default function CheckoutScreen() {
  const { user, token } = useAuth();
  const { lines, itemCount, clearCart } = useCart();
  const [catalog, setCatalog] = React.useState<Product[]>([]);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  React.useEffect(() => {
    void fetch(`${API_BASE_URL}/api/products`).then((r) => r.json())
      .then((result: { products?: Product[] }) => setCatalog(result.products ?? []))
      .catch(() => undefined);
  }, []);

  const initializedRef = useRef(false);
  // Prefill name/email from the signed-in account once it loads.
  React.useEffect(() => {
    if (user && !initializedRef.current) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      initializedRef.current = true;
    }
  }, [user]);

  const prices = new Map(catalog.map((p) => [p.slug, p]));
  const subtotal = lines.reduce((sum, line) => sum + (prices.get(line.slug)?.price ?? 0) * line.quantity, 0);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (lines.length === 0) throw new Error("Your cart is empty.");
      const result = await apiRequest<{ reference: string }>(
        "/api/orders",
        {
          method: "POST",
          body: JSON.stringify({
            customer: { name, email, phone, address, city, state, note },
            lines: lines.map(({ slug, colour, size, quantity }) => ({ slug, colour, size, quantity })),
          }),
        },
        token,
      );
      setReference(result.reference);
      await clearCart().catch(() => undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Order could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={ui.screen}>
      <BrandHeader count={itemCount} />
      <ScrollView contentContainerStyle={ui.scroll} keyboardShouldPersistTaps="handled">
        <Text style={ui.eyebrow}>YOUR SELECTION</Text>
        <Text style={ui.title}>Checkout.</Text>
        {reference ? (
          <View style={styles.panel}>
            <Text style={styles.doneTitle}>Request complete.</Text>
            <Text style={ui.body}>Thank you, {name}. Keep your reference:</Text>
            <Text style={styles.ref}>{reference}</Text>
            <Text style={[ui.body, { marginTop: 8 }]}>Payment is not taken yet. Delivery will be confirmed separately.</Text>
            <View style={{ marginTop: 20 }}>
              <Link href="/" asChild>
                <Pressable style={styles.continueButton}><Text style={styles.continueButtonText}>CONTINUE SHOPPING</Text></Pressable>
              </Link>
            </View>
          </View>
        ) : (
          <View style={ui.section}>
            <Text style={styles.label}>FULL NAME</Text>
            <FormInput value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" />
            <Text style={[styles.label, { marginTop: 14 }]}>EMAIL</Text>
            <FormInput value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Text style={[styles.label, { marginTop: 14 }]}>PHONE</Text>
            <FormInput value={phone} onChangeText={setPhone} placeholder="080..." keyboardType="phone-pad" autoComplete="tel" />
            <Text style={[styles.label, { marginTop: 14 }]}>DELIVERY ADDRESS</Text>
            <FormInput value={address} onChangeText={setAddress} placeholder="Street address" />
            <Text style={[styles.label, { marginTop: 14 }]}>CITY</Text>
            <FormInput value={city} onChangeText={setCity} placeholder="City" />
            <Text style={[styles.label, { marginTop: 14 }]}>STATE</Text>
            <FormInput value={state} onChangeText={setState} placeholder="State" />
            <Text style={[styles.label, { marginTop: 14 }]}>NOTE (OPTIONAL)</Text>
            <FormInput value={note} onChangeText={setNote} placeholder="Delivery note" />
            <View style={styles.summary}>
              <Text style={styles.summaryText}>{itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"} · SUBTOTAL ₦ {subtotal.toLocaleString("en-NG")}</Text>
              <Text style={styles.hint}>Payment not active yet — submitting saves the order request only.</Text>
            </View>
            <ErrorMessage>{error}</ErrorMessage>
            <View style={{ marginTop: 16 }}>
              {busy ? <ActivityIndicator color={colors.ink} /> : <PrimaryButton title="SUBMIT ORDER REQUEST" onPress={() => void submit()} />}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 10, letterSpacing: 1.4, fontWeight: "700", marginBottom: 7 },
  panel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 18, marginTop: 24 },
  doneTitle: { color: colors.ink, fontSize: 19, fontWeight: "700", marginBottom: 8 },
  ref: { color: colors.ink, fontSize: 13, fontWeight: "800", letterSpacing: 1, marginTop: 10 },
  summary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 14, marginTop: 20 },
  summaryText: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 8 },
  continueButton: { minHeight: 50, backgroundColor: colors.yellow, justifyContent: "center", alignItems: "center" },
  continueButtonText: { color: colors.ink, fontSize: 12, fontWeight: "800", letterSpacing: 0.4 },
});

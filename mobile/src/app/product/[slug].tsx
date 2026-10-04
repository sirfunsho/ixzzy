import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL, apiRequest } from "../../lib/api";
import { useAuth } from "../../providers/auth-provider";
import { useCart } from "../../providers/cart-provider";
import { BrandHeader, ChoiceRow, ErrorMessage, PrimaryButton, colors, ui } from "../../components/ui";

type Product = {
  slug: string; name: string; price: number; displayPrice: string; description: string;
  sizes: string[]; colours: string[]; images: string[];
};

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const { itemCount, addLine, saving } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [colour, setColour] = useState("");
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void apiRequest<{ products: Product[] }>("/api/products")
      .then(({ products }) => {
        const found = products.find((item) => item.slug === slug) ?? null;
        if (active) {
          setProduct(found);
          setColour(found?.colours[0] ?? "");
          setSize(found?.sizes[0] ?? "");
        }
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Product could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  async function handleAdd() {
    if (!product || !user) return;
    setError(null);
    setNotice(null);
    try {
      await addLine({ slug: product.slug, colour, size });
      setNotice("Added to your shared cart.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This item could not be added.");
    }
  }

  return (
    <View style={ui.screen}>
      <BrandHeader count={itemCount} />
      <ScrollView contentContainerStyle={ui.scroll}>
        {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.ink} /> : null}
        {error && !product ? <ErrorMessage>{error}</ErrorMessage> : null}
        {product ? <>
          {product.images.map((image) => <Image key={image} source={{ uri: `${API_BASE_URL}${image}` }} style={styles.photo} resizeMode="cover" alt={`${product.name} product image`} />)}
          <Text style={[ui.eyebrow, { marginTop: 22 }]}>HEAT//01</Text>
          <Text style={ui.title}>{product.name}</Text>
          <Text style={styles.price}>{product.displayPrice}</Text>
          <Text style={[ui.body, { marginTop: 14 }]}>{product.description}</Text>
          <Text style={styles.label}>COLOUR</Text>
          <ChoiceRow values={product.colours} selected={colour} onSelect={setColour} />
          <Text style={styles.label}>SIZE</Text>
          <ChoiceRow values={product.sizes} selected={size} onSelect={setSize} />
          {!user ? <View style={styles.signInNote}><Text style={ui.body}>Sign in to add items to your shared cart.</Text><Link href="/account" style={styles.signInLink}>SIGN IN →</Link></View> : null}
          {user ? <View style={{ marginTop: 22 }}><PrimaryButton title="ADD TO CART" loading={saving} onPress={() => void handleAdd()} /></View> : null}
          {notice ? <Text style={styles.notice}>{notice} <Link href="/cart" style={styles.signInLink}>VIEW CART →</Link></Text> : null}
          <ErrorMessage>{error}</ErrorMessage>
        </> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: "100%", aspectRatio: 0.82, backgroundColor: "#e7e5dd", marginBottom: 10 },
  price: { color: colors.ink, fontSize: 16, fontWeight: "700", marginTop: 8 },
  label: { color: colors.muted, fontSize: 10, letterSpacing: 1.4, fontWeight: "700", marginTop: 24, marginBottom: 9 },
  signInNote: { padding: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, marginTop: 22 },
  signInLink: { color: colors.ink, fontSize: 10, letterSpacing: 1, fontWeight: "800", marginTop: 12 },
  notice: { color: colors.ink, fontSize: 12, marginTop: 16 },
});

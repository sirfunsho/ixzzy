import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL, apiRequest } from "../lib/api";
import { useCart } from "../providers/cart-provider";
import { BrandHeader, colors, ui } from "../components/ui";

type Product = {
  slug: string; name: string; price: number; displayPrice: string; description: string;
  sizes: string[]; colours: string[]; images: string[];
};

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { itemCount } = useCart();

  useEffect(() => {
    let active = true;
    void apiRequest<{ products: Product[] }>("/api/products")
      .then((result) => { if (active) setProducts(result.products); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Shop could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <View style={ui.screen}>
      <BrandHeader count={itemCount} />
      <ScrollView contentContainerStyle={ui.scroll}>
        <Text style={ui.eyebrow}>HEAT//01 — THE COLLECTION</Text>
        <Text style={ui.title}>Life is IXZZY<Text style={{ color: colors.yellow }}>.</Text></Text>
        <Text style={[ui.body, { marginTop: 7 }]}>Made for the days that move differently.</Text>
        <View style={ui.section}>
          {loading ? <Text style={ui.body}>Loading the collection…</Text> : null}
          {error ? <Text style={styles.message}>{error}</Text> : null}
          <View style={styles.grid}>
            {products.map((product) => (
              <Link key={product.slug} href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} asChild>
                <Pressable style={styles.product}>
                  <View style={styles.photoFrame}>
                    {product.images[0] ? <Image source={{ uri: `${API_BASE_URL}${product.images[0]}` }} style={styles.photo} resizeMode="cover" alt={product.name} />
                      : <View style={styles.noPhoto}><Text style={styles.noPhotoText}>IXZZY.</Text></View>}
                  </View>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.displayPrice}</Text>
                  <Text style={styles.productAction}>VIEW PIECE ↗</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
        <Link href="/cart" style={styles.cartLink}>OPEN YOUR CART ({itemCount}) →</Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  product: { width: "48%", flexGrow: 1, marginBottom: 18 },
  photoFrame: { width: "100%", aspectRatio: 0.78, backgroundColor: "#e7e5dd", overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  noPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  noPhotoText: { color: colors.muted, fontWeight: "800", letterSpacing: 2 },
  productName: { color: colors.ink, fontWeight: "800", fontSize: 12, marginTop: 9 },
  productPrice: { color: colors.ink, fontSize: 12, marginTop: 3 },
  productAction: { color: colors.muted, fontSize: 9, letterSpacing: 1, marginTop: 8 },
  cartLink: { color: colors.ink, fontSize: 11, letterSpacing: 1.2, fontWeight: "800", paddingVertical: 20 },
  message: { color: colors.ink, fontSize: 14, marginBottom: 14 },
});

import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../providers/auth-provider";
import { useCart } from "../providers/cart-provider";
import { BrandHeader, ErrorMessage, colors, ui } from "../components/ui";

// Landing page for ixzzy://auth?code=... after browser Google login.
// Standalone Android opens this route instead of returning the URL to the
// browser session, so we finish the swap here instead of showing "unmatched route".
export default function AuthCallbackScreen() {
  const { code } = useLocalSearchParams<{ code?: string | string[] }>();
  const { user, signInWithCode } = useAuth();
  const { itemCount } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    const value = Array.isArray(code) ? code[0] : code;
    if (!value) {
      void (async () => setWorking(false))();
      return;
    }
    if (doneRef.current) return;
    doneRef.current = true;
    void (async () => {
      setError(null);
      try {
        await signInWithCode(value);
        router.replace("/");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Google sign-in could not be completed.");
      } finally {
        setWorking(false);
      }
    })();
  }, [code, signInWithCode]);

  return (
    <View style={ui.screen}>
      <BrandHeader count={itemCount} />
      <View style={ui.scroll}>
        <Text style={ui.eyebrow}>GOOGLE SIGN-IN</Text>
        <Text style={ui.title}>One moment.</Text>
        {working ? <ActivityIndicator style={{ marginTop: 24 }} color={colors.ink} /> : null}
        {!working && user ? (
          <Text style={[ui.body, { marginTop: 16 }]}>Signed in as {user.email}. Taking you to the shop…</Text>
        ) : null}
        <ErrorMessage>{error}</ErrorMessage>
        {!working ? (
          <Link href="/account" style={{ color: colors.ink, fontSize: 11, letterSpacing: 1.1, fontWeight: "800", marginTop: 20 }}>
            BACK TO SIGN IN →
          </Link>
        ) : null}
      </View>
    </View>
  );
}

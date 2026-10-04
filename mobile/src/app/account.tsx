import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandHeader, ErrorMessage, FormInput, PrimaryButton, colors, ui } from "../components/ui";
import { useAuth } from "../providers/auth-provider";
import { useCart } from "../providers/cart-provider";

export default function AccountScreen() {
  const { user, loading, googleReady, signInWithPassword, signInWithGoogle, signOut } = useAuth();
  const { itemCount } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSignIn(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Sign-in could not be completed."); }
    finally { setBusy(false); }
  }

  async function handleSignOut() {
    await signOut();
    Alert.alert("Signed out", "Your IXZZY app session has ended.");
  }

  return (
    <View style={ui.screen}>
      <BrandHeader count={itemCount} />
      <ScrollView contentContainerStyle={ui.scroll} keyboardShouldPersistTaps="handled">
        <Text style={ui.eyebrow}>YOUR IXZZY ACCOUNT</Text>
        <Text style={ui.title}>{user ? "Welcome back." : "Sign in."}</Text>
        {loading ? <ActivityIndicator style={{ marginTop: 24 }} color={colors.ink} /> : null}
        {user ? (
          <View style={styles.panel}>
            <Text style={styles.name}>{user.name || "IXZZY customer"}</Text>
            <Text style={ui.body}>{user.email}</Text>
            <Text style={[ui.body, { marginTop: 20 }]}>Your website and app use the same account and saved cart.</Text>
            <View style={{ marginTop: 24 }}><PrimaryButton title="SIGN OUT" onPress={() => void handleSignOut()} /></View>
          </View>
        ) : (
          <View style={ui.section}>
            <Text style={styles.label}>EMAIL</Text>
            <FormInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
            <Text style={[styles.label, { marginTop: 17 }]}>PASSWORD</Text>
            <FormInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Your password" />
            <ErrorMessage>{error}</ErrorMessage>
            <View style={{ marginTop: 18 }}>
              <PrimaryButton title="SIGN IN WITH EMAIL" loading={busy} disabled={loading} onPress={() => void runSignIn(() => signInWithPassword(email, password))} />
            </View>
            <View style={styles.divider}><View style={styles.rule} /><Text style={styles.or}>OR</Text><View style={styles.rule} /></View>
            <PrimaryButton title="CONTINUE WITH GOOGLE" loading={busy} disabled={!googleReady || loading} onPress={() => void runSignIn(signInWithGoogle)} />
            {!googleReady ? <Text style={styles.setup}>Google sign-in will be ready after the mobile Google client IDs are added to the app settings.</Text> : null}
            <Text style={styles.note}>Use the same account you use on ixzzy.vercel.app.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 10, letterSpacing: 1.4, fontWeight: "700", marginBottom: 7 },
  panel: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 18, marginTop: 24 },
  name: { color: colors.ink, fontSize: 19, fontWeight: "700", marginBottom: 5 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  or: { color: colors.muted, fontSize: 10, letterSpacing: 1.4 },
  setup: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 20 },
});

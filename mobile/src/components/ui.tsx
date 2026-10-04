import { Link } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const colors = {
  ink: "#10100e",
  muted: "#77766f",
  paper: "#f6f5f0",
  card: "#ffffff",
  line: "#deddd5",
  yellow: "#f0d91e",
  red: "#a43125",
};

export function BrandHeader({ count = 0 }: { count?: number }) {
  return (
    <View style={styles.header}>
      <Link href="/" style={styles.wordmark}>IXZZY<Text style={styles.dot}>.</Text></Link>
      <View style={styles.headerLinks}>
        <Link href="/account" style={styles.headerLink}>ACCOUNT</Link>
        <Link href="/cart" style={styles.headerLink}>CART ({count})</Link>
      </View>
    </View>
  );
}

export function PrimaryButton({ title, onPress, disabled, loading }: {
  title: string; onPress: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [styles.primaryButton, (pressed || disabled || loading) && styles.disabledButton]}>
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryButtonText}>{title}</Text>}
    </Pressable>
  );
}

export function ChoiceRow({ values, selected, onSelect }: {
  values: readonly string[]; selected: string; onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.choiceRow}>
      {values.map((value) => (
        <Pressable key={value} onPress={() => onSelect(value)} style={[styles.choice, selected === value && styles.choiceActive]}>
          <Text style={[styles.choiceText, selected === value && styles.choiceTextActive]}>{value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function FormInput(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor="#92918b" {...props} style={[styles.input, props.style]} />;
}

export function ErrorMessage({ children }: React.PropsWithChildren) {
  if (!children) return null;
  return <Text accessibilityRole="alert" style={styles.error}>{children}</Text>;
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  eyebrow: { color: colors.muted, fontSize: 11, letterSpacing: 1.8, fontWeight: "700" },
  title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: "700", marginTop: 9 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  section: { marginTop: 28 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
});

const styles = StyleSheet.create({
  header: { minHeight: 64, paddingHorizontal: 20, backgroundColor: colors.ink, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { color: colors.card, fontWeight: "800", letterSpacing: 2.1, fontSize: 18 },
  dot: { color: colors.yellow },
  headerLinks: { flexDirection: "row", alignItems: "center", gap: 18 },
  headerLink: { color: colors.card, fontSize: 10, letterSpacing: 1.1, fontWeight: "700" },
  primaryButton: { minHeight: 50, borderRadius: 3, backgroundColor: colors.yellow, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: colors.ink, fontSize: 13, fontWeight: "800", letterSpacing: 0.4 },
  disabledButton: { opacity: 0.55 },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, minHeight: 38, paddingHorizontal: 12, justifyContent: "center" },
  choiceActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  choiceText: { color: colors.ink, fontSize: 12 },
  choiceTextActive: { color: colors.card },
  input: { minHeight: 50, backgroundColor: colors.card, borderColor: colors.line, borderWidth: 1, paddingHorizontal: 14, color: colors.ink, fontSize: 15 },
  error: { color: colors.red, fontSize: 13, lineHeight: 19 },
});

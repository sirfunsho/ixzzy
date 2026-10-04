import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../providers/auth-provider";
import { CartProvider } from "../providers/cart-provider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f6f5f0" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="account" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="product/[slug]" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}

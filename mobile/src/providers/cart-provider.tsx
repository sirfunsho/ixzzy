import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "./auth-provider";

export type CartLine = { slug: string; colour: string; size: string; quantity: number };
type CartContextValue = {
  lines: CartLine[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addLine: (line: Omit<CartLine, "quantity">) => Promise<void>;
  changeQuantity: (line: CartLine, quantity: number) => Promise<void>;
  removeLine: (line: CartLine) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const sameLine = (a: CartLine, b: CartLine) =>
  a.slug === b.slug && a.colour === b.colour && a.size === b.size;

export function CartProvider({ children }: React.PropsWithChildren) {
  const { token, user } = useAuth();
  const userId = user?.id ?? null;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setLines([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<{ lines: CartLine[] }>("/api/cart", { method: "GET" }, token);
      setLines(result.lines);
      setOwnerUserId(userId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your cart could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(() => { void refreshCart(); }, 0);
    return () => clearTimeout(timer);
  }, [userId, refreshCart]);

  const updateCart = useCallback(async (change: (current: CartLine[]) => CartLine[]) => {
    if (!token) throw new Error("Sign in to use your saved cart.");
    setSaving(true);
    setError(null);
    try {
      // Read the latest shared cart before replacing it, so recent website edits stay intact.
      const current = await apiRequest<{ lines: CartLine[] }>("/api/cart", { method: "GET" }, token);
      const next = change(current.lines);
      const result = await apiRequest<{ lines: CartLine[] }>("/api/cart", {
        method: "PUT",
        body: JSON.stringify({ lines: next }),
      }, token);
      setLines(result.lines);
      setOwnerUserId(userId);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Your cart could not be saved.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, [token, userId]);

  const addLine = useCallback((line: Omit<CartLine, "quantity">) => updateCart((current) => {
    const previous = current.find((item) => sameLine(item, { ...line, quantity: 1 }));
    if (previous) return current.map((item) => sameLine(item, previous)
      ? { ...item, quantity: Math.min(99, item.quantity + 1) }
      : item);
    return [...current, { ...line, quantity: 1 }];
  }), [updateCart]);

  const changeQuantity = useCallback((line: CartLine, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return Promise.resolve();
    return updateCart((current) => current.map((item) => sameLine(item, line) ? { ...item, quantity } : item));
  }, [updateCart]);

  const removeLine = useCallback((line: CartLine) => updateCart((current) => current.filter((item) => !sameLine(item, line))), [updateCart]);
  const visibleLines = useMemo(() => userId === ownerUserId ? lines : [], [userId, ownerUserId, lines]);
  const itemCount = visibleLines.reduce((sum, line) => sum + line.quantity, 0);
  const value = useMemo(() => ({
    lines: visibleLines, loading, saving, error, itemCount, refreshCart, addLine, changeQuantity, removeLine,
  }), [visibleLines, loading, saving, error, itemCount, refreshCart, addLine, changeQuantity, removeLine]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

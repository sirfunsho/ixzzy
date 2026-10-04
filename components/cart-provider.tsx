"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { PRODUCTS } from "@/lib/catalog";
import type { CatalogueProduct } from "@/lib/catalog";

export type CartLine = {
  slug: string;
  colour: string;
  size: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  syncError: string;
  itemCount: number;
  cartPulse: number;
  addedProduct: CatalogueProduct | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  dismissAddedProduct: () => void;
  addItem: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "ixzzy-cart-v1";
const EMPTY_LINES: CartLine[] = [];
const CartContext = createContext<CartContextValue | null>(null);

export function cartLineKey(line: Omit<CartLine, "quantity"> | CartLine) {
  return `${line.slug}::${line.colour}::${line.size}`;
}

function validateLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const lines = new Map<string, CartLine>();
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const candidate = row as Partial<CartLine>;
    const product = PRODUCTS.find((item) => item.slug === candidate.slug);
    if (
      !product ||
      typeof candidate.colour !== "string" || !product.colours.includes(candidate.colour) ||
      typeof candidate.size !== "string" || !product.sizes.includes(candidate.size) ||
      typeof candidate.quantity !== "number" || !Number.isInteger(candidate.quantity) || candidate.quantity < 1
    ) continue;
    const line = {
      slug: product.slug,
      colour: candidate.colour,
      size: candidate.size,
      quantity: Math.min(candidate.quantity, 99),
    };
    const key = cartLineKey(line);
    const previous = lines.get(key);
    lines.set(key, { ...line, quantity: Math.min(99, line.quantity + (previous?.quantity ?? 0)) });
  }
  return [...lines.values()].slice(0, 40);
}

function readStoredLines(): CartLine[] {
  try {
    return validateLines(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function saveStoredLines(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Keep the current in-memory cart usable when browser storage is unavailable.
  }
}

function readResponseLines(value: unknown): CartLine[] {
  if (!value || typeof value !== "object" || !("lines" in value)) return [];
  return validateLines((value as { lines: unknown }).lines);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const [lines, setLines] = useState<CartLine[]>(EMPTY_LINES);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [isCartOpen, setCartOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(0);
  const [addedProduct, setAddedProduct] = useState<CatalogueProduct | null>(null);
  const linesRef = useRef<CartLine[]>(EMPTY_LINES);
  const readyRef = useRef(false);
  const queuedChanges = useRef<Array<(current: CartLine[]) => CartLine[]>>([]);
  const persistChain = useRef<Promise<void>>(Promise.resolve());
  const activeUserId = useRef<string | null>(null);
  const loadedOwnerId = useRef<string | null>(null);

  const persistSignedInCart = useCallback((forUser: string, nextLines: CartLine[]) => {
    persistChain.current = persistChain.current
      .catch(() => undefined)
      .then(async () => {
        if (activeUserId.current !== forUser) return;
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: nextLines }),
        });
        if (!response.ok) throw new Error("Cart could not be saved.");
        if (activeUserId.current === forUser) setSyncError("");
      })
      .catch(() => {
        if (activeUserId.current === forUser) {
          setSyncError("Your cart is visible, but it could not be saved to your account. Please try again.");
        }
      });
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;
    const signedInUserId = status === "authenticated" ? userId : null;
    activeUserId.current = signedInUserId;
    loadedOwnerId.current = null;
    readyRef.current = false;

    async function loadCart() {
      await Promise.resolve();
      if (cancelled) return;
      setReady(false);
      setSyncError("");
      let loadedLines: CartLine[];
      if (!signedInUserId) {
        loadedLines = readStoredLines();
      } else {
        try {
          const response = await fetch("/api/cart", { cache: "no-store" });
          if (!response.ok) throw new Error("Cart could not be loaded.");
          const remoteLines = readResponseLines(await response.json());
          const guestLines = readStoredLines();
          if (guestLines.length > 0) {
            const mergeResponse = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lines: guestLines }),
            });
            if (!mergeResponse.ok) throw new Error("Guest cart could not be merged.");
            loadedLines = readResponseLines(await mergeResponse.json());
            localStorage.removeItem(STORAGE_KEY);
          } else {
            loadedLines = remoteLines;
          }
          loadedOwnerId.current = signedInUserId;
        } catch {
          if (cancelled) return;
          setSyncError("Your saved cart could not be loaded. Refresh the page to try again.");
          loadedLines = [];
        }
      }
      if (cancelled) return;
      for (const change of queuedChanges.current) loadedLines = validateLines(change(loadedLines));
      const hadQueuedChanges = queuedChanges.current.length > 0;
      queuedChanges.current = [];
      linesRef.current = loadedLines;
      setLines(loadedLines);
      readyRef.current = true;
      setReady(true);
      if (hadQueuedChanges) {
        if (signedInUserId) persistSignedInCart(signedInUserId, loadedLines);
        else saveStoredLines(loadedLines);
      }
    }

    void loadCart();
    return () => {
      cancelled = true;
    };
  }, [persistSignedInCart, status, userId]);

  // Keep the website in sync when the phone changes the shared cart.
  // Before: website only loaded once, so you had to reload the page.
  // Now: re-check when you click back to the tab + every 10s while signed in.
  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    let stopped = false;
    async function refreshFromServer() {
      if (stopped || !readyRef.current) return;
      if (queuedChanges.current.length > 0) return;
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (!response.ok) return;
        const remoteLines = readResponseLines(await response.json());
        if (stopped || activeUserId.current !== userId) return;
        if (JSON.stringify(remoteLines) !== JSON.stringify(linesRef.current)) {
          linesRef.current = remoteLines;
          setLines(remoteLines);
        }
      } catch {
        // Keep the current cart visible; next tick will retry.
      }
    }
    const timer = setInterval(() => { void refreshFromServer(); }, 10_000);
    function onFocus() { void refreshFromServer(); }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => { stopped = true; clearInterval(timer); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); };
  }, [status, userId]);

  const changeCart = useCallback((change: (current: CartLine[]) => CartLine[]) => {
    if (!readyRef.current) {
      queuedChanges.current.push(change);
      return;
    }
    const nextLines = validateLines(change(linesRef.current));
    linesRef.current = nextLines;
    setLines(nextLines);
    const owner = activeUserId.current;
    if (owner) {
      if (loadedOwnerId.current === owner) persistSignedInCart(owner, nextLines);
    } else {
      saveStoredLines(nextLines);
    }
  }, [persistSignedInCart]);

  const openCart = useCallback(() => {
    setAddedProduct(null);
    setCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const dismissAddedProduct = useCallback(() => setAddedProduct(null), []);

  const addItem = useCallback((item: Omit<CartLine, "quantity">, quantity: number) => {
    const product = PRODUCTS.find((candidate) => candidate.slug === item.slug);
    if (!product || !Number.isInteger(quantity) || quantity < 1) return;
    setAddedProduct(product);
    setCartPulse((pulse) => pulse + 1);
    changeCart((current) => {
      const key = cartLineKey(item);
      const found = current.find((line) => cartLineKey(line) === key);
      return found
        ? current.map((line) => cartLineKey(line) === key ? { ...line, quantity: Math.min(99, line.quantity + quantity) } : line)
        : [...current, { ...item, quantity: Math.min(99, quantity) }];
    });
  }, [changeCart]);

  const setQuantity = useCallback((key: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    changeCart((current) => current.map((line) => cartLineKey(line) === key ? { ...line, quantity } : line));
  }, [changeCart]);
  const removeItem = useCallback((key: string) => {
    changeCart((current) => current.filter((line) => cartLineKey(line) !== key));
  }, [changeCart]);
  const clearCart = useCallback(() => changeCart(() => []), [changeCart]);

  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <CartContext.Provider value={{
      lines, ready, syncError, itemCount, cartPulse, addedProduct, isCartOpen,
      openCart, closeCart, dismissAddedProduct, addItem, setQuantity, removeItem, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

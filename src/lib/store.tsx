import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products as catalog, useCatalogVersion, variantPrice } from "@/data/catalog";
import type { Product } from "@/data/types";
import { SHIPPING_COST as COMPANY_SHIPPING } from "@/data/company";

export interface CartLine {
  productId: string;
  variant: string | null;
  quantity: number;
}

interface StoreValue {
  cart: CartLine[];
  wishlist: string[];
  hydrated: boolean;
  addToCart: (productId: string, quantity?: number, variant?: string | null) => void;
  updateQuantity: (productId: string, variant: string | null, quantity: number) => void;
  removeFromCart: (productId: string, variant: string | null) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  cartLines: Array<CartLine & { product: Product; unitPrice: number }>;
  totals: { subtotal: number; discount: number; shipping: number; total: number };
}

const CART_KEY = "bijuterii.cart";
const WISHLIST_KEY = "bijuterii.wishlist";
const FREE_SHIPPING_THRESHOLD = COMPANY_FREE_SHIPPING;
const SHIPPING_COST = COMPANY_SHIPPING;

const StoreContext = createContext<StoreValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStorage<CartLine[]>(CART_KEY, []));
    setWishlist(readStorage<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback(
    (productId: string, quantity = 1, variant: string | null = null) => {
      setCart((prev) => {
        const idx = prev.findIndex((l) => l.productId === productId && l.variant === variant);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx]!, quantity: next[idx]!.quantity + quantity };
          return next;
        }
        return [...prev, { productId, variant, quantity }];
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, variant: string | null, quantity: number) => {
      setCart((prev) =>
        quantity <= 0
          ? prev.filter((l) => !(l.productId === productId && l.variant === variant))
          : prev.map((l) =>
              l.productId === productId && l.variant === variant ? { ...l, quantity } : l,
            ),
      );
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, variant: string | null) => {
    setCart((prev) => prev.filter((l) => !(l.productId === productId && l.variant === variant)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const catalogVersion = useCatalogVersion();

  const value = useMemo<StoreValue>(() => {
    void catalogVersion;
    const cartLines = cart
      .map((line) => {
        const product = catalog.find((p) => p.id === line.productId);
        if (!product) return null;
        return { ...line, product, unitPrice: variantPrice(product, line.variant) };
      })
      .filter((l): l is CartLine & { product: Product; unitPrice: number } => l !== null);

    const subtotal = cartLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const discount = cartLines.reduce(
      (sum, l) => sum + (l.product.oldPrice ? (l.product.oldPrice - l.unitPrice) * l.quantity : 0),
      0,
    );
    const shipping = subtotal === 0 ? 0 : SHIPPING_COST;

    return {
      cart,
      wishlist,
      hydrated,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist: (id: string) => wishlist.includes(id),
      cartCount: cart.reduce((sum, l) => sum + l.quantity, 0),
      cartLines,
      totals: { subtotal, discount, shipping, total: subtotal + shipping },
};
  }, [
    cart,
    wishlist,
    hydrated,
    catalogVersion,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore trebuie folosit în interiorul StoreProvider");
  return ctx;
}

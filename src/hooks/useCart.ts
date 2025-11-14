import { useState, useEffect, useCallback } from "react";
import { cartAPI } from "../services/api"; 

interface CartItem {
  productId: number;
  quantity: number;
  addedAt: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  description: string;
  rating: number;
  stock: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export function useCart(user: User | null) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch cart from YOUR backend
  useEffect(() => {
    async function fetchUserCart() {
      if (!user?.id) {
        setCart([]);
        return;
      }

      try {
        setLoading(true);
        console.log(`🛒 Fetching cart for user ${user.id} from YOUR backend`);

        const cartData = await cartAPI.getCart(user.id);

        // Convert backend format to frontend format
        const formattedCart = cartData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt || Date.now(),
        }));

        setCart(formattedCart);
        console.log("✅ Cart loaded:", formattedCart);
      } catch (err) {
        console.error("❌ Failed to fetch cart:", err);
        setCart([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserCart();
  }, [user]);

  //Add to cart - calls backend
  const addToCart = useCallback(
    async (product: Product) => {
      if (!user?.id) return;

      try {
        // Optimistic update
        setCart((prev) => {
          const existing = prev.find((item) => item.productId === product.id);
          if (existing) {
            return prev.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [
              ...prev,
              { productId: product.id, quantity: 1, addedAt: Date.now() },
            ];
          }
        });

        // Call backend
        await cartAPI.addToCart(user.id, product.id, 1);
        console.log(`✅ Added ${product.title} to cart (backend)`);
      } catch (error) {
        console.error("❌ Failed to add to cart:", error);
        // Revert optimistic update by refetching
        const cartData = await cartAPI.getCart(user.id);
        const formattedCart = cartData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt || Date.now(),
        }));
        setCart(formattedCart);
      }
    },
    [user]
  );

  // Remove from cart - calls backend
  const removeFromCart = useCallback(
    async (productId: number) => {
      if (!user?.id) return;

      try {
        // Optimistic update
        setCart((prev) => prev.filter((item) => item.productId !== productId));

        // Call backend
        await cartAPI.removeFromCart(user.id, productId);
        console.log(`✅ Removed product ${productId} from cart (backend)`);
      } catch (error) {
        console.error("❌ Failed to remove from cart:", error);
        // Revert by refetching
        const cartData = await cartAPI.getCart(user.id);
        const formattedCart = cartData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt || Date.now(),
        }));
        setCart(formattedCart);
      }
    },
    [user]
  );

  // Update quantity - calls backend
  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!user?.id) return;

      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }

      try {
        // Optimistic update
        setCart((prev) =>
          prev.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        );

        // Call backend
        await cartAPI.updateCartItem(user.id, productId, quantity);
        console.log(`✅ Updated quantity for product ${productId} (backend)`);
      } catch (error) {
        console.error("❌ Failed to update quantity:", error);
        // Revert by refetching
        const cartData = await cartAPI.getCart(user.id);
        const formattedCart = cartData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt || Date.now(),
        }));
        setCart(formattedCart);
      }
    },
    [user, removeFromCart]
  );

  //Clear cart - calls backend
  const clearCart = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Optimistic update
      setCart([]);

      // Call backend
      await cartAPI.clearCart(user.id);
      console.log("✅ Cleared cart (backend)");
    } catch (error) {
      console.error("❌ Failed to clear cart:", error);
    }
  }, [user]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  };
}

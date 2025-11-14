import { createContext, useContext, type ReactNode } from "react";
import { useCart } from "../hooks/useCart";

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
  token?: string;
  refreshToken?: string;
}

// Define what the context will provide
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
interface CartProviderProps {
  children: ReactNode;
  user: User | null;
}

export function CartProvider({ children, user }: CartProviderProps) {
  const cartData = useCart(user);

  return (
    <CartContext.Provider value={cartData}>{children}</CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCartContext() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }

  return context;
}
